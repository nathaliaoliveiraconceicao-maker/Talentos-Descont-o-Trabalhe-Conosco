/**
 * Script para criar (ou vincular) um usuário administrativo do painel Talentos
 * Descontão. Uso: npm run create-admin
 *
 * Garante que exista, ao mesmo tempo:
 *   1. um usuário no Firebase Authentication (e-mail/senha) e
 *   2. um documento em /admins/{uid} no Firestore, com esse MESMO uid.
 *
 * Isso é necessário porque o app autoriza o acesso lendo admins/{user.uid} —
 * se o documento no Firestore foi criado manualmente (pelo Console) com um ID
 * que não é o uid real do usuário no Authentication, o login falha mesmo com
 * a senha correta. Este script cobre os cenários possíveis:
 *
 *   - Nem o usuário no Authentication nem o documento no Firestore existem:
 *     cria os dois, já vinculados pelo mesmo uid (gerado pelo Authentication).
 *   - Já existe um documento em admins/{docId} com este e-mail, mas nenhum
 *     usuário no Authentication: cria o usuário no Authentication usando
 *     exatamente esse docId como uid, para os dois ficarem alinhados.
 *   - Já existe um usuário no Authentication com este e-mail, mas nenhum
 *     documento correspondente no Firestore: cria o documento em
 *     admins/{uid} usando o uid real do Authentication.
 *   - Os dois já existem: se os IDs já batem, apenas atualiza a senha; se
 *     NÃO batem (documento "órfão" com ID diferente do uid real), move os
 *     dados do documento para admins/{uid} (o uid real) e remove o
 *     documento antigo, para corrigir o vínculo.
 */
import readlineSync from 'readline-sync';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { initFirebaseAdmin } from './firebaseAdmin';

const ADMINS_COLLECTION = 'admins';

async function findAdminDocByEmail(db: Firestore, email: string) {
  const snapshot = await db.collection(ADMINS_COLLECTION).where('email', '==', email).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

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

  console.log('\n=== Criar/vincular usuário administrativo (legado) — VagaHub ===\n');

  const name = readlineSync.question('Nome completo: ').trim();
  const email = readlineSync.questionEMail('E-mail de acesso: ').trim().toLowerCase();
  const password = readlineSync.question('Senha (mínimo 6 caracteres): ', { hideEchoBack: true });

  if (password.length < 6) {
    console.error('❌ A senha deve ter ao menos 6 caracteres.');
    process.exit(1);
  }

  const existingDoc = await findAdminDocByEmail(db, email);
  const existingAuthUser = await findAuthUserByEmail(auth, email);

  let userRecord: UserRecord;
  let role: 'admin' | 'rh';
  let active: boolean;

  if (existingAuthUser && existingDoc) {
    if (existingAuthUser.uid === existingDoc.id) {
      // Já vinculados corretamente — só atualiza a senha.
      console.log('ℹ️  Usuário e documento já vinculados corretamente. Atualizando a senha…');
      userRecord = await auth.updateUser(existingAuthUser.uid, { password, displayName: name });
    } else {
      // Documento "órfão": o e-mail está correto, mas o ID do documento não
      // é o uid real do usuário no Authentication. Move os dados do
      // documento para o local correto e remove o antigo.
      console.log(
        `⚠️  Encontrado documento admins/${existingDoc.id} desalinhado com o uid real do Authentication (${existingAuthUser.uid}). Corrigindo…`
      );
      userRecord = await auth.updateUser(existingAuthUser.uid, { password, displayName: name });
      const oldData = existingDoc.data();
      await db.collection(ADMINS_COLLECTION).doc(existingDoc.id).delete();
      role = (oldData.role as 'admin' | 'rh') ?? 'admin';
      active = oldData.active !== false;
      await db
        .collection(ADMINS_COLLECTION)
        .doc(userRecord.uid)
        .set({ uid: userRecord.uid, email, name, role, active, createdAt: oldData.createdAt ?? new Date().toISOString() });
      console.log(`✅ Documento movido para admins/${userRecord.uid}. Concluído.\n`);
      console.log(`   Papel: ${role} · Ativo: ${active}`);
      console.log('   O usuário já pode acessar /admin/login com o e-mail e a nova senha definidos.\n');
      process.exit(0);
    }
    role = (existingDoc.data().role as 'admin' | 'rh') ?? 'admin';
    active = existingDoc.data().active !== false;
  } else if (existingDoc && !existingAuthUser) {
    // Documento existe no Firestore, mas falta o usuário no Authentication.
    // Cria o usuário com o MESMO uid do documento, para ficarem vinculados.
    console.log(`ℹ️  Documento admins/${existingDoc.id} encontrado sem usuário correspondente no Authentication.`);
    console.log(`   Criando o usuário no Authentication com uid = ${existingDoc.id}…`);
    userRecord = await auth.createUser({ uid: existingDoc.id, email, password, displayName: name });
    role = (existingDoc.data().role as 'admin' | 'rh') ?? 'admin';
    active = existingDoc.data().active !== false;
  } else if (existingAuthUser && !existingDoc) {
    // Usuário existe no Authentication, mas falta o documento no Firestore.
    console.log('ℹ️  Usuário já existe no Authentication. Criando o documento em admins/{uid}…');
    userRecord = await auth.updateUser(existingAuthUser.uid, { password, displayName: name });
    role = readlineSync.keyInSelect(['admin', 'rh'], 'Papel de acesso:') === 1 ? 'rh' : 'admin';
    active = true;
  } else {
    // Nenhum dos dois existe: fluxo original, cria os dois do zero.
    userRecord = await auth.createUser({ email, password, displayName: name });
    role = readlineSync.keyInSelect(['admin', 'rh'], 'Papel de acesso:') === 1 ? 'rh' : 'admin';
    active = true;
  }

  await db
    .collection(ADMINS_COLLECTION)
    .doc(userRecord.uid)
    .set(
      {
        uid: userRecord.uid,
        email,
        name,
        role,
        active,
        createdAt: existingDoc?.data().createdAt ?? new Date().toISOString(),
      },
      { merge: true }
    );

  console.log('\n✅ Usuário administrativo pronto!');
  console.log(`   UID: ${userRecord.uid}`);
  console.log(`   E-mail: ${email}`);
  console.log(`   Papel: ${role} · Ativo: ${active}`);
  console.log('   Ele já pode acessar /admin/login com o e-mail e a senha definidos.\n');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro ao criar/vincular administrador:', error);
  process.exit(1);
});
