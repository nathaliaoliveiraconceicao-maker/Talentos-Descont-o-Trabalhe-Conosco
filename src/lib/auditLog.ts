import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Log de auditoria (tenants/{tenantId}/auditLogs) — registro somente-leitura
 * (ver firestore.rules) de ações administrativas relevantes, para que o
 * próprio cliente (owner/admin) e o superadmin consigam ver quem fez o quê.
 * Nunca deve impedir a ação principal do usuário: falhas aqui só geram um
 * aviso no console, não um erro visível.
 */
export interface AuditLogInput {
  tenantId: string;
  actorUid: string;
  actorName: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
}

export async function logAuditEvent(input: AuditLogInput): Promise<void> {
  try {
    await addDoc(collection(db, 'tenants', input.tenantId, 'auditLogs'), {
      actorUid: input.actorUid,
      actorName: input.actorName,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      details: input.details ?? {},
      createdAt: new Date().toISOString(),
      createdAtServer: serverTimestamp(),
    });
  } catch (error) {
    console.error('[auditLog] Falha ao registrar evento de auditoria:', error);
  }
}
