import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { generateProtocol } from './protocol';
import { calculateScore } from './scoring';
import { onlyDigits } from './masks';
import type {
  Candidate,
  CandidateFormData,
  CandidateStatus,
  ResumeFile,
  StatusHistoryEntry,
} from '@/types/candidate';
import type { ScoringWeights } from '@/types/admin';

const CANDIDATES_COLLECTION = 'candidates';
const STATUS_HISTORY_COLLECTION = 'statusHistory';
const EVALUATIONS_COLLECTION = 'evaluations';

export const RESUME_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const RESUME_ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];
export const RESUME_ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

/** Janela usada para alertar sobre candidaturas duplicadas com o mesmo contato. */
const DUPLICATE_WINDOW_HOURS = 48;

export async function checkRecentDuplicate(
  email: string,
  whatsapp: string
): Promise<boolean> {
  const digits = onlyDigits(whatsapp);
  const emailLower = email.trim().toLowerCase();

  const [byEmail, byPhone] = await Promise.all([
    getDocs(query(collection(db, CANDIDATES_COLLECTION), where('contact.email', '==', emailLower))),
    getDocs(query(collection(db, CANDIDATES_COLLECTION), where('contact.whatsappDigits', '==', digits))),
  ]);

  const cutoff = Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000;
  const isRecent = (createdAt: string) => new Date(createdAt).getTime() > cutoff;

  const hasRecentEmail = byEmail.docs.some((d) => isRecent(d.data().createdAt));
  const hasRecentPhone = byPhone.docs.some((d) => isRecent(d.data().createdAt));

  return hasRecentEmail || hasRecentPhone;
}

export async function uploadResume(file: File): Promise<ResumeFile> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const storagePath = `resumes/${timestamp}-${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const fileUrl = await getDownloadURL(storageRef);

  return {
    fileName: file.name,
    fileUrl,
    storagePath,
    fileType: file.type,
    fileSizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export async function submitCandidate(
  data: CandidateFormData,
  weights?: ScoringWeights
): Promise<{ id: string; protocol: string }> {
  const { total, breakdown } = calculateScore(data, weights);
  const protocol = generateProtocol();
  const nowIso = new Date().toISOString();

  const payload = {
    ...data,
    contact: {
      ...data.contact,
      email: data.contact.email.trim().toLowerCase(),
      whatsappDigits: onlyDigits(data.contact.whatsapp),
    },
    protocol,
    status: 'nova_candidatura' as CandidateStatus,
    score: total,
    scoreBreakdown: breakdown,
    createdAt: nowIso,
    updatedAt: nowIso,
    createdAtServer: serverTimestamp(),
    evaluation: {
      isFavorite: false,
    },
  };

  const docRef = await addDoc(collection(db, CANDIDATES_COLLECTION), payload);

  await addDoc(collection(db, STATUS_HISTORY_COLLECTION), {
    candidateId: docRef.id,
    status: 'nova_candidatura',
    changedAt: nowIso,
    changedBy: 'sistema',
    note: 'Candidatura recebida pelo formulário público.',
  });

  return { id: docRef.id, protocol };
}

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export async function listCandidates(): Promise<Candidate[]> {
  const snapshot = await getDocs(
    query(collection(db, CANDIDATES_COLLECTION), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    } as Candidate;
  });
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  const snap = await getDoc(doc(db, CANDIDATES_COLLECTION, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  } as Candidate;
}

export async function getStatusHistory(candidateId: string): Promise<StatusHistoryEntry[]> {
  const snapshot = await getDocs(
    query(collection(db, STATUS_HISTORY_COLLECTION), where('candidateId', '==', candidateId))
  );
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as StatusHistoryEntry & { candidateId: string }))
    .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
}

export async function updateCandidateStatus(
  candidateId: string,
  status: CandidateStatus,
  changedBy: string,
  note?: string
): Promise<void> {
  const nowIso = new Date().toISOString();
  await updateDoc(doc(db, CANDIDATES_COLLECTION, candidateId), {
    status,
    updatedAt: nowIso,
  });
  await addDoc(collection(db, STATUS_HISTORY_COLLECTION), {
    candidateId,
    status,
    changedAt: nowIso,
    changedBy,
    note: note ?? '',
  });
}

export interface EvaluationUpdate {
  recruiterNote?: string;
  recruiterRating?: number;
  interviewDate?: string;
  interviewTime?: string;
  responsibleName?: string;
  isFavorite?: boolean;
}

export async function updateCandidateEvaluation(
  candidateId: string,
  evaluation: EvaluationUpdate,
  updatedBy: string
): Promise<void> {
  const nowIso = new Date().toISOString();
  await updateDoc(doc(db, CANDIDATES_COLLECTION, candidateId), {
    evaluation,
    updatedAt: nowIso,
  });
  await addDoc(collection(db, EVALUATIONS_COLLECTION), {
    candidateId,
    ...evaluation,
    updatedBy,
    updatedAt: nowIso,
  });
}

export async function deleteCandidateData(candidateId: string): Promise<void> {
  const candidate = await getCandidate(candidateId);
  if (candidate?.resume?.storagePath) {
    try {
      await deleteObject(ref(storage, candidate.resume.storagePath));
    } catch {
      // arquivo pode já não existir; segue com a exclusão dos dados
    }
  }
  await deleteDoc(doc(db, CANDIDATES_COLLECTION, candidateId));
}
