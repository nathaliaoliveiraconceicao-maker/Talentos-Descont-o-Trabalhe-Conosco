export type PromotionType = 'buy_x_pay_y' | 'progressive_discount' | 'free_shipping' | 'first_purchase_coupon'

export interface Promotion {
  id: string
  type: PromotionType
  title: string
  description: string
  couponCode?: string
  active: boolean
  startsAt?: string
  endsAt?: string
}

/**
 * Bloco promocional da home. Só é exibido quando existe uma promoção com
 * `active: true` — nunca renderizar uma condição promocional sem que ela
 * esteja de fato configurada e validada (ex.: cupom existente em
 * lib/data/coupons.ts, ou regra correspondente no backend/admin).
 *
 * Em produção isto vem da tabela `promotions` no Supabase, editável pelo
 * painel admin.
 */
export const currentPromotion: Promotion = {
  id: 'promo-boas-vindas',
  type: 'first_purchase_coupon',
  title: 'Primeira compra com desconto',
  description: 'Use o cupom BEMVINDO10 e ganhe 10% de desconto na sua primeira compra na Bancada 10.',
  couponCode: 'BEMVINDO10',
  active: true,
}
