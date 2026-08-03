import { inviteTenantUser, type InviteTenantUserResult } from './tenantUsersApi';
import type { TenantRole } from '@/types/admin';

export interface CreateTenantUserInput {
  tenantId: string;
  name: string;
  email: string;
  role: TenantRole;
  invitedBy: string;
}

/**
 * Cria o primeiro usuário de um tenant a partir do painel do superadmin.
 * Delega inteiramente para o fluxo de convite (src/lib/tenantUsersApi.ts) —
 * o superadmin nunca define, vê ou envia a senha do cliente.
 */
export async function createTenantUser(input: CreateTenantUserInput): Promise<InviteTenantUserResult> {
  return inviteTenantUser(input);
}
