/**
 * Script para criar (ou vincular) um usuário SUPERADMIN da plataforma —
 * acesso a /superadmin/*, com visão de todos os tenants. Uso: npm run
 * create-superadmin
 *
 * É o único jeito de criar o primeiro superadmin: o painel /superadmin não
 * tem tela de "criar minha própria conta" (isso seria um jeito fácil de
 * qualquer visitante virar superadmin), então o primeiro precisa ser
 * criado por aqui, com a chave da conta de serviço.
 *
 * Garante que exista, ao mesmo tempo:
 *   1. um usuário no Firebase Authentication (e-mail/senha) e
 *   2. um documento em /platformAdmins/{uid} no Firestore, com esse MESMO
 *      uid — o app autoriza o acesso ao painel do superadmin lendo
 *      platformAdmins/{user.uid} com active === true.
 */
import readlineSync from 'readline-sync';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdmin } from './firebaseAdmin';

const PLATFORM_ADMINS_COLLECTION = 'platformAdmins';

async function findAuthUserByEmail(auth: ReturnType<typeof getAuth>, email: string): Promise<UserRecord | null> {
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === 'auth/user-not-found') return null;
    throw error;
  }
}

async function main() {
  initFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore();

  console.log('\n=== Criar/vincular usuário SUPERADMIN da plataforma ===\n');

  const name = readlineSync.question('Nome completo: ').trim();
  const email = readlineSync.questionEMail('E-mail de acesso: ').trim().toLowerCase();
  const password = readlineSync.question('Senha (mínimo 6 caracteres): ', { hideEchoBack: true });

  if (password.length < 6) {
    console.error('❌ A senha deve ter ao menos 6 caracteres.');
    process.exit(1);
  }

  const existingAuthUser = await findAuthUserByEmail(auth, email);

  const userRecord = existingAuthUser
    ? await auth.updateUser(existingAuthUser.uid, { password, displayName: name })
    : await auth.createUser({ email, password, displayName: name });

  const existingDocSnap = await db.collection(PLATFORM_ADMINS_COLLECTION).doc(userRecord.uid).get();

  await db
    .collection(PLATFORM_ADMINS_COLLECTION)
    .doc(userRecord.uid)
    .set(
      {
        uid: userRecord.uid,
        email,
        name,
        active: true,
        createdAt: existingDocSnap.exists ? existingDocSnap.data()!.createdAt : new Date().toISOString(),
      },
      { merge: true }
    );

  console.log('\n✅ Superadmin pronto!');
  console.log(`   UID: ${userRecord.uid}`);
  console.log(`   E-mail: ${email}`);
  console.log('   Ele já pode acessar /superadmin/login com o e-mail e a senha definidos.\n');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro ao criar/vincular superadmin:', error);
  process.exit(1);
});
