export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'canceled' | 'suspended';

/**
 * tenants/{tenantId} — o ID do documento é sempre igual ao slug (validado,
 * único, imutável). Isso evita precisar de uma query para resolver
 * slug -> tenantId: a URL pública "/{slug}" busca diretamente
 * tenants/{slug}.
 */
export interface Tenant {
  tenantId: string;
  name: string;
  legalName?: string;
  slug: string;
  /**
   * @deprecated Campo legado — a plataforma não exibe mais logomarca de
   * cliente em lugar nenhum (a identidade visual é sempre a da VagaHub; cada
   * empresa é identificada só pelo nome em texto). Mantido apenas por
   * compatibilidade com tenants já migrados (ex.: tenants/cliente01 pode
   * ainda ter esse campo gravado) — não é mais lido nem gravável pela
   * interface (ver firestore.rules).
   */
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  active: boolean;
  planId: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedAt: string;
  subscriptionEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Ativa',
  trial: 'Período de teste',
  past_due: 'Pagamento pendente',
  canceled: 'Cancelada',
  suspended: 'Suspensa',
};

/** Assinaturas nesse estado bloqueiam ações administrativas (somente leitura). */
export const BLOCKED_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['suspended', 'canceled'];

export function isTenantOperational(tenant: Pick<Tenant, 'active' | 'subscriptionStatus'>): boolean {
  return tenant.active && !BLOCKED_SUBSCRIPTION_STATUSES.includes(tenant.subscriptionStatus);
}

/** tenants/{tenantId}/settings/general — configurações que o próprio cliente edita. */
export interface TenantSettings {
  heroTitle: string;
  heroSubtitle: string;
  initialMessage: string;
  privacyPolicyText: string;
  talentPoolRetentionMonths: number;
  whatsappGenericMessage: string;
  whatsappInterviewMessage: string;
  updatedAt: string;
  updatedBy: string;
}

export const defaultTenantSettings: Omit<TenantSettings, 'updatedAt' | 'updatedBy'> = {
  heroTitle: 'Seu próximo passo pode começar aqui.',
  heroSubtitle:
    'Cadastre-se no banco de talentos e participe dos nossos futuros processos seletivos.',
  initialMessage:
    'O preenchimento do formulário não garante contratação ou convocação para entrevista.',
  privacyPolicyText:
    'Seus dados são usados exclusivamente para processos de recrutamento e seleção. Não vendemos nem utilizamos suas informações para fins de publicidade.',
  talentPoolRetentionMonths: 24,
  whatsappGenericMessage:
    'Olá, {{nome}}. Somos da equipe de RH da {{empresa}}. Analisamos sua pré-candidatura e gostaríamos de conversar sobre a próxima etapa do nosso processo seletivo.',
  whatsappInterviewMessage:
    'Olá, {{nome}}. Somos do setor de RH da {{empresa}}. Analisamos sua pré-candidatura e gostaríamos de convidar você para uma entrevista no dia {{data}}, às {{horario}}, em {{local}}. Por favor, confirme o recebimento desta mensagem.',
};

/** tenants/{tenantId}/jobs/{jobId} — áreas de interesse configuráveis pelo cliente. */
export interface TenantJobArea {
  id: string;
  label: string;
  active: boolean;
}
