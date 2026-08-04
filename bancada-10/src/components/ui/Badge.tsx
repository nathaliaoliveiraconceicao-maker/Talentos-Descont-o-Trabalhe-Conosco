import type { ProductBadge } from '@/lib/types'
import { cx } from '@/lib/utils/format'

const BADGE_LABEL: Record<ProductBadge, string> = {
  lancamento: 'Lançamento',
  retro: 'Retrô',
  promocao: 'Promoção',
  exclusivo: 'Exclusivo',
}

const BADGE_CLASS: Record<ProductBadge, string> = {
  lancamento: 'bg-ink text-white',
  retro: 'bg-bancada-off text-ink border border-ink/15',
  promocao: 'bg-bancada-red text-white',
  exclusivo: 'bg-white text-ink border border-ink',
}

export function ProductBadgePill({ badge }: { badge: ProductBadge }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-sm px-2 py-1 text-[11px] font-bold uppercase tracking-wide2',
        BADGE_CLASS[badge]
      )}
    >
      {BADGE_LABEL[badge]}
    </span>
  )
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center rounded-sm border border-ink/15 px-2 py-0.5 text-xs text-ink-muted', className)}>
      {children}
    </span>
  )
}
