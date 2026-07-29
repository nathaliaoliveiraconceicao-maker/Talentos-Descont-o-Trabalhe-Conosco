import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { defaultTenantSettings, type Tenant, type TenantJobArea, type TenantSettings } from '@/types/tenant';
import { DEFAULT_JOB_AREAS_SEED } from '@/data/jobAreas';

const TENANTS_COLLECTION = 'tenants';

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

/** Valida um slug: minúsculas, números e hífens, começando/terminando com letra ou número. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 60;
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  if (!tenantId) return null;
  const snap = await getDoc(doc(db, TENANTS_COLLECTION, tenantId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    tenantId: snap.id,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  } as Tenant;
}

export async function listTenants(): Promise<Tenant[]> {
  const snapshot = await getDocs(query(collection(db, TENANTS_COLLECTION), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      tenantId: d.id,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    } as Tenant;
  });
}

export interface CreateTenantInput {
  slug: string;
  name: string;
  legalName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  primaryColor?: string;
  secondaryColor?: string;
  planId: string;
}

/**
 * Cria um novo tenant (cliente). tenantId é sempre igual ao slug. Também
 * inicializa tenants/{tenantId}/settings/general com valores padrão e semeia
 * tenants/{tenantId}/jobs com as áreas de interesse padrão, para o cliente já
 * começar com um formulário funcional (customizável depois).
 */
export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  if (!isValidSlug(input.slug)) {
    throw new Error('Slug inválido. Use apenas letras minúsculas, números e hífens (3 a 60 caracteres).');
  }
  const existing = await getTenant(input.slug);
  if (existing) {
    throw new Error(`Já existe um tenant com o slug "${input.slug}".`);
  }

  const nowIso = new Date().toISOString();
  const tenant: Tenant = {
    tenantId: input.slug,
    slug: input.slug,
    name: input.name,
    legalName: input.legalName ?? '',
    email: input.email,
    phone: input.phone ?? '',
    address: input.address ?? '',
    city: input.city ?? '',
    state: input.state ?? '',
    logoUrl: '',
    primaryColor: input.primaryColor ?? '#146c94',
    secondaryColor: input.secondaryColor ?? '#d32f2b',
    active: true,
    planId: input.planId,
    subscriptionStatus: 'trial',
    subscriptionStartedAt: nowIso,
    subscriptionEndsAt: '',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await setDoc(doc(db, TENANTS_COLLECTION, input.slug), tenant);
  await saveTenantSettings(input.slug, defaultTenantSettings, 'sistema');
  await seedDefaultJobAreas(input.slug);

  return tenant;
}

export async function updateTenant(tenantId: string, patch: Partial<Tenant>): Promise<void> {
  await updateDoc(doc(db, TENANTS_COLLECTION, tenantId), {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTenant(tenantId: string): Promise<void> {
  await deleteDoc(doc(db, TENANTS_COLLECTION, tenantId));
}

// --- Configurações do tenant (tenants/{tenantId}/settings/general) ---------

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  const snap = await getDoc(doc(db, TENANTS_COLLECTION, tenantId, 'settings', 'general'));
  if (!snap.exists()) {
    return { ...defaultTenantSettings, updatedAt: new Date().toISOString(), updatedBy: 'sistema' };
  }
  return snap.data() as TenantSettings;
}

export async function saveTenantSettings(
  tenantId: string,
  settings: Omit<TenantSettings, 'updatedAt' | 'updatedBy'>,
  updatedBy: string
): Promise<void> {
  await setDoc(doc(db, TENANTS_COLLECTION, tenantId, 'settings', 'general'), {
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy,
  });
}

// --- Áreas de interesse do tenant (tenants/{tenantId}/jobs) -----------------

export async function getTenantJobAreas(tenantId: string): Promise<TenantJobArea[]> {
  const snapshot = await getDocs(collection(db, TENANTS_COLLECTION, tenantId, 'jobs'));
  const areas = snapshot.docs.map((d) => d.data() as TenantJobArea).filter((a) => a.active !== false);
  return areas.length > 0 ? areas : DEFAULT_JOB_AREAS_SEED;
}

export async function saveTenantJobArea(tenantId: string, area: TenantJobArea): Promise<void> {
  await setDoc(doc(db, TENANTS_COLLECTION, tenantId, 'jobs', area.id), area);
}

export async function deleteTenantJobArea(tenantId: string, areaId: string): Promise<void> {
  await deleteDoc(doc(db, TENANTS_COLLECTION, tenantId, 'jobs', areaId));
}

async function seedDefaultJobAreas(tenantId: string): Promise<void> {
  await Promise.all(DEFAULT_JOB_AREAS_SEED.map((area) => saveTenantJobArea(tenantId, area)));
}

export function jobAreaLabel(jobs: TenantJobArea[], id: string): string {
  return jobs.find((j) => j.id === id)?.label ?? id;
}
