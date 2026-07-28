import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import type { AdminUser } from '@/types/admin';

const ADMINS_COLLECTION = 'admins';

export async function getAdminByUid(uid: string): Promise<AdminUser | null> {
  const snap = await getDoc(doc(db, ADMINS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return snap.data() as AdminUser;
}

export async function listAdmins(): Promise<AdminUser[]> {
  const snapshot = await getDocs(query(collection(db, ADMINS_COLLECTION), orderBy('createdAt', 'asc')));
  return snapshot.docs.map((d) => d.data() as AdminUser);
}
