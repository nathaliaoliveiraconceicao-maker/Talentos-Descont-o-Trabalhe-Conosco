/**
 * Tipos centrais do catálogo. Espelham (de forma simplificada) as tabelas
 * `products` / `product_variants` do Supabase — ver supabase/schema.sql.
 */

export type ProductLine = 'adulto' | 'infantil' | 'feminino'

export type ProductVersion = 'jogador' | 'torcedor'

export type SleeveType = 'manga_curta' | 'manga_longa'

export type ShirtKind = 'atual' | 'retro'

/**
 * Classificação de licenciamento. Nunca deve ser omitida ou apresentada de
 * forma enganosa — ver `LicensingBadge` e a seção de transparência na PDP.
 */
export type LicensingStatus =
  | 'oficial_licenciada'
  | 'versao_torcedor_licenciada'
  | 'versao_jogador_licenciada'
  | 'retro_licenciada'
  | 'alternativa_licenciada'
  | 'inspirada_nao_licenciada'

export type ProductBadge = 'lancamento' | 'retro' | 'promocao' | 'exclusivo'

export type CompetitionKind = 'clube_brasileiro' | 'clube_internacional' | 'selecao' | 'streetwear'

export interface ProductVariant {
  id: string
  size: string // P, M, G, GG, 2G, ou infantil 4, 6, 8...
  stock: number
  sku: string
}

export interface ProductReview {
  id: string
  rating: number // 1-5
  verifiedPurchase: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  careInstructions: string[]
  features: string[]

  competitionKind: CompetitionKind
  club?: string
  league?: string
  season: string
  line: ProductLine
  version: ProductVersion
  sleeve: SleeveType
  kind: ShirtKind
  color: string
  licensing: LicensingStatus

  price: number
  compareAtPrice?: number
  pixDiscountPercent: number
  maxInstallments: number

  personalizationAvailable: boolean
  personalizationPriceAddOn?: number

  images: { url: string; alt: string }[]
  hoverImage?: { url: string; alt: string }

  badges: ProductBadge[]
  rating: number
  reviewsCount: number

  variants: ProductVariant[]

  categorySlugs: string[]

  /**
   * Dados administrativos do fornecedor — NUNCA renderizar no storefront.
   * Presentes aqui só para refletir o shape real do Supabase; a página
   * pública deve sempre consumir um DTO sem este campo.
   */
  supplierInternal?: {
    supplierName: string
    supplierSku: string
    costPrice: number
    processingDays: number
  }
}

export interface Category {
  slug: string
  name: string
  description: string
  heroImage: { url: string; alt: string }
  competitionKind?: CompetitionKind
}

export interface Testimonial {
  id: string
  customerName: string
  rating: number
  comment: string
  productName: string
  date: string
  verifiedPurchase: boolean
  isDemo: boolean
}

export type OrderStatus =
  | 'pagamento_pendente'
  | 'pagamento_aprovado'
  | 'em_separacao'
  | 'enviado_ao_fornecedor'
  | 'em_transito'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'troca_solicitada'
  | 'cancelado'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pagamento_pendente: 'Pagamento pendente',
  pagamento_aprovado: 'Pagamento aprovado',
  em_separacao: 'Pedido em separação',
  enviado_ao_fornecedor: 'Enviado ao fornecedor',
  em_transito: 'Em trânsito',
  saiu_para_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  troca_solicitada: 'Troca solicitada',
  cancelado: 'Cancelado',
}

/** Subconjunto de status visível ao cliente na página de rastreamento. */
export const CUSTOMER_VISIBLE_STATUS: OrderStatus[] = [
  'pagamento_pendente',
  'pagamento_aprovado',
  'em_separacao',
  'em_transito',
  'saiu_para_entrega',
  'entregue',
  'troca_solicitada',
  'cancelado',
]

export interface CartPersonalization {
  name: string
  number: string
}

export interface CartItem {
  productId: string
  slug: string
  name: string
  image: string
  size: string
  price: number
  quantity: number
  personalization?: CartPersonalization
}

export interface Coupon {
  code: string
  description: string
  type: 'percent' | 'fixed' | 'free_shipping'
  value: number
  minSubtotal?: number
  active: boolean
  expiresAt?: string
}
