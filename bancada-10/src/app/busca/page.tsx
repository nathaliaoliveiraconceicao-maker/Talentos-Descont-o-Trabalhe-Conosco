import type { Metadata } from 'next'
import { products } from '@/lib/data/products'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { ProductCard } from '@/components/product/ProductCard'

export const metadata: Metadata = {
  title: 'Resultados da busca',
  robots: { index: false, follow: true },
}

function searchProducts(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return products.filter((p) =>
    [p.name, p.club, p.league, p.season, p.color].filter(Boolean).some((field) => field!.toLowerCase().includes(q))
  )
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q ?? ''
  const results = searchProducts(query)

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Busca' }]} />
      <h1 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">
        Resultados para &ldquo;{query}&rdquo;
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
      </p>

      {results.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">
          Não encontramos produtos para essa busca. Tente o nome de um time, seleção ou temporada.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
