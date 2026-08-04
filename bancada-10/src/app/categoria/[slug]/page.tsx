import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { categories, getCategoryBySlug } from '@/lib/data/categories'
import { getProductsByCategory } from '@/lib/data/products'
import { buildFilterFacets, filterProducts, sortProducts, type CatalogSearchParams } from '@/lib/catalog/filter'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { FilterDrawerTrigger } from '@/components/catalog/FilterDrawerTrigger'
import { SortSelect } from '@/components/catalog/SortSelect'
import { Pagination } from '@/components/catalog/Pagination'
import { ProductCard } from '@/components/product/ProductCard'

const PAGE_SIZE = 12

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }))
}

// Ver comentário equivalente em app/produto/[slug]/page.tsx sobre
// dynamicParams e o status HTTP de notFound() fora da Vercel.
export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: { title: category.name, description: category.description },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<CatalogSearchParams>
}) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const baseProducts = getProductsByCategory(category.slug)
  const facets = buildFilterFacets(baseProducts)
  const filtered = sortProducts(filterProducts(baseProducts, resolvedSearchParams), resolvedSearchParams.ordenar)

  const currentPage = Math.max(Number(resolvedSearchParams.pagina) || 1, 1)
  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function buildPageHref(page: number) {
    const nextParams = new URLSearchParams(
      Object.entries(resolvedSearchParams).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    )
    nextParams.set('pagina', String(page))
    return `/categoria/${category!.slug}?${nextParams.toString()}`
  }

  return (
    <div>
      <div className="relative h-40 overflow-hidden sm:h-56">
        <Image src={category.heroImage.url} alt={category.heroImage.alt} fill className="object-cover" priority />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/80 to-transparent">
          <div className="container-page pb-6">
            <h1 className="font-display text-2xl uppercase text-white sm:text-4xl">{category.name}</h1>
          </div>
        </div>
      </div>

      <div className="container-page">
        <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: category.name }]} />
        <p className="mb-4 max-w-2xl text-sm text-ink-muted">{category.description}</p>

        <Suspense>
          <div className="mb-6 flex items-center justify-between gap-4 border-y border-ink/10 py-3">
            <p className="text-sm text-ink-muted">
              {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}
            </p>
            <div className="flex items-center gap-2">
              <FilterDrawerTrigger facets={facets} />
              <SortSelect />
            </div>
          </div>
        </Suspense>

        <div className="grid grid-cols-1 gap-8 pb-16 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <Suspense>
              <FilterPanel facets={facets} />
            </Suspense>
          </aside>

          <div>
            {pageItems.length === 0 ? (
              <p className="py-16 text-center text-sm text-ink-muted">
                Nenhum produto encontrado com os filtros selecionados.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
                {pageItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={buildPageHref} />
          </div>
        </div>
      </div>
    </div>
  )
}
