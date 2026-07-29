import { collection, doc, getDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { AdminUser, PlatformAdmin, UserIndexEntry } from '@/types/admin';

const PLATFORM_ADMINS_COLLECTION = 'platformAdmins';
const USER_INDEX_COLLECTION = 'userIndex';
const TENANTS_COLLECTION = 'tenants';

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

/** platformAdmins/{uid} — superadmins da plataforma (fora de qualquer tenant). */
export async function getPlatformAdmin(uid: string): Promise<PlatformAdmin | null> {
  const snap = await getDoc(doc(db, PLATFORM_ADMINS_COLLECTION, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: (data.uid as string) ?? snap.id,
    email: data.email as string,
    name: data.name as string,
    active: data.active === true,
    createdAt: timestampToIso(data.createdAt),
  };
}

/**
 * userIndex/{uid} — descobre a qual tenant um usuário autenticado pertence.
 * É o primeiro passo do login de um usuário de tenant: sem isso não temos
 * como saber em qual "tenants/{tenantId}/users/{uid}" procurar.
 */
export async function getUserIndex(uid: string): Promise<UserIndexEntry | null> {
  const snap = await getDoc(doc(db, USER_INDEX_COLLECTION, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserIndexEntry;
}

/** tenants/{tenantId}/users/{uid} */
export async function getTenantUser(tenantId: string, uid: string): Promise<AdminUser | null> {
  const snap = await getDoc(doc(db, TENANTS_COLLECTION, tenantId, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: (data.uid as string) ?? snap.id,
    tenantId: (data.tenantId as string) ?? tenantId,
    email: data.email as string,
    name: data.name as string,
    role: data.role as AdminUser['role'],
    active: data.active === true,
    createdAt: timestampToIso(data.createdAt),
  };
}

export async function listTenantUsers(tenantId: string): Promise<AdminUser[]> {
  const snapshot = await getDocs(
    query(collection(db, TENANTS_COLLECTION, tenantId, 'users'), orderBy('createdAt', 'asc'))
  );
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      uid: (data.uid as string) ?? d.id,
      tenantId: (data.tenantId as string) ?? tenantId,
      email: data.email as string,
      name: data.name as string,
      role: data.role as AdminUser['role'],
      active: data.active === true,
      createdAt: timestampToIso(data.createdAt),
    };
  });
}
