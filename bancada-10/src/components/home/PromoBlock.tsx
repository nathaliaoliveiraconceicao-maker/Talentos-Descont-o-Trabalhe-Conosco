import { Tag } from 'lucide-react'
import { currentPromotion } from '@/lib/data/promotions'

export function PromoBlock() {
  if (!currentPromotion.active) return null

  return (
    <section className="py-4">
      <div className="container-page">
        <div className="flex flex-col items-start gap-4 rounded bg-bancada-red px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Tag className="mt-1 shrink-0" size={22} aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl uppercase tracking-tightest sm:text-2xl">{currentPromotion.title}</h2>
              <p className="mt-1 max-w-lg text-sm text-white/90">{currentPromotion.description}</p>
            </div>
          </div>
          {currentPromotion.couponCode && (
            <div className="rounded border-2 border-dashed border-white/70 px-4 py-2 font-display text-lg tracking-wide2">
              {currentPromotion.couponCode}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
