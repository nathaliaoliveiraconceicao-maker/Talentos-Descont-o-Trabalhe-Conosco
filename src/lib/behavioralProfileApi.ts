import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { BehavioralProfile, BehavioralProfileConsent } from '@/types/behavioralProfile';

const TENANTS_COLLECTION = 'tenants';

function behavioralProfileDoc(tenantId: string, candidateId: string) {
  return doc(db, TENANTS_COLLECTION, tenantId, 'candidates', candidateId, 'behavioralProfile', 'data');
}

function evaluationsCol(tenantId: string, candidateId: string) {
  return collection(db, TENANTS_COLLECTION, tenantId, 'candidates', candidateId, 'evaluations');
}

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

/**
 * Grava as respostas de perfil comportamental do candidato numa subcoleção
 * SEPARADA do documento principal de candidato — nunca como campos do
 * candidato em si. Isso é proposital: o Firestore só consegue restringir
 * leitura por DOCUMENTO inteiro, não por campo dentro de um documento, então
 * é a única forma de garantir (via Rules) que viewer/outro tenant/o próprio
 * candidato depois do envio nunca leem essas respostas, mesmo que a leitura
 * geral da ficha do candidato continue liberada para owner/admin/rh.
 *
 * Deve ser chamada DEPOIS que o documento do candidato já existe (o Rules
 * de criação deste subdocumento valida isso com um exists()/get() no
 * candidato pai) — ver submitCandidate em candidatesApi.ts.
 */
export async function submitBehavioralProfile(
  tenantId: string,
  candidateId: string,
  profile: BehavioralProfile,
  consent: BehavioralProfileConsent
): Promise<void> {
  await setDoc(behavioralProfileDoc(tenantId, candidateId), {
    tenantId,
    candidateId,
    profile,
    consent,
    createdAt: new Date().toISOString(),
  });
}

export interface BehavioralProfileRecord {
  profile: BehavioralProfile;
  consent: BehavioralProfileConsent;
  createdAt: string;
}

/**
 * Leitura restrita a owner/admin/rh pelas Rules — para qualquer outro
 * papel/contexto a chamada falha com permission-denied antes mesmo de
 * chegar aqui, então o retorno null cobre tanto "candidatura antiga sem
 * perfil preenchido" quanto "documento não existe por qualquer outro
 * motivo", sem distinguir os dois casos ao usuário (a UI já não deveria
 * nem tentar chamar isto fora dos papéis permitidos).
 */
export async function getBehavioralProfile(
  tenantId: string,
  candidateId: string
): Promise<BehavioralProfileRecord | null> {
  const snap = await getDoc(behavioralProfileDoc(tenantId, candidateId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    profile: (data.profile ?? {}) as BehavioralProfile,
    consent: data.consent as BehavioralProfileConsent,
    createdAt: timestampToIso(data.createdAt),
  };
}

export interface InterviewerNote {
  id: string;
  type: 'behavioral_profile';
  /** Quando definido, é a observação de UMA pergunta específica; quando ausente, é a nota geral "Observações do entrevistador". */
  questionKey?: string;
  interviewerNotes: string;
  evaluatorId: string;
  evaluatorName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cada chamada cria um documento NOVO (nunca atualiza um existente) —
 * mesmo padrão já usado em tenants/{t}/evaluations para o histórico de
 * avaliações do recrutador: histórico imutável, a observação "atual" é
 * sempre a mais recente de cada questionKey (ou geral).
 */
export async function addInterviewerNote(
  tenantId: string,
  candidateId: string,
  input: { interviewerNotes: string; questionKey?: string; evaluatorId: string; evaluatorName: string }
): Promise<void> {
  const nowIso = new Date().toISOString();
  await addDoc(evaluationsCol(tenantId, candidateId), {
    type: 'behavioral_profile',
    questionKey: input.questionKey ?? null,
    interviewerNotes: input.interviewerNotes,
    evaluatorId: input.evaluatorId,
    evaluatorName: input.evaluatorName,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}

export async function listInterviewerNotes(tenantId: string, candidateId: string): Promise<InterviewerNote[]> {
  const snapshot = await getDocs(query(evaluationsCol(tenantId, candidateId), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      type: 'behavioral_profile',
      questionKey: data.questionKey ?? undefined,
      interviewerNotes: data.interviewerNotes as string,
      evaluatorId: data.evaluatorId as string,
      evaluatorName: data.evaluatorName as string,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    };
  });
}
