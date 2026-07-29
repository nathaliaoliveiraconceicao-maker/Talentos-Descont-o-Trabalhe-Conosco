/**
 * Migração idempotente do tenant único original (Supermercado Descontão)
 * para a estrutura multi-tenant tenants/descontao/... .
 *
 * Uso: npm run migrate-descontao
 *
 * O que este script faz:
 *   1. Garante que exista o documento tenants/descontao (cria com os dados
 *      de marca já usados no projeto, se ainda não existir).
 *   2. Copia admins/{uid}            -> tenants/descontao/users/{uid}
 *                                     + userIndex/{uid} = { tenantId }
 *   3. Copia candidates/{id}         -> tenants/descontao/candidates/{id}
 *      (adiciona o campo tenantId e migra o arquivo de currículo no Storage
 *      de resumes/... para tenants/descontao/candidates/{id}/resume/...,
 *      já que as novas Storage Rules negam por padrão qualquer caminho fora
 *      de tenants/{tenantId}/...)
 *   4. Copia evaluations/{id}        -> tenants/descontao/evaluations/{id}
 *   5. Copia statusHistory/{id}      -> tenants/descontao/statusHistory/{id}
 *   6. Copia scoringSettings/current -> tenants/descontao/scoringSettings/default
 *      e scoringSettings/retention  -> tenants/descontao/settings/general
 *      (mesclado com os textos padrão do portal, que o Descontão não tinha
 *      antes da multi-tenancy).
 *   7. Semeia tenants/descontao/jobs com as áreas de interesse padrão.
 *   8. Grava um relatório em migrations/migrateToTenant_descontao e imprime
 *      um resumo no terminal.
 *
 * O QUE ESTE SCRIPT NUNCA FAZ: apagar as coleções antigas (admins,
 * candidates, statusHistory, evaluations, scoringSettings). Elas ficam
 * bloqueadas para o app (firestore.rules nega leitura/escrita do cliente),
 * mas continuam no banco como origem/backup. A remoção é manual, pelo
 * Console do Firebase, e só deve ser feita depois de conferir o relatório
 * abaixo e validar que o painel em /app está 100% funcional com os dados
 * migrados.
 *
 * Idempotência: todo documento de destino usa o MESMO ID do documento de
 * origem e é gravado com set()/merge (upsert). Rodar o script de novo não
 * duplica nada — na pior hipótese, sobrescreve com os mesmos dados. Os
 * arquivos de currículo só são copiados no Storage se ainda não existir um
 * arquivo no caminho novo, então rodar de novo também não recopia à toa.
 */
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { randomUUID } from 'node:crypto';
import { initFirebaseAdmin } from './firebaseAdmin';

const TENANT_ID = 'descontao';
const MIGRATION_DOC_ID = `migrateToTenant_${TENANT_ID}`;

const DEFAULT_JOB_AREAS: { id: string; label: string; active: boolean }[] = [
  { id: 'ajudante_acougue', label: 'Ajudante de Açougue', active: true },
  { id: 'acougueiro', label: 'Açougueiro', active: true },
  { id: 'padeiro', label: 'Padeiro', active: true },
  { id: 'ajudante_padaria', label: 'Ajudante de Padaria', active: true },
  { id: 'repositor_hortifruti', label: 'Repositor de Hortifrúti', active: true },
  { id: 'repositor', label: 'Repositor', active: true },
  { id: 'operador_caixa', label: 'Operador(a) de Caixa', active: true },
  { id: 'fiscal_caixa', label: 'Fiscal de Caixa', active: true },
  { id: 'administrativo', label: 'Administrativo', active: true },
  { id: 'atendente_frios', label: 'Atendente de Frios', active: true },
  { id: 'conferente', label: 'Conferente', active: true },
  { id: 'estoquista', label: 'Estoquista', active: true },
  { id: 'outra', label: 'Outra área', active: true },
];

const DEFAULT_TENANT_SETTINGS = {
  heroTitle: 'Seu próximo passo pode começar aqui.',
  heroSubtitle: 'Cadastre-se no banco de talentos e participe dos nossos futuros processos seletivos.',
  initialMessage: 'O preenchimento do formulário não garante contratação ou convocação para entrevista.',
  privacyPolicyText:
    'Seus dados são usados exclusivamente para processos de recrutamento e seleção. Não vendemos nem utilizamos suas informações para fins de publicidade.',
  talentPoolRetentionMonths: 24,
  whatsappGenericMessage:
    'Olá, {{nome}}. Somos da equipe de RH da {{empresa}}. Analisamos sua pré-candidatura e gostaríamos de conversar sobre a próxima etapa do nosso processo seletivo.',
  whatsappInterviewMessage:
    'Olá, {{nome}}. Somos do setor de RH da {{empresa}}. Analisamos sua pré-candidatura e gostaríamos de convidar você para uma entrevista no dia {{data}}, às {{horario}}, em {{local}}. Por favor, confirme o recebimento desta mensagem.',
};

const DEFAULT_SCORING_WEIGHTS = {
  easyAccess: 1,
  variedAvailability: 2,
  weekendAvailability: 2,
  areaExperience: 3,
  supermarketExperience: 2,
  customerServiceExperience: 1,
  canStartImmediately: 1,
  resumeAttached: 1,
  wellFilledProfile: 1,
};

interface Report {
  tenantCreated: boolean;
  usersMigrated: number;
  candidatesMigrated: number;
  resumesMigrated: number;
  resumesSkippedNoFile: number;
  resumesAlreadyMigrated: number;
  resumesFailed: string[];
  evaluationsMigrated: number;
  statusHistoryMigrated: number;
  scoringSettingsMigrated: boolean;
  tenantSettingsMigrated: boolean;
  jobsSeeded: number;
}

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

async function migrateResumeFile(
  bucket: ReturnType<ReturnType<typeof getStorage>['bucket']> | null,
  oldPath: string | undefined,
  candidateId: string,
  report: Report
): Promise<{ storagePath: string; fileUrl: string } | null> {
  if (!oldPath) {
    report.resumesSkippedNoFile += 1;
    return null;
  }

  // Já migrado em uma execução anterior deste script.
  if (oldPath.startsWith(`tenants/${TENANT_ID}/`)) {
    report.resumesAlreadyMigrated += 1;
    return null;
  }

  if (!bucket) {
    report.resumesFailed.push(`${candidateId}: bucket do Storage indisponível`);
    return null;
  }

  try {
    const fileName = oldPath.split('/').pop() ?? `curriculo-${candidateId}`;
    const newPath = `tenants/${TENANT_ID}/candidates/${candidateId}/resume/${fileName}`;
    const oldFile = bucket.file(oldPath);
    const newFile = bucket.file(newPath);

    const [oldExists] = await oldFile.exists();
    if (!oldExists) {
      report.resumesFailed.push(`${candidateId}: arquivo original não encontrado em ${oldPath}`);
      return null;
    }

    const [newExists] = await newFile.exists();
    const token = randomUUID();
    if (!newExists) {
      await oldFile.copy(newFile);
      await newFile.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
    }

    const [metadata] = await newFile.getMetadata();
    const tokenToUse = (metadata.metadata as Record<string, string> | undefined)?.firebaseStorageDownloadTokens ?? token;
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      newPath
    )}?alt=media&token=${tokenToUse}`;

    report.resumesMigrated += 1;
    return { storagePath: newPath, fileUrl };
  } catch (error) {
    report.resumesFailed.push(`${candidateId}: ${(error as Error).message}`);
    return null;
  }
}

async function main() {
  initFirebaseAdmin();
  const db = getFirestore();

  let bucket: ReturnType<ReturnType<typeof getStorage>['bucket']> | null = null;
  try {
    bucket = getStorage().bucket();
  } catch (error) {
    console.warn(
      `⚠️  Não foi possível acessar o Storage (${(error as Error).message}). Os currículos NÃO serão migrados — apenas os dados do Firestore. Rode o script novamente depois de configurar o bucket padrão para migrar os arquivos.`
    );
  }

  console.log(`\n=== Migração para tenants/${TENANT_ID} ===\n`);

  const report: Report = {
    tenantCreated: false,
    usersMigrated: 0,
    candidatesMigrated: 0,
    resumesMigrated: 0,
    resumesSkippedNoFile: 0,
    resumesAlreadyMigrated: 0,
    resumesFailed: [],
    evaluationsMigrated: 0,
    statusHistoryMigrated: 0,
    scoringSettingsMigrated: false,
    tenantSettingsMigrated: false,
    jobsSeeded: 0,
  };

  // 1. tenants/descontao ------------------------------------------------
  const tenantRef = db.collection('tenants').doc(TENANT_ID);
  const tenantSnap = await tenantRef.get();
  if (!tenantSnap.exists) {
    const nowIso = new Date().toISOString();
    await tenantRef.set({
      tenantId: TENANT_ID,
      slug: TENANT_ID,
      name: 'Supermercado Descontão',
      legalName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      logoUrl: '/tenants/descontao-logo.svg',
      primaryColor: '#146c94',
      secondaryColor: '#d32f2b',
      active: true,
      planId: 'legacy',
      subscriptionStatus: 'active',
      subscriptionStartedAt: nowIso,
      subscriptionEndsAt: '',
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    report.tenantCreated = true;
    console.log('✅ tenants/descontao criado.');
  } else {
    console.log('ℹ️  tenants/descontao já existe — mantendo os dados atuais.');
  }

  // 2. admins -> tenants/descontao/users + userIndex ---------------------
  const adminsSnap = await db.collection('admins').get();
  for (const adminDoc of adminsSnap.docs) {
    const data = adminDoc.data();
    const uid = adminDoc.id;
    const role = data.role === 'rh' ? 'rh' : 'admin';
    await db
      .collection('tenants')
      .doc(TENANT_ID)
      .collection('users')
      .doc(uid)
      .set(
        {
          uid,
          tenantId: TENANT_ID,
          email: data.email ?? '',
          name: data.name ?? '',
          role,
          active: data.active === true,
          createdAt: tsToIso(data.createdAt),
        },
        { merge: true }
      );
    await db.collection('userIndex').doc(uid).set({ tenantId: TENANT_ID }, { merge: true });
    report.usersMigrated += 1;
  }
  console.log(`✅ ${report.usersMigrated} usuário(s) migrado(s) para tenants/descontao/users.`);

  // 3. candidates -> tenants/descontao/candidates (+ currículo no Storage) -
  const candidatesSnap = await db.collection('candidates').get();
  for (const candidateDoc of candidatesSnap.docs) {
    const data = candidateDoc.data();
    const candidateId = candidateDoc.id;

    const oldResume = data.resume as { storagePath?: string } | null | undefined;
    const migratedResume = await migrateResumeFile(bucket, oldResume?.storagePath, candidateId, report);
    const resume = oldResume
      ? {
          ...oldResume,
          ...(migratedResume ?? {}),
        }
      : null;

    await db
      .collection('tenants')
      .doc(TENANT_ID)
      .collection('candidates')
      .doc(candidateId)
      .set(
        {
          ...data,
          tenantId: TENANT_ID,
          resume,
          createdAt: tsToIso(data.createdAt),
          updatedAt: tsToIso(data.updatedAt),
        },
        { merge: true }
      );
    report.candidatesMigrated += 1;
  }
  console.log(`✅ ${report.candidatesMigrated} candidato(s) migrado(s) para tenants/descontao/candidates.`);
  console.log(
    `   Currículos: ${report.resumesMigrated} migrado(s), ${report.resumesAlreadyMigrated} já migrado(s) antes, ${report.resumesSkippedNoFile} sem arquivo, ${report.resumesFailed.length} com falha.`
  );

  // 4. evaluations ---------------------------------------------------------
  const evaluationsSnap = await db.collection('evaluations').get();
  for (const evalDoc of evaluationsSnap.docs) {
    await db
      .collection('tenants')
      .doc(TENANT_ID)
      .collection('evaluations')
      .doc(evalDoc.id)
      .set({ ...evalDoc.data() }, { merge: true });
    report.evaluationsMigrated += 1;
  }
  console.log(`✅ ${report.evaluationsMigrated} avaliação(ões) migrada(s) para tenants/descontao/evaluations.`);

  // 5. statusHistory ---------------------------------------------------------
  const statusHistorySnap = await db.collection('statusHistory').get();
  for (const historyDoc of statusHistorySnap.docs) {
    const data = historyDoc.data();
    await db
      .collection('tenants')
      .doc(TENANT_ID)
      .collection('statusHistory')
      .doc(historyDoc.id)
      .set({ ...data, changedAt: tsToIso(data.changedAt) }, { merge: true });
    report.statusHistoryMigrated += 1;
  }
  console.log(`✅ ${report.statusHistoryMigrated} entrada(s) de histórico migrada(s) para tenants/descontao/statusHistory.`);

  // 6a. scoringSettings/current -> tenants/descontao/scoringSettings/default
  const scoringCurrentSnap = await db.collection('scoringSettings').doc('current').get();
  const scoringData = scoringCurrentSnap.exists ? scoringCurrentSnap.data()! : null;
  await db
    .collection('tenants')
    .doc(TENANT_ID)
    .collection('scoringSettings')
    .doc('default')
    .set(
      {
        weights: scoringData?.weights ?? DEFAULT_SCORING_WEIGHTS,
        updatedAt: tsToIso(scoringData?.updatedAt) ,
        updatedBy: scoringData?.updatedBy ?? 'migracao',
      },
      { merge: true }
    );
  report.scoringSettingsMigrated = true;
  console.log('✅ Pesos de pontuação migrados para tenants/descontao/scoringSettings/default.');

  // 6b. scoringSettings/retention -> tenants/descontao/settings/general
  const retentionSnap = await db.collection('scoringSettings').doc('retention').get();
  const retentionData = retentionSnap.exists ? retentionSnap.data()! : null;
  const generalSettingsRef = db.collection('tenants').doc(TENANT_ID).collection('settings').doc('general');
  const existingGeneralSnap = await generalSettingsRef.get();
  await generalSettingsRef.set(
    {
      ...DEFAULT_TENANT_SETTINGS,
      ...(existingGeneralSnap.exists ? existingGeneralSnap.data() : {}),
      talentPoolRetentionMonths:
        retentionData?.talentPoolRetentionMonths ??
        existingGeneralSnap.data()?.talentPoolRetentionMonths ??
        DEFAULT_TENANT_SETTINGS.talentPoolRetentionMonths,
      updatedAt: new Date().toISOString(),
      updatedBy: 'migracao',
    },
    { merge: true }
  );
  report.tenantSettingsMigrated = true;
  console.log('✅ Configurações do portal (incluindo retenção LGPD) gravadas em tenants/descontao/settings/general.');

  // 7. jobs (áreas de interesse) --------------------------------------------
  for (const area of DEFAULT_JOB_AREAS) {
    await db.collection('tenants').doc(TENANT_ID).collection('jobs').doc(area.id).set(area, { merge: true });
    report.jobsSeeded += 1;
  }
  console.log(`✅ ${report.jobsSeeded} área(s) de interesse semeada(s) em tenants/descontao/jobs.`);

  // 8. relatório -------------------------------------------------------------
  const runAt = new Date().toISOString();
  await db
    .collection('migrations')
    .doc(MIGRATION_DOC_ID)
    .set(
      {
        tenantId: TENANT_ID,
        status: 'completed',
        lastRunAt: runAt,
        report,
      },
      { merge: true }
    );

  console.log('\n=== Relatório de migração ===');
  console.log(JSON.stringify(report, null, 2));
  if (report.resumesFailed.length > 0) {
    console.log('\n⚠️  Currículos com falha na migração (revise manualmente):');
    report.resumesFailed.forEach((line) => console.log(`   - ${line}`));
  }
  console.log(
    '\n✅ Migração concluída. As coleções antigas (admins, candidates, statusHistory, evaluations, scoringSettings) NÃO foram apagadas.'
  );
  console.log(
    '   Depois de validar o painel em /app com os dados migrados, remova as coleções antigas manualmente pelo Console do Firebase, se desejar.\n'
  );

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro na migração:', error);
  process.exit(1);
});
