import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { defaultScoringWeights, type ScoringSettings, type ScoringWeights } from '@/types/admin';

const TENANTS_COLLECTION = 'tenants';

function scoringSettingsDoc(tenantId: string) {
  return doc(db, TENANTS_COLLECTION, tenantId, 'scoringSettings', 'default');
}

export async function getScoringSettings(tenantId: string): Promise<ScoringSettings> {
  const snap = await getDoc(scoringSettingsDoc(tenantId));
  if (!snap.exists()) {
    return { weights: defaultScoringWeights, updatedAt: new Date().toISOString(), updatedBy: 'sistema' };
  }
  return snap.data() as ScoringSettings;
}

export async function saveScoringSettings(
  tenantId: string,
  weights: ScoringWeights,
  updatedBy: string
): Promise<void> {
  const payload: ScoringSettings = {
    weights,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  await setDoc(scoringSettingsDoc(tenantId), payload);
}
