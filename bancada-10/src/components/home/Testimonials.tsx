import { BadgeCheck } from 'lucide-react'
import { testimonials } from '@/lib/data/testimonials'
import { Rating } from '@/components/ui/Rating'

export function Testimonials() {
  return (
    <section className="border-t border-ink/10 bg-bancada-off py-14">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">O que dizem os torcedores</h2>
          <span className="rounded-sm border border-ink/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            Conteúdo demonstrativo
          </span>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="flex flex-col gap-2 rounded border border-ink/10 bg-white p-5">
              <Rating value={testimonial.rating} />
              <p className="text-sm text-ink">&ldquo;{testimonial.comment}&rdquo;</p>
              <div className="mt-2 text-xs text-ink-muted">
                <p className="font-semibold text-ink">{testimonial.customerName}</p>
                <p>{testimonial.productName}</p>
                <div className="mt-1 flex items-center gap-3">
                  {testimonial.verifiedPurchase && (
                    <span className="flex items-center gap-1 text-bancada-red">
                      <BadgeCheck size={14} /> Compra verificada
                    </span>
                  )}
                  {testimonial.isDemo && <span>· Exemplo</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
