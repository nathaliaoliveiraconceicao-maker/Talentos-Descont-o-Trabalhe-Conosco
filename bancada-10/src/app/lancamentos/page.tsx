import type { Metadata } from 'next'
import { products } from '@/lib/data/products'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { ProductCard } from '@/components/product/ProductCard'

export const metadata: Metadata = {
  title: 'Lançamentos',
  description: 'Os lançamentos mais recentes de camisas de futebol na Bancada 10.',
  alternates: { canonical: '/lancamentos' },
}

export default function LaunchesPage() {
  const items = products.filter((p) => p.badges.includes('lancamento'))

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Lançamentos' }]} />
      <h1 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Lançamentos</h1>
      <p className="mt-1 text-sm text-ink-muted">As camisas mais recentes da temporada.</p>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
