import type { Metadata } from 'next'
import { products } from '@/lib/data/products'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { ProductCard } from '@/components/product/ProductCard'

export const metadata: Metadata = {
  title: 'Ofertas',
  description: 'Camisas de futebol com desconto na Bancada 10.',
  alternates: { canonical: '/ofertas' },
}

export default function OffersPage() {
  const items = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Ofertas' }]} />
      <h1 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Ofertas</h1>
      <p className="mt-1 text-sm text-ink-muted">Aproveite os descontos ativos enquanto durar o estoque.</p>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">Nenhuma oferta ativa no momento.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
