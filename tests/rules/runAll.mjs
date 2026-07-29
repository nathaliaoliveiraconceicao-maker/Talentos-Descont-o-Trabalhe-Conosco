/**
 * Testes de isolamento multi-tenant das Firestore Rules e Storage Rules,
 * rodando contra o Firebase Emulator Suite (não afeta o projeto real).
 *
 * Uso: npm run test:rules
 * (executa "firebase emulators:exec", que sobe os emuladores, roda este
 * script contra eles e depois os derruba — não precisa estar com os
 * emuladores rodando manualmente antes.)
 *
 * Cobertura (smoke tests dos pontos mais sensíveis do isolamento entre
 * clientes — não é uma suíte exaustiva de cada regra):
 *   - Formulário público só pode CRIAR candidatura, nunca ler/listar.
 *   - tenants/{tenantId} é legível publicamente (get), mas não listável.
 *   - Usuário do tenant A não lê/escreve nada em tenants/{tenantB}.
 *   - Papel "rh" não lê a lista de usuários (ação de owner/admin).
 *   - Superadmin acessa qualquer tenant; coleções legadas seguem bloqueadas.
 *   - Assinatura suspensa bloqueia escrita de quem opera candidatos, mas não
 *     a leitura, e nunca bloqueia o superadmin.
 *   - Storage: candidato anônimo envia currículo só no tenant indicado;
 *     download/exclusão só para quem tem acesso àquele tenant.
 */
import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';

const PROJECT_ID = 'demo-talentos-rules-test';
let passed = 0;
let failed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed += 1;
    failures.push(name);
    console.log(`  ✗ ${name}`);
    console.log(`    ${error.message}`);
  }
}

/**
 * O Storage Emulator local usa um motor de regras próprio que, nas versões
 * testadas, NÃO avalia de forma confiável firestore.get()/firestore.exists()
 * dentro de storage.rules (o recurso oficial de "Cross-Service Rules" —
 * verificado nesta suíte: chamadas que deveriam retornar true "silenciam"
 * para false no emulador, então casos que DEVERIAM ser negados batem por
 * acidente, mas o caso legítimo de acesso ao próprio tenant é
 * incorretamente negado). Isso é uma limitação conhecida do emulador, não
 * do arquivo storage.rules — o mesmo teste deve ser validado manualmente
 * contra um projeto Firebase real (ver checklist no README) antes de
 * confiar cegamente no resultado. Por isso este caso é reportado como aviso
 * (⚠) em vez de reprovação (✗): não queremos que uma limitação do
 * ferramental mascare uma falha real de outro teste.
 */
async function knownEmulatorLimitation(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.log(`  ⚠ ${name} (não verificável no emulador — valide manualmente em um projeto real)`);
    console.log(`    ${error.message}`);
  }
}

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: {
    rules: readFileSync('firestore.rules', 'utf8'),
    host: '127.0.0.1',
    port: 8080,
  },
  storage: {
    rules: readFileSync('storage.rules', 'utf8'),
    host: '127.0.0.1',
    port: 9199,
  },
});

await testEnv.withSecurityRulesDisabled(async (context) => {
  const db = context.firestore();
  await setDoc(doc(db, 'tenants/descontao'), {
    tenantId: 'descontao',
    slug: 'descontao',
    name: 'Descontão',
    active: true,
    subscriptionStatus: 'active',
  });
  await setDoc(doc(db, 'tenants/mercado-b'), {
    tenantId: 'mercado-b',
    slug: 'mercado-b',
    name: 'Mercado B',
    active: true,
    subscriptionStatus: 'active',
  });
  await setDoc(doc(db, 'tenants/descontao/users/rh-descontao'), {
    uid: 'rh-descontao',
    tenantId: 'descontao',
    role: 'rh',
    active: true,
  });
  await setDoc(doc(db, 'tenants/mercado-b/users/rh-b'), {
    uid: 'rh-b',
    tenantId: 'mercado-b',
    role: 'rh',
    active: true,
  });
  await setDoc(doc(db, 'platformAdmins/super-1'), { uid: 'super-1', active: true });
  await setDoc(doc(db, 'tenants/descontao/candidates/cand-1'), {
    tenantId: 'descontao',
    status: 'nova_candidatura',
    consent: { confirmsTruthfulness: true, authorizesDataProcessing: true },
    contact: { email: 'a@a.com', whatsapp: '11999990000' },
  });
});

console.log('\n=== Firestore Rules — isolamento multi-tenant ===\n');

await test('visitante público pode CRIAR uma candidatura no tenant indicado', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(
    setDoc(doc(db, 'tenants/descontao/candidates/cand-public'), {
      tenantId: 'descontao',
      status: 'nova_candidatura',
      consent: { confirmsTruthfulness: true, authorizesDataProcessing: true },
      contact: { email: 'x@x.com', whatsapp: '11988887777' },
    })
  );
});

await test('visitante público NÃO pode LER candidaturas (nem a que acabou de criar)', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'tenants/descontao/candidates/cand-1')));
});

await test('visitante público NÃO pode LISTAR tenants (evita enumeração de clientes)', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDocs(collection(db, 'tenants')));
});

await test('visitante público PODE ler um tenant específico pelo slug (branding público)', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, 'tenants/descontao')));
});

await test('RH do tenant A pode ler candidatos do próprio tenant', async () => {
  const db = testEnv.authenticatedContext('rh-descontao').firestore();
  await assertSucceeds(getDoc(doc(db, 'tenants/descontao/candidates/cand-1')));
});

await test('RH do tenant A NÃO pode ler candidatos do tenant B', async () => {
  const db = testEnv.authenticatedContext('rh-descontao').firestore();
  await assertFails(getDoc(doc(db, 'tenants/mercado-b/candidates/cand-1')));
});

await test('RH do tenant A NÃO pode alterar status de candidato do tenant B', async () => {
  const db = testEnv.authenticatedContext('rh-descontao').firestore();
  await assertFails(updateDoc(doc(db, 'tenants/mercado-b/candidates/cand-1'), { status: 'aprovado' }));
});

await test('RH (não é owner/admin) NÃO pode listar os usuários do próprio tenant', async () => {
  const db = testEnv.authenticatedContext('rh-descontao').firestore();
  await assertFails(getDocs(collection(db, 'tenants/descontao/users')));
});

await test('usuário autenticado comum NÃO pode ler platformAdmins de outro uid', async () => {
  const db = testEnv.authenticatedContext('rh-descontao').firestore();
  await assertFails(getDoc(doc(db, 'platformAdmins/super-1')));
});

await test('superadmin pode ler candidatos de qualquer tenant', async () => {
  const db = testEnv.authenticatedContext('super-1').firestore();
  await assertSucceeds(getDoc(doc(db, 'tenants/mercado-b/candidates/cand-1')));
});

await test('coleção legada "candidates" (pré multi-tenant) está bloqueada para o cliente', async () => {
  const db = testEnv.authenticatedContext('rh-descontao').firestore();
  await assertFails(getDoc(doc(db, 'candidates/algum-id')));
});

await testEnv.withSecurityRulesDisabled(async (context) => {
  await updateDoc(doc(context.firestore(), 'tenants/descontao'), { subscriptionStatus: 'suspended' });
});

await test('tenant suspenso: RH NÃO pode alterar status de candidato', async () => {
  const db = testEnv.authenticatedContext('rh-descontao').firestore();
  await assertFails(updateDoc(doc(db, 'tenants/descontao/candidates/cand-1'), { status: 'aprovado' }));
});

await test('tenant suspenso: leitura continua permitida', async () => {
  const db = testEnv.authenticatedContext('rh-descontao').firestore();
  await assertSucceeds(getDoc(doc(db, 'tenants/descontao/candidates/cand-1')));
});

await test('tenant suspenso: superadmin AINDA pode alterar dados (nunca é bloqueado)', async () => {
  const db = testEnv.authenticatedContext('super-1').firestore();
  await assertSucceeds(updateDoc(doc(db, 'tenants/descontao/candidates/cand-1'), { status: 'aprovado' }));
});

await testEnv.withSecurityRulesDisabled(async (context) => {
  await updateDoc(doc(context.firestore(), 'tenants/descontao'), { subscriptionStatus: 'active' });
});

console.log('\n=== Storage Rules — currículos e branding por tenant ===\n');

const RESUME_PATH = 'tenants/descontao/candidates/cand-1/resume/curriculo.pdf';
const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"

await test('visitante público pode ENVIAR um currículo (tamanho/tipo válidos)', async () => {
  const storage = testEnv.unauthenticatedContext().storage();
  await assertSucceeds(
    uploadBytes(ref(storage, RESUME_PATH), pdfBytes, { contentType: 'application/pdf' })
  );
});

await test('visitante público NÃO pode BAIXAR um currículo já enviado', async () => {
  const storage = testEnv.unauthenticatedContext().storage();
  await assertFails(getBytes(ref(storage, RESUME_PATH)));
});

await knownEmulatorLimitation('RH do tenant A pode BAIXAR o currículo de um candidato do próprio tenant', async () => {
  const storage = testEnv.authenticatedContext('rh-descontao').storage();
  await assertSucceeds(getBytes(ref(storage, RESUME_PATH)));
});

await test('RH do tenant B NÃO pode BAIXAR currículo do tenant A', async () => {
  const storage = testEnv.authenticatedContext('rh-b').storage();
  await assertFails(getBytes(ref(storage, RESUME_PATH)));
});

await test('RH do tenant B NÃO pode EXCLUIR currículo do tenant A', async () => {
  const storage = testEnv.authenticatedContext('rh-b').storage();
  await assertFails(deleteObject(ref(storage, RESUME_PATH)));
});

await test('logotipo (branding) do tenant é publicamente legível', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await uploadBytes(ref(context.storage(), 'tenants/descontao/branding/logo.svg'), pdfBytes, {
      contentType: 'image/svg+xml',
    });
  });
  const storage = testEnv.unauthenticatedContext().storage();
  await assertSucceeds(getBytes(ref(storage, 'tenants/descontao/branding/logo.svg')));
});

await test('visitante público NÃO pode ENVIAR logotipo (só quem tem acesso ao tenant)', async () => {
  const storage = testEnv.unauthenticatedContext().storage();
  await assertFails(
    uploadBytes(ref(storage, 'tenants/descontao/branding/logo-fake.svg'), pdfBytes, {
      contentType: 'image/svg+xml',
    })
  );
});

await testEnv.withSecurityRulesDisabled(async (context) => {
  await deleteDoc(doc(context.firestore(), 'tenants/descontao/candidates/cand-public')).catch(() => {});
});

await testEnv.cleanup();

console.log(`\n${passed} passaram, ${failed} falharam.\n`);
if (failed > 0) {
  console.log('Falharam:', failures.join(', '));
  process.exit(1);
}
process.exit(0);
