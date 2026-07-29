/**
 * Papéis de usuários de um tenant (tenants/{tenantId}/users/{uid}).
 * "superadmin" NÃO é um papel de tenant — superadmins vivem em
 * platformAdmins/{uid}, fora de qualquer tenant (ver PlatformAdmin abaixo).
 */
export type TenantRole = 'owner' | 'admin' | 'rh' | 'viewer';

export const TENANT_ROLE_LABELS: Record<TenantRole, string> = {
  owner: 'Proprietário(a)',
  admin: 'Administrador(a)',
  rh: 'RH',
  viewer: 'Visualizador(a)',
};

/** Papéis com permissão de escrita (alterar status, avaliações, configurações). */
export const WRITE_ROLES: TenantRole[] = ['owner', 'admin', 'rh'];
/** Papéis com permissão para gerenciar usuários e configurações do tenant. */
export const MANAGE_ROLES: TenantRole[] = ['owner', 'admin'];

/** tenants/{tenantId}/users/{uid} */
export interface AdminUser {
  uid: string;
  tenantId: string;
  email: string;
  name: string;
  role: TenantRole;
  createdAt: string;
  active: boolean;
}

/** platformAdmins/{uid} — usuários da própria plataforma, com acesso a todos os tenants. */
export interface PlatformAdmin {
  uid: string;
  email: string;
  name: string;
  active: boolean;
  createdAt: string;
}

/** userIndex/{uid} — índice para descobrir a qual tenant um uid pertence, sem
 * precisar de collectionGroup queries no login. */
export interface UserIndexEntry {
  tenantId: string;
}

export interface ScoringWeights {
  easyAccess: number;
  variedAvailability: number;
  weekendAvailability: number;
  areaExperience: number;
  supermarketExperience: number;
  customerServiceExperience: number;
  canStartImmediately: number;
  resumeAttached: number;
  wellFilledProfile: number;
}

export const defaultScoringWeights: ScoringWeights = {
  easyAccess: 1,
  variedAvailability: 2,
  weekendAvailability: 2,
  areaExperience: 3,
  supermarketExperience: 2,
  customerServiceExperience: 1,
  canStartImmediately: 1,
  resumeAttached: 1,
  wellFilledProfile: 1,
};

/** tenants/{tenantId}/scoringSettings/default */
export interface ScoringSettings {
  weights: ScoringWeights;
  updatedAt: string;
  updatedBy: string;
}
