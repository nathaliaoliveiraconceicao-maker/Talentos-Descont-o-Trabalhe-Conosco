import { discountPercent, formatCurrency, installmentPrice, pixPrice } from '@/lib/utils/format'
import { cx } from '@/lib/utils/format'

export function PriceBlock({
  price,
  compareAtPrice,
  pixDiscountPercent,
  maxInstallments,
  size = 'md',
}: {
  price: number
  compareAtPrice?: number
  pixDiscountPercent: number
  maxInstallments: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const discount = discountPercent(price, compareAtPrice)
  const pix = pixPrice(price, pixDiscountPercent)
  const installment = installmentPrice(price, maxInstallments)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {compareAtPrice && compareAtPrice > price && (
          <span className="text-sm text-ink-muted line-through">{formatCurrency(compareAtPrice)}</span>
        )}
        {discount > 0 && (
          <span className="rounded-sm bg-bancada-red px-1.5 py-0.5 text-[11px] font-bold text-white">-{discount}%</span>
        )}
      </div>
      <p className={cx('font-display', size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl')}>
        {formatCurrency(price)}
      </p>
      <p className="text-sm text-ink-muted">
        <span className="font-semibold text-ink">{formatCurrency(pix)}</span> no Pix ({pixDiscountPercent}% off) ·{' '}
        {maxInstallments}x de {formatCurrency(installment)} sem juros
      </p>
    </div>
  )
}
