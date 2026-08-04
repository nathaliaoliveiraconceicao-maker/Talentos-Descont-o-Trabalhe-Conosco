import type { Coupon } from '@/lib/types'

/**
 * Cupons demonstrativos. Em produção isto vem da tabela `coupons` no
 * Supabase (ver supabase/schema.sql) e é validado no servidor — nunca
 * aplicar desconto apenas confiando no client.
 */
export const demoCoupons: Coupon[] = [
  {
    code: 'BEMVINDO10',
    description: '10% de desconto na primeira compra',
    type: 'percent',
    value: 10,
    active: true,
  },
  {
    code: 'FRETEGRATIS',
    description: 'Frete grátis para todo o Brasil',
    type: 'free_shipping',
    value: 0,
    minSubtotal: 249.9,
    active: true,
  },
]

export function findCoupon(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase()
  return demoCoupons.find((c) => c.code === normalized && c.active)
}

export const FREE_SHIPPING_THRESHOLD = 399

/**
 * Liga/desliga a campanha de frete grátis por valor mínimo em todo o site
 * (barra de progresso no carrinho, avisos no topo). Controlar pelo painel
 * admin (Configurações da loja) quando a campanha começar/terminar.
 */
export const FREE_SHIPPING_CAMPAIGN_ACTIVE = true
