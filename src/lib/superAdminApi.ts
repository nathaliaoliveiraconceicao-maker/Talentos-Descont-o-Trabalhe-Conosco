import { deleteApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signOut as signOutSecondary } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseConfig, db } from './firebase';
import { listTenantUsers } from './adminApi';
import { getTenant } from './tenantApi';
import { getPlan } from './plansApi';
import type { TenantRole } from '@/types/admin';

export interface CreateTenantUserInput {
  tenantId: string;
  name: string;
  email: string;
  password: string;
  role: TenantRole;
}

/**
 * Cria um usuário (Authentication + Firestore) vinculado a um tenant, a
 * partir do painel do superadmin.
 *
 * Por que não usamos o Firebase Admin SDK aqui: este projeto não tem um
 * backend próprio (Cloud Functions), e a política de segurança do projeto
 * proíbe expor a chave de conta de serviço no frontend. Em vez disso:
 *
 * 1. Criamos o usuário no Authentication usando um app Firebase SECUNDÁRIO
 *    e temporário — isso usa apenas a capacidade pública e padrão de
 *    "cadastro por e-mail/senha" do Firebase Auth (a mesma que qualquer
 *    pessoa não autenticada já poderia acionar) e, por rodar em uma
 *    instância separada, NÃO afeta a sessão do superadmin logado no app
 *    principal.
 * 2. Gravamos os documentos em userIndex/{uid} e
 *    tenants/{tenantId}/users/{uid} usando a sessão do PRÓPRIO superadmin
 *    (app principal) — essa gravação só é permitida pelas Firestore Rules
 *    para quem já é superadmin autenticado, então o passo realmente
 *    privilegiado continua protegido no servidor (rules), não no cliente.
 *
 * Em uma evolução futura com Cloud Functions, este fluxo pode ser
 * substituído por uma função HTTPS callable usando o Admin SDK no servidor.
 */
export async function createTenantUser(input: CreateTenantUserInput): Promise<{ uid: string }> {
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
  try {
    const secondaryAuth = getAuth(secondaryApp);
    const credential = await createUserWithEmailAndPassword(secondaryAuth, input.email, input.password);
    const uid = credential.user.uid;
    await signOutSecondary(secondaryAuth);

    const nowIso = new Date().toISOString();
    await setDoc(doc(db, 'userIndex', uid), { tenantId: input.tenantId });
    await setDoc(doc(db, 'tenants', input.tenantId, 'users', uid), {
      uid,
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      role: input.role,
      active: true,
      createdAt: nowIso,
    });

    return { uid };
  } finally {
    await deleteApp(secondaryApp);
  }
}
