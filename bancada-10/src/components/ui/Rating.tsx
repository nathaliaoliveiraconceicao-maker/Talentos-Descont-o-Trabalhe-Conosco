import { Star } from 'lucide-react'
import { cx } from '@/lib/utils/format'

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Avaliação ${value.toFixed(1)} de 5`}>
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cx(i <= Math.round(value) ? 'fill-bancada-red text-bancada-red' : 'fill-transparent text-ink/20')}
          />
        ))}
      </div>
      {typeof count === 'number' && <span className="text-xs text-ink-muted">({count})</span>}
    </div>
  )
}
