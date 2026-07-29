import { collection, doc, getDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { AdminUser } from '@/types/admin';

const ADMINS_COLLECTION = 'admins';

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

// admins/{uid}: documento pode ter sido criado pelo script create-admin (createdAt em
// string ISO) ou manualmente pelo Console do Firebase (createdAt como Timestamp).
function normalizeAdmin(uid: string, data: Record<string, unknown>): AdminUser {
  return {
    uid: (data.uid as string) ?? uid,
    email: data.email as string,
    name: data.name as string,
    role: data.role as AdminUser['role'],
    active: data.active === true,
    createdAt: timestampToIso(data.createdAt),
  };
}

/** Lê exatamente o documento admins/{uid} referente ao usuário autenticado. */
export async function getAdminByUid(uid: string): Promise<AdminUser | null> {
  const snap = await getDoc(doc(db, ADMINS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return normalizeAdmin(snap.id, snap.data());
}

export async function listAdmins(): Promise<AdminUser[]> {
  const snapshot = await getDocs(query(collection(db, ADMINS_COLLECTION), orderBy('createdAt', 'asc')));
  return snapshot.docs.map((d) => normalizeAdmin(d.id, d.data()));
}
