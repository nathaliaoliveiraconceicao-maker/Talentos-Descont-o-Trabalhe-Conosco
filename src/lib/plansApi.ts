import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Plan } from '@/types/plan';

const PLANS_COLLECTION = 'plans';

export async function listPlans(): Promise<Plan[]> {
  const snapshot = await getDocs(query(collection(db, PLANS_COLLECTION), orderBy('price', 'asc')));
  return snapshot.docs.map((d) => ({ ...(d.data() as Plan), planId: d.id }));
}

export async function getPlan(planId: string): Promise<Plan | null> {
  if (!planId) return null;
  const snap = await getDoc(doc(db, PLANS_COLLECTION, planId));
  if (!snap.exists()) return null;
  return { ...(snap.data() as Plan), planId: snap.id };
}

export async function savePlan(plan: Plan): Promise<void> {
  await setDoc(doc(db, PLANS_COLLECTION, plan.planId), plan);
}

/**
 * Planos padrão sugeridos para popular a coleção "plans" na primeira
 * configuração da plataforma (botão "Criar planos padrão" em
 * /superadmin/planos, ver src/pages/superadmin/Plans.tsx).
 */
export const DEFAULT_PLANS: Plan[] = [
  {
    planId: 'starter',
    name: 'Starter',
    price: 0,
    billingPeriod: 'monthly',
    maxUsers: 2,
    maxBranches: 1,
    maxCandidatesPerMonth: 100,
    reportsEnabled: false,
    csvExportEnabled: false,
    scoringEnabled: true,
    talentBankEnabled: false,
    customDomainEnabled: false,
    active: true,
  },
  {
    planId: 'pro',
    name: 'Pro',
    price: 199,
    billingPeriod: 'monthly',
    maxUsers: 10,
    maxBranches: 5,
    maxCandidatesPerMonth: 1000,
    reportsEnabled: true,
    csvExportEnabled: true,
    scoringEnabled: true,
    talentBankEnabled: true,
    customDomainEnabled: false,
    active: true,
  },
  {
    planId: 'enterprise',
    name: 'Enterprise',
    price: 599,
    billingPeriod: 'monthly',
    maxUsers: 50,
    maxBranches: 50,
    maxCandidatesPerMonth: 10000,
    reportsEnabled: true,
    csvExportEnabled: true,
    scoringEnabled: true,
    talentBankEnabled: true,
    customDomainEnabled: true,
    active: true,
  },
];
