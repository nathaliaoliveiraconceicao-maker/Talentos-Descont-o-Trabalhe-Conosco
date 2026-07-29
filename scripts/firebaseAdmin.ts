import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';

/**
 * Inicializa o Firebase Admin SDK para uso em scripts Node (seed, criação de admin).
 *
 * Credenciais aceitas, em ordem de prioridade:
 * 1. Variável de ambiente GOOGLE_APPLICATION_CREDENTIALS apontando para o JSON da conta de serviço.
 * 2. Arquivo "serviceAccountKey.json" na raiz do projeto (nunca deve ser commitado).
 *
 * Para gerar a chave: Console do Firebase > Configurações do projeto > Contas de serviço >
 * Gerar nova chave privada.
 */
export function initFirebaseAdmin(): App {
  const existingApp = getApps()[0];
  if (existingApp) return existingApp;

  const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ?? resolve(process.cwd(), 'serviceAccountKey.json');

  if (!existsSync(credentialsPath)) {
    console.error(
      '\n❌ Credenciais do Firebase Admin não encontradas.\n' +
        'Baixe a chave da conta de serviço em: Console do Firebase > Configurações do projeto > Contas de serviço.\n' +
        'Salve o arquivo como "serviceAccountKey.json" na raiz do projeto, ou defina a variável de ambiente\n' +
        'GOOGLE_APPLICATION_CREDENTIALS apontando para o caminho do arquivo.\n'
    );
    process.exit(1);
  }

  const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf-8'));

  // O bucket padrão do Storage não é inferido automaticamente pelo Admin SDK
  // a partir da conta de serviço — sem informá-lo aqui, getStorage().bucket()
  // (usado no script de migração para copiar currículos) falha com "Bucket
  // name not specified or invalid". Projetos criados antes de out/2024 usam
  // "{projectId}.appspot.com"; projetos mais novos usam
  // "{projectId}.firebasestorage.app" — se o seu projeto for mais novo (ou o
  // bucket tiver um nome customizado), defina a variável de ambiente
  // FIREBASE_STORAGE_BUCKET com o nome exato (visível em Console do Firebase
  // > Storage > topo da página de arquivos).
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET ?? `${serviceAccount.project_id}.firebasestorage.app`;

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
    storageBucket,
  });
}
