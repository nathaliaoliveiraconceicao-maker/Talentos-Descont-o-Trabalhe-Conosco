/**
 * Renomeia (troca o slug/tenantId de) um tenant existente, preservando todos
 * os outros dados: identidade visual, usuários, candidatos, vagas,
 * avaliações, histórico, pontuação e configurações. Só o ID do documento
 * tenants/{tenantId} muda (junto com os campos tenantId/slug dentro dele) —
 * o nome público do negócio (tenant.name, logo, cores) NÃO é alterado, já
 * que reflete o cliente real, não a URL interna.
 *
 * Uso: npm run rename-tenant -- <de> <para>
 * Ex.: npm run rename-tenant -- descontao cliente01
 *
 * O que faz:
 *   1. Copia tenants/{de} -> tenants/{para} (com tenantId/slug atualizados).
 *   2. Copia todas as subcoleções (users, candidates, jobs, evaluations,
 *      statusHistory, scoringSettings, settings, auditLogs), preservando os
 *      IDs de cada documento.
 *   3. Para candidatos com currículo no Storage em tenants/{de}/..., copia o
 *      arquivo para tenants/{para}/... com um novo token de download e
 *      atualiza resume.storagePath/fileUrl no documento copiado.
 *   4. Atualiza userIndex/{uid} de cada usuário migrado para apontar para o
 *      novo tenantId — sem isso, o login desses usuários continuaria
 *      resolvendo para o tenant antigo.
 *   5. Marca tenants/{de} como active:false ao final (nunca apaga), para não
 *      deixar duas URLs públicas servindo os mesmos dados ao mesmo tempo.
 *
 * Idempotente: se tenants/{para} já existir E tiver sido criado por uma
 * execução anterior deste mesmo script (bookkeeping em
 * migrations/renameTenant_{de}_{para}), roda de novo sem duplicar nada
 * (todos os writes são .set() upserts). Se tenants/{para} já existir e NÃO
 * for de uma execução anterior deste script (ex.: já é outro cliente de
 * verdade), o script aborta sem tocar em nada, para não sobrescrever um
 * tenant não relacionado.
 */
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { randomUUID } from 'node:crypto';
import { initFirebaseAdmin } from './firebaseAdmin';

const SUBCOLLECTIONS = [
  'users',
  'candidates',
  'jobs',
  'evaluations',
  'statusHistory',
  'scoringSettings',
  'settings',
  'auditLogs',
] as const;

function tsToIso(value: unknown): string | undefined {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return undefined;
}

async function migrateResumeFile(
  bucket: ReturnType<ReturnType<typeof getStorage>['bucket']> | null,
  oldStoragePath: string | undefined,
  fromTenantId: string,
  toTenantId: string
): Promise<{ storagePath: string; fileUrl: string } | null> {
  if (!oldStoragePath || !oldStoragePath.startsWith(`tenants/${fromTenantId}/`)) return null;
  if (!bucket) return null;

  const newPath = oldStoragePath.replace(`tenants/${fromTenantId}/`, `tenants/${toTenantId}/`);
  const oldFile = bucket.file(oldStoragePath);
  const newFile = bucket.file(newPath);

  const [oldExists] = await oldFile.exists();
  if (!oldExists) return null;

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
  return { storagePath: newPath, fileUrl };
}

async function main() {
  const [fromTenantId, toTenantId] = process.argv.slice(2);
  if (!fromTenantId || !toTenantId) {
    console.error('Uso: npm run rename-tenant -- <de> <para>\nEx.: npm run rename-tenant -- descontao cliente01');
    process.exit(1);
  }
  if (fromTenantId === toTenantId) {
    console.error('❌ O tenant de origem e de destino são iguais — nada a fazer.');
    process.exit(1);
  }

  initFirebaseAdmin();
  const db = getFirestore();

  let bucket: ReturnType<ReturnType<typeof getStorage>['bucket']> | null = null;
  try {
    bucket = getStorage().bucket();
  } catch (error) {
    console.warn(`⚠️  Storage indisponível (${(error as Error).message}) — currículos não serão copiados.`);
  }

  console.log(`\n=== Renomeando tenant: ${fromTenantId} -> ${toTenantId} ===\n`);

  const migrationDocId = `renameTenant_${fromTenantId}_${toTenantId}`;
  const migrationRef = db.collection('migrations').doc(migrationDocId);

  const fromRef = db.collection('tenants').doc(fromTenantId);
  const fromSnap = await fromRef.get();
  if (!fromSnap.exists) {
    console.error(`❌ tenants/${fromTenantId} não existe. Nada a renomear.`);
    process.exit(1);
  }

  const toRef = db.collection('tenants').doc(toTenantId);
  const toSnapBefore = await toRef.get();
  const migrationSnapBefore = await migrationRef.get();
  if (toSnapBefore.exists && !migrationSnapBefore.exists) {
    console.error(
      `❌ tenants/${toTenantId} já existe e não foi criado por uma execução anterior deste script.\n` +
        'Abortando para não sobrescrever um tenant não relacionado. Escolha outro ID de destino ou remova/renomeie o tenant existente manualmente antes de tentar de novo.'
    );
    process.exit(1);
  }

  const fromData = fromSnap.data()!;
  const nowIso = new Date().toISOString();
  await toRef.set(
    {
      ...fromData,
      tenantId: toTenantId,
      slug: toTenantId,
      updatedAt: nowIso,
    },
    { merge: true }
  );
  console.log(`✅ tenants/${toTenantId} criado/atualizado a partir de tenants/${fromTenantId}.`);

  const counts: Record<string, number> = {};
  let resumesCopied = 0;

  for (const sub of SUBCOLLECTIONS) {
    const snap = await db.collection('tenants').doc(fromTenantId).collection(sub).get();
    counts[sub] = 0;
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      let payload: Record<string, unknown> = { ...data };

      if (sub === 'users') {
        payload = { ...payload, tenantId: toTenantId };
      }

      if (sub === 'candidates') {
        payload = { ...payload, tenantId: toTenantId };
        const resume = data.resume as { storagePath?: string } | null | undefined;
        if (resume?.storagePath) {
          const migrated = await migrateResumeFile(bucket, resume.storagePath, fromTenantId, toTenantId);
          if (migrated) {
            payload.resume = { ...resume, ...migrated };
            resumesCopied += 1;
          }
        }
      }

      await db
        .collection('tenants')
        .doc(toTenantId)
        .collection(sub)
        .doc(docSnap.id)
        .set(payload, { merge: true });
      counts[sub] += 1;

      // Mantém o login funcionando: uid -> tenantId precisa apontar para o novo tenant.
      if (sub === 'users') {
        await db.collection('userIndex').doc(docSnap.id).set({ tenantId: toTenantId }, { merge: true });
      }
    }
    console.log(`✅ ${counts[sub]} documento(s) copiado(s) em "${sub}".`);
  }
  console.log(`   Currículos copiados no Storage: ${resumesCopied}`);

  // Nunca apaga o tenant antigo — só desativa, para não deixar duas URLs
  // públicas (a antiga e a nova) servindo os mesmos dados simultaneamente.
  await fromRef.set({ active: false, updatedAt: new Date().toISOString() }, { merge: true });
  console.log(`✅ tenants/${fromTenantId} marcado como active:false (dados preservados, não apagados).`);

  await migrationRef.set({
    fromTenantId,
    toTenantId,
    status: 'completed',
    completedAt: new Date().toISOString(),
    counts,
    resumesCopied,
  });

  console.log('\n=== Relatório ===');
  console.log(JSON.stringify({ fromTenantId, toTenantId, counts, resumesCopied }, null, 2));
  console.log(
    `\n✅ Renomeação concluída. "/${toTenantId}" já deve funcionar assim que as Firestore Rules estiverem publicadas no projeto.` +
      ` "/${fromTenantId}" agora mostra "portal indisponível" (tenant inativo, dados preservados).`
  );
  console.log(`   createdAt original preservado: ${tsToIso(fromData.createdAt) ?? fromData.createdAt}`);

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erro na renomeação:', error);
  process.exit(1);
});
