import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { findVersionSiblings, getProductBySlug, getRelatedProducts, products } from '@/lib/data/products'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { Gallery } from '@/components/product/Gallery'
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel'
import { ProductGridSection } from '@/components/home/ProductGrid'
import { categories } from '@/lib/data/categories'
import { siteConfig } from '@/lib/site-config'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

// Todos os slugs válidos já vêm de generateStaticParams (catálogo estático);
// qualquer outro valor não deve gerar uma página nova sob demanda. Ao migrar
// para produtos vindos do Supabase, trocar para `true` (ou remover esta
// linha). Nota sobre status HTTP: ver "Páginas de erro" no README —
// `next start` local pode devolver 200 para uma rota com notFound() dentro
// de generateStaticParams (comportamento conhecido do App Router fora da
// Vercel); a Vercel corrige isso automaticamente no edge.
export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return {}

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const versionSiblings = findVersionSiblings(product)
  const related = getRelatedProducts(product)
  const primaryCategorySlug = product.categorySlugs[0]
  const primaryCategory = categories.find((c) => c.slug === primaryCategorySlug)

  const inStock = product.variants.some((v) => v.stock > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((i) => `${siteConfig.url}${i.url}`),
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Bancada 10' },
    aggregateRating:
      product.reviewsCount > 0
        ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewsCount }
        : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.price.toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${siteConfig.url}/produto/${product.slug}`,
    },
  }

  return (
    <div className="container-page py-6">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb
        items={[
          { label: 'Início', href: '/' },
          ...(primaryCategory ? [{ label: primaryCategory.name, href: `/categoria/${primaryCategory.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Gallery images={product.images} productName={product.name} />
        <ProductPurchasePanel product={product} versionSiblings={versionSiblings} />
      </div>

      <div className="mx-auto mt-14 max-w-3xl divide-y divide-ink/10 border-y border-ink/10">
        <details open className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-display text-sm uppercase tracking-wide2">
            Descrição
            <span className="text-ink-muted group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{product.description}</p>
        </details>

        <details className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-display text-sm uppercase tracking-wide2">
            Características
            <span className="text-ink-muted group-open:rotate-45">+</span>
          </summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </details>

        <details className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-display text-sm uppercase tracking-wide2">
            Cuidados com a peça
            <span className="text-ink-muted group-open:rotate-45">+</span>
          </summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
            {product.careInstructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
        </details>
      </div>

      {related.length > 0 && <ProductGridSection title="Você também pode gostar" products={related} />}
    </div>
  )
}
