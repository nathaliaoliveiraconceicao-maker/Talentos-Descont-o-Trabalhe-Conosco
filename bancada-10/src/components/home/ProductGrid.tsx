import Link from 'next/link'
import type { Product } from '@/lib/types'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'

export function ProductGridSection({
  title,
  subtitle,
  products,
  ctaHref,
  ctaLabel,
}: {
  title: string
  subtitle?: string
  products: Product[]
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <section className="py-14">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          </div>
          {ctaHref && ctaLabel && (
            <Link href={ctaHref}>
              <Button variant="outline" size="sm">
                {ctaLabel}
              </Button>
            </Link>
          )}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
