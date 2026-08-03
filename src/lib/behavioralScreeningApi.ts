import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  PLATFORM_DEFAULT_BEHAVIORAL_SCREENING,
  type BehavioralScreeningSettings,
} from '@/types/behavioralProfile';

const TENANTS_COLLECTION = 'tenants';

function behavioralScreeningDoc(tenantId: string) {
  return doc(db, TENANTS_COLLECTION, tenantId, 'settings', 'behavioralScreening');
}

/**
 * Configuração geral da empresa para a seção "Triagem emocional e perfil
 * comportamental". Documento público para leitura (mesma regra de
 * tenants/{t}/settings/{docId} já usada por settings/general) — só contém
 * flags de ativado/obrigatório, nunca dados de candidatos.
 */
export async function getBehavioralScreeningSettings(tenantId: string): Promise<BehavioralScreeningSettings> {
  const snap = await getDoc(behavioralScreeningDoc(tenantId));
  if (!snap.exists()) {
    return { ...PLATFORM_DEFAULT_BEHAVIORAL_SCREENING, updatedAt: new Date().toISOString(), updatedBy: 'sistema' };
  }
  return snap.data() as BehavioralScreeningSettings;
}

export async function saveBehavioralScreeningSettings(
  tenantId: string,
  settings: Omit<BehavioralScreeningSettings, 'updatedAt' | 'updatedBy'>,
  updatedBy: string
): Promise<void> {
  const payload: BehavioralScreeningSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  await setDoc(behavioralScreeningDoc(tenantId), payload);
}
