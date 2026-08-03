import { deleteApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signOut as signOutSecondary } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firebaseConfig, db } from './firebase';
import { getTenantUserByEmail, listTenantUsers } from './adminApi';
import { getTenant } from './tenantApi';
import { getPlan } from './plansApi';
import { logAuditEvent } from './auditLog';
import type { AdminUser, InvitationStatus, TenantRole } from '@/types/admin';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function inviteRedirectUrl(): string {
  return `${window.location.origin}/app/login`;
}

/**
 * Dispara o e-mail que funciona como convite: o Firebase Authentication não
 * tem um e-mail nativo de "convite" — o mecanismo real usado aqui é o de
 * redefinição de senha (a pessoa nunca teve senha para "redefinir", mas o
 * link funciona igual: ela define a senha pela primeira vez ali). O texto
 * exibido nesse e-mail é configurado em Firebase Authentication → Modelos →
 * Redefinição de senha (ver README).
 */
async function sendInviteEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(getAuth(), email, { url: inviteRedirectUrl() });
}

export interface InviteTenantUserInput {
  tenantId: string;
  name: string;
  email: string;
  role: TenantRole;
  invitedBy: string;
}

export interface InviteTenantUserResult {
  uid: string;
  reused: boolean;
}

/**
 * Convida (ou reenvia convite para) um usuário de um tenant. Nunca cria,
 * mostra ou armazena uma senha definida por um humano: a conta é criada com
 * uma senha aleatória descartada imediatamente, e a definição real de senha
 * acontece pelo e-mail de redefinição enviado ao final.
 */
export async function inviteTenantUser(input: InviteTenantUserInput): Promise<InviteTenantUserResult> {
  const email = normalizeEmail(input.email);

  const existingInTenant = await getTenantUserByEmail(input.tenantId, email);
  if (existingInTenant) {
    await resendInvite(input.tenantId, existingInTenant.uid, input.invitedBy);
    return { uid: existingInTenant.uid, reused: true };
  }

  const [tenant, existingUsers] = await Promise.all([
    getTenant(input.tenantId),
    listTenantUsers(input.tenantId),
  ]);
  const plan = tenant ? await getPlan(tenant.planId) : null;
  if (plan && existingUsers.length >= plan.maxUsers) {
    throw new Error(
      `O plano "${plan.name}" deste cliente permite no máximo ${plan.maxUsers} usuário(s). Atualize o plano para adicionar mais.`
    );
  }

  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  let uid: string;
  try {
    const secondaryAuth = getAuth(secondaryApp);
    // Senha jogada fora: nunca é exibida, logada, retornada ou gravada — só
    // existe para satisfazer a assinatura de createUserWithEmailAndPassword.
    // Assim que a variável sai de escopo, ninguém (nem o administrador que
    // convidou) tem como recuperá-la; a pessoa convidada sempre define a
    // própria senha pelo link de redefinição enviado logo abaixo.
    const throwawayPassword = crypto.randomUUID() + crypto.randomUUID();
    try {
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, throwawayPassword);
      uid = credential.user.uid;
      await signOutSecondary(secondaryAuth);
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === 'auth/email-already-in-use') {
        throw new Error(
          `Já existe uma conta no Firebase Authentication com o e-mail ${email}, mas ela não está vinculada a nenhum usuário deste tenant. ` +
            'Isso acontece quando a conta pertence a outro cliente ou ficou órfã. ' +
            'Peça a um administrador para rodar "npm run link-existing-user" (script local, fora do navegador) para vincular essa conta a este tenant.'
        );
      }
      throw error;
    }
  } finally {
    await deleteApp(secondaryApp);
  }

  const nowIso = new Date().toISOString();
  await setDoc(doc(db, 'userIndex', uid), { tenantId: input.tenantId });
  await setDoc(doc(db, 'tenants', input.tenantId, 'users', uid), {
    uid,
    tenantId: input.tenantId,
    name: input.name.trim(),
    email,
    role: input.role,
    active: true,
    invitationStatus: 'pending' satisfies InvitationStatus,
    invitedAt: nowIso,
    invitedBy: input.invitedBy,
    invitationSentAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  await sendInviteEmail(email);

  await logAuditEvent({
    tenantId: input.tenantId,
    actorUid: auth.currentUser?.uid ?? '',
    actorName: input.invitedBy,
    action: 'user_invited',
    targetType: 'user',
    targetId: uid,
    details: { email, role: input.role },
  });

  return { uid, reused: false };
}

async function findTenantUser(tenantId: string, uid: string): Promise<AdminUser> {
  const users = await listTenantUsers(tenantId);
  const found = users.find((u) => u.uid === uid);
  if (!found) throw new Error('Usuário não encontrado neste tenant.');
  return found;
}

/** Reenvia o e-mail de definição de senha, sem criar conta nem alterar o tenant. */
export async function resendInvite(tenantId: string, uid: string, actorName: string): Promise<void> {
  const target = await findTenantUser(tenantId, uid);
  await sendInviteEmail(target.email);

  const nowIso = new Date().toISOString();
  await updateDoc(doc(db, 'tenants', tenantId, 'users', uid), {
    invitationSentAt: nowIso,
    updatedAt: nowIso,
  });

  const isFirstAccessPending = !target.invitationStatus || target.invitationStatus === 'pending';
  await logAuditEvent({
    tenantId,
    actorUid: auth.currentUser?.uid ?? '',
    actorName,
    action: isFirstAccessPending ? 'invite_resent' : 'password_reset_requested_by_admin',
    targetType: 'user',
    targetId: uid,
    details: { email: target.email },
  });
}

/** Cancela um convite pendente — nunca exclui o usuário. */
export async function cancelInvite(tenantId: string, uid: string, actorName: string): Promise<void> {
  const target = await findTenantUser(tenantId, uid);
  await updateDoc(doc(db, 'tenants', tenantId, 'users', uid), {
    invitationStatus: 'canceled' satisfies InvitationStatus,
    updatedAt: new Date().toISOString(),
  });
  await logAuditEvent({
    tenantId,
    actorUid: auth.currentUser?.uid ?? '',
    actorName,
    action: 'invite_canceled',
    targetType: 'user',
    targetId: uid,
    details: { email: target.email },
  });
}

export async function toggleUserActive(tenantId: string, uid: string, active: boolean, actorName: string): Promise<void> {
  const target = await findTenantUser(tenantId, uid);
  await updateDoc(doc(db, 'tenants', tenantId, 'users', uid), {
    active,
    updatedAt: new Date().toISOString(),
  });
  await logAuditEvent({
    tenantId,
    actorUid: auth.currentUser?.uid ?? '',
    actorName,
    action: active ? 'user_activated' : 'user_deactivated',
    targetType: 'user',
    targetId: uid,
    details: { email: target.email },
  });
}

export async function changeUserRole(tenantId: string, uid: string, role: TenantRole, actorName: string): Promise<void> {
  const target = await findTenantUser(tenantId, uid);
  await updateDoc(doc(db, 'tenants', tenantId, 'users', uid), {
    role,
    updatedAt: new Date().toISOString(),
  });
  await logAuditEvent({
    tenantId,
    actorUid: auth.currentUser?.uid ?? '',
    actorName,
    action: 'role_changed',
    targetType: 'user',
    targetId: uid,
    details: { email: target.email, from: target.role, to: role },
  });
}

/**
 * Chamado pelo AuthContext em todo login bem-sucedido (não bloqueado) de um
 * usuário de tenant. Grava só os campos de rastreamento de login — é
 * exatamente o que a regra de autoedição do Firestore permite que o próprio
 * usuário grave (ver firestore.rules, match /users/{uid}).
 */
export async function recordLoginBookkeeping(
  tenantId: string,
  uid: string,
  current: Pick<AdminUser, 'invitationStatus' | 'passwordConfiguredAt' | 'firstLoginAt'>
): Promise<void> {
  const nowIso = new Date().toISOString();
  const wasPendingOrUnset = !current.invitationStatus || current.invitationStatus === 'pending';
  await updateDoc(doc(db, 'tenants', tenantId, 'users', uid), {
    lastLoginAt: nowIso,
    updatedAt: nowIso,
    ...(wasPendingOrUnset ? { invitationStatus: 'accepted' satisfies InvitationStatus } : {}),
    ...(!current.passwordConfiguredAt ? { passwordConfiguredAt: nowIso } : {}),
    ...(!current.firstLoginAt ? { firstLoginAt: nowIso } : {}),
  });
}
