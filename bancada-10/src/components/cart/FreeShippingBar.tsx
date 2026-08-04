import { FREE_SHIPPING_CAMPAIGN_ACTIVE, FREE_SHIPPING_THRESHOLD } from '@/lib/data/coupons'
import { formatCurrency } from '@/lib/utils/format'

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  if (!FREE_SHIPPING_CAMPAIGN_ACTIVE) return null

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const achieved = remaining === 0

  return (
    <div className="bg-bancada-off px-4 py-3">
      <p className="text-xs font-medium text-ink">
        {achieved ? (
          'Você garantiu frete grátis nesta compra!'
        ) : (
          <>
            Faltam <span className="font-bold text-bancada-red">{formatCurrency(remaining)}</span> para o frete grátis
          </>
        )}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-bancada-red transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
