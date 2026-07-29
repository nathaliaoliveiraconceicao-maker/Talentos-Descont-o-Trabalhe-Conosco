/**
 * Script para criar um administrador do painel Talentos Descontão.
 * Uso: npm run create-admin
 *
 * Cria o usuário no Firebase Authentication e o respectivo documento em
 * /admins/{uid} no Firestore, com active = true.
 */
import readlineSync from 'readline-sync';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdmin } from './firebaseAdmin';

async function main() {
  initFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore();

  console.log('\n=== Criar administrador — Talentos Descontão ===\n');

  const name = readlineSync.question('Nome completo: ').trim();
  const email = readlineSync.questionEMail('E-mail de acesso: ');
  const password = readlineSync.question('Senha temporária (mínimo 6 caracteres): ', {
    hideEchoBack: true,
  });
  const role = readlineSync.keyInSelect(['admin', 'rh'], 'Papel de acesso:') === 1 ? 'rh' : 'admin';

  if (password.length < 6) {
    console.error('❌ A senha deve ter ao menos 6 caracteres.');
    process.exit(1);
  }

  let userRecord;
  try {
    userRecord = await auth.createUser({ email, password, displayName: name });
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === 'auth/email-already-exists') {
      console.log('ℹ️  Usuário já existe no Authentication. Reaproveitando a conta existente.');
      userRecord = await auth.getUserByEmail(email);
    } else {
      throw error;
    }
  }

  await db
    .collection('admins')
    .doc(userRecord.uid)
    .set({
      uid: userRecord.uid,
      email,
      name,
      role,
      active: true,
      createdAt: new Date().toISOString(),
    });

  console.log('\n✅ Usuário administrativo criado com sucesso!');
  console.log(`   UID: ${userRecord.uid}`);
  console.log(`   E-mail: ${email}`);
  console.log(`   Papel: ${role}`);
  console.log('   Ele já pode acessar /admin/login com o e-mail e a senha definidos.\n');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro ao criar administrador:', error);
  process.exit(1);
});
