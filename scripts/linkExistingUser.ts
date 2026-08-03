/**
 * Vincula uma conta do Firebase Authentication que JÁ EXISTE (em outro
 * tenant, ou órfã) a um novo tenant. Uso raro: o painel do superadmin/painel
 * do cliente resolve automaticamente os dois casos comuns — e-mail novo
 * (cria a conta) e reenvio de convite para alguém do mesmo tenant (reusa o
 * UID já salvo no Firestore) — mas não consegue, pelo SDK do navegador,
 * buscar o UID de uma conta pelo e-mail quando ela existe em outro
 * contexto (o Firebase não expõe essa busca fora do Admin SDK, por design
 * de privacidade). Este script cobre esse caso raro.
 *
 * Uso: npm run link-existing-user -- <email> <tenantId> <role>
 * Ex.: npm run link-existing-user -- ana@empresa.com cliente02 admin
 *
 * Não define nem altera a senha da pessoa — só cria o vínculo
 * (tenants/{tenantId}/users/{uid} + userIndex/{uid}). Se ela ainda não
 * tiver definido senha nesta conta, dispare um convite pela interface
 * (botão "Reenviar convite") depois de rodar este script.
 */
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdmin } from './firebaseAdmin';

const VALID_ROLES = ['owner', 'admin', 'rh', 'viewer'];

async function main() {
  const [email, tenantId, role] = process.argv.slice(2);
  if (!email || !tenantId || !role) {
    console.error('Uso: npm run link-existing-user -- <email> <tenantId> <role>');
    process.exit(1);
  }
  if (!VALID_ROLES.includes(role)) {
    console.error(`❌ Papel inválido: "${role}". Use um de: ${VALID_ROLES.join(', ')}.`);
    process.exit(1);
  }

  initFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore();

  const normalizedEmail = email.trim().toLowerCase();

  const tenantSnap = await db.collection('tenants').doc(tenantId).get();
  if (!tenantSnap.exists) {
    console.error(`❌ tenants/${tenantId} não existe.`);
    process.exit(1);
  }

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(normalizedEmail);
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === 'auth/user-not-found') {
      console.error(
        `❌ Não existe nenhuma conta no Firebase Authentication com o e-mail ${normalizedEmail}. ` +
          'Se o e-mail é realmente novo, use o convite normal pela interface (não precisa deste script).'
      );
      process.exit(1);
    }
    throw error;
  }

  const existingLink = await db.collection('userIndex').doc(userRecord.uid).get();
  if (existingLink.exists && existingLink.data()?.tenantId !== tenantId) {
    console.warn(
      `⚠️  Esta conta já está vinculada ao tenant "${existingLink.data()?.tenantId}". ` +
        `Vinculando também a "${tenantId}" agora — a pessoa passa a ter acesso aos dois, ` +
        'mas o login (userIndex) sempre resolve para o tenant mais recente definido aqui.'
    );
  }

  const nowIso = new Date().toISOString();
  const existingTenantUser = await db.collection('tenants').doc(tenantId).collection('users').doc(userRecord.uid).get();

  await db.collection('userIndex').doc(userRecord.uid).set({ tenantId }, { merge: true });
  await db
    .collection('tenants')
    .doc(tenantId)
    .collection('users')
    .doc(userRecord.uid)
    .set(
      {
        uid: userRecord.uid,
        tenantId,
        name: userRecord.displayName ?? existingTenantUser.data()?.name ?? normalizedEmail,
        email: normalizedEmail,
        role,
        active: true,
        invitationStatus: existingTenantUser.data()?.invitationStatus ?? 'accepted',
        updatedAt: nowIso,
        createdAt: existingTenantUser.data()?.createdAt ?? nowIso,
      },
      { merge: true }
    );

  console.log(`\n✅ Conta ${normalizedEmail} (uid: ${userRecord.uid}) vinculada a tenants/${tenantId} com papel "${role}".`);
  console.log('   Se a pessoa ainda não tem senha definida nesta conta, envie um convite pela interface (botão "Reenviar convite").\n');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro ao vincular usuário existente:', error);
  process.exit(1);
});
