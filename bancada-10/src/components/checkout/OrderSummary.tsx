import { CartLineItem } from '@/components/cart/CartLineItem'
import { formatCurrency } from '@/lib/utils/format'
import type { CartItem } from '@/lib/types'

export function OrderSummary({
  items,
  subtotal,
  discount,
  shippingCost,
  total,
}: {
  items: CartItem[]
  subtotal: number
  discount: number
  shippingCost: number | null
  total: number
}) {
  return (
    <aside className="h-fit rounded border border-ink/10 p-5">
      <h2 className="font-display text-sm uppercase tracking-wide2">Resumo do pedido</h2>
      <div className="mt-3 max-h-72 divide-y divide-ink/10 overflow-y-auto">
        {items.map((item) => (
          <CartLineItem key={`${item.productId}-${item.size}-${item.personalization?.name ?? ''}`} item={item} />
        ))}
      </div>
      <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
        <div className="flex justify-between text-ink-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-bancada-red">
            <span>Desconto</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink-muted">
          <span>Frete</span>
          <span>{shippingCost === null ? 'A calcular' : shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}</span>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-semibold text-ink">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </aside>
  )
}
