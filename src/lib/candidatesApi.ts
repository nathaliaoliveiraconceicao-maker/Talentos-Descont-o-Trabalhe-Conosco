import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { generateProtocol } from './protocol';
import { calculateScore } from './scoring';
import { onlyDigits } from './masks';
import { submitBehavioralProfile } from './behavioralProfileApi';
import type {
  Candidate,
  CandidateFormData,
  CandidateStatus,
  ResumeFile,
  StatusHistoryEntry,
} from '@/types/candidate';
import type { ScoringWeights } from '@/types/admin';

const TENANTS_COLLECTION = 'tenants';

function candidatesCol(tenantId: string) {
  return collection(db, TENANTS_COLLECTION, tenantId, 'candidates');
}
function statusHistoryCol(tenantId: string) {
  return collection(db, TENANTS_COLLECTION, tenantId, 'statusHistory');
}
function evaluationsCol(tenantId: string) {
  return collection(db, TENANTS_COLLECTION, tenantId, 'evaluations');
}

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

const SUBMISSIONS_STORAGE_KEY = 'talentos:candidaturas-recentes';

interface RecentSubmission {
  tenantId: string;
  emailLower: string;
  digits: string;
  submittedAt: number;
}

function readRecentSubmissions(): RecentSubmission[] {
  try {
    const raw = window.localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentSubmission[]) : [];
  } catch {
    return [];
  }
}

/**
 * Verificação de candidatura duplicada — feita no NAVEGADOR (localStorage),
 * não consultando o Firestore. Isso é proposital: pelas Firestore Rules,
 * candidatos (não autenticados) só podem CRIAR uma pré-candidatura, nunca
 * ler/listar candidaturas (nem as próprias) — isso evita que qualquer
 * visitante consiga enumerar dados de outros candidatos. Como consequência,
 * esta checagem cobre o caso mais comum (reenvio duplicado no mesmo
 * navegador/dispositivo, ex.: duplo clique ou reenvio após atualizar a
 * página) mas não detecta duplicidade entre dispositivos diferentes — isso
 * exigiria uma função de backend (Cloud Function) com acesso privilegiado
 * ao Firestore, fora do escopo deste projeto (ver README).
 */
export async function checkRecentDuplicate(
  tenantId: string,
  email: string,
  whatsapp: string
): Promise<boolean> {
  const digits = onlyDigits(whatsapp);
  const emailLower = email.trim().toLowerCase();
  const cutoff = Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000;

  return readRecentSubmissions().some(
    (s) => s.tenantId === tenantId && s.submittedAt > cutoff && (s.emailLower === emailLower || s.digits === digits)
  );
}

function recordSubmission(tenantId: string, email: string, whatsapp: string): void {
  const cutoff = Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000;
  const existing = readRecentSubmissions().filter((s) => s.submittedAt > cutoff);
  existing.push({
    tenantId,
    emailLower: email.trim().toLowerCase(),
    digits: onlyDigits(whatsapp),
    submittedAt: Date.now(),
  });
  try {
    window.localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // armazenamento indisponível (ex.: modo privado); ignora silenciosamente
  }
}

async function uploadResume(tenantId: string, candidateId: string, file: File): Promise<ResumeFile> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const storagePath = `tenants/${tenantId}/candidates/${candidateId}/resume/${safeName}`;
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
  tenantId: string,
  data: CandidateFormData,
  resumeFile: File | null,
  weights?: ScoringWeights
): Promise<{ id: string; protocol: string }> {
  // Gera o ID do documento antecipadamente para que o currículo (se houver)
  // possa ser enviado para tenants/{tenantId}/candidates/{candidateId}/resume/...
  const candidateRef = doc(candidatesCol(tenantId));
  const resume = resumeFile ? await uploadResume(tenantId, candidateRef.id, resumeFile) : null;

  // behavioralProfile/behavioralProfileConsent nunca vão para o documento
  // principal do candidato — são gravados à parte, depois, numa subcoleção
  // restrita (ver submitBehavioralProfile). Não entram no cálculo de
  // pontuação (calculateScore não os referencia) nem no protocolo.
  const { behavioralProfile, behavioralProfileConsent, ...restData } = data;
  const dataWithResume: CandidateFormData = { ...restData, resume };
  const { total, breakdown } = calculateScore(dataWithResume, weights);
  const protocol = generateProtocol();
  const nowIso = new Date().toISOString();

  const payload = {
    ...dataWithResume,
    tenantId,
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

  await setDoc(candidateRef, payload);

  // Só grava a subcoleção restrita se a seção foi realmente preenchida
  // (consentimento aceito) — candidaturas de tenants sem a triagem ativada
  // nunca chegam com behavioralProfileConsent definido. Escrita feita DEPOIS
  // do candidato pai já existir: a regra de criação deste subdocumento
  // confere isso com um exists() no candidato.
  if (behavioralProfileConsent?.accepted) {
    await submitBehavioralProfile(
      tenantId,
      candidateRef.id,
      { ...behavioralProfile, filledAt: nowIso },
      behavioralProfileConsent
    );
  }

  await addDoc(statusHistoryCol(tenantId), {
    candidateId: candidateRef.id,
    status: 'nova_candidatura',
    changedAt: nowIso,
    changedBy: 'sistema',
    note: 'Candidatura recebida pelo formulário público.',
  });

  recordSubmission(tenantId, data.contact.email, data.contact.whatsapp);

  return { id: candidateRef.id, protocol };
}

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export async function listCandidates(tenantId: string): Promise<Candidate[]> {
  const snapshot = await getDocs(query(candidatesCol(tenantId), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      tenantId,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    } as Candidate;
  });
}

export async function getCandidate(tenantId: string, id: string): Promise<Candidate | null> {
  const snap = await getDoc(doc(db, TENANTS_COLLECTION, tenantId, 'candidates', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    tenantId,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  } as Candidate;
}

export async function getStatusHistory(tenantId: string, candidateId: string): Promise<StatusHistoryEntry[]> {
  const snapshot = await getDocs(query(statusHistoryCol(tenantId), where('candidateId', '==', candidateId)));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as StatusHistoryEntry & { candidateId: string }))
    .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
}

export async function updateCandidateStatus(
  tenantId: string,
  candidateId: string,
  status: CandidateStatus,
  changedBy: string,
  options?: { note?: string; changedByUid?: string; previousStatus?: CandidateStatus | null }
): Promise<void> {
  const nowIso = new Date().toISOString();
  await updateDoc(doc(db, TENANTS_COLLECTION, tenantId, 'candidates', candidateId), {
    status,
    updatedAt: nowIso,
  });
  await addDoc(statusHistoryCol(tenantId), {
    candidateId,
    status,
    previousStatus: options?.previousStatus ?? null,
    changedAt: nowIso,
    changedBy,
    changedByUid: options?.changedByUid ?? '',
    note: options?.note ?? '',
  });
}

export interface EvaluationUpdate {
  recruiterNote?: string;
  recruiterRating?: number;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  interviewNotes?: string;
  responsibleName?: string;
  isFavorite?: boolean;
}

export async function updateCandidateEvaluation(
  tenantId: string,
  candidateId: string,
  evaluation: EvaluationUpdate,
  updatedBy: string
): Promise<void> {
  const nowIso = new Date().toISOString();
  await updateDoc(doc(db, TENANTS_COLLECTION, tenantId, 'candidates', candidateId), {
    evaluation,
    updatedAt: nowIso,
  });
  await addDoc(evaluationsCol(tenantId), {
    candidateId,
    ...evaluation,
    updatedBy,
    updatedAt: nowIso,
  });
}

/** Contagem eficiente (sem baixar os documentos) — usada no painel do superadmin. */
export async function countCandidatesForTenant(tenantId: string): Promise<number> {
  const snapshot = await getCountFromServer(candidatesCol(tenantId));
  return snapshot.data().count;
}

export async function deleteCandidateData(tenantId: string, candidateId: string): Promise<void> {
  const candidate = await getCandidate(tenantId, candidateId);
  if (candidate?.resume?.storagePath) {
    try {
      await deleteObject(ref(storage, candidate.resume.storagePath));
    } catch {
      // arquivo pode já não existir; segue com a exclusão dos dados
    }
  }
  await deleteDoc(doc(db, TENANTS_COLLECTION, tenantId, 'candidates', candidateId));
}
