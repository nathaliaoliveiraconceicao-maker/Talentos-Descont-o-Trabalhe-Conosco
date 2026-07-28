import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  defaultScoringWeights,
  type RetentionSettings,
  type ScoringSettings,
  type ScoringWeights,
} from '@/types/admin';

const SCORING_DOC = doc(db, 'scoringSettings', 'current');
const RETENTION_DOC = doc(db, 'scoringSettings', 'retention');

export async function getScoringSettings(): Promise<ScoringSettings> {
  const snap = await getDoc(SCORING_DOC);
  if (!snap.exists()) {
    return { weights: defaultScoringWeights, updatedAt: new Date().toISOString(), updatedBy: 'sistema' };
  }
  return snap.data() as ScoringSettings;
}

export async function saveScoringSettings(weights: ScoringWeights, updatedBy: string): Promise<void> {
  const payload: ScoringSettings = {
    weights,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  await setDoc(SCORING_DOC, payload);
}

const DEFAULT_RETENTION_MONTHS = Number(import.meta.env.VITE_DEFAULT_RETENTION_MONTHS ?? 24);

export async function getRetentionSettings(): Promise<RetentionSettings> {
  const snap = await getDoc(RETENTION_DOC);
  if (!snap.exists()) {
    return {
      talentPoolRetentionMonths: DEFAULT_RETENTION_MONTHS,
      updatedAt: new Date().toISOString(),
      updatedBy: 'sistema',
    };
  }
  return snap.data() as RetentionSettings;
}

export async function saveRetentionSettings(months: number, updatedBy: string): Promise<void> {
  const payload: RetentionSettings = {
    talentPoolRetentionMonths: months,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  await setDoc(RETENTION_DOC, payload);
}
