import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { Benefits } from '@/components/home/Benefits'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { ProductGridSection } from '@/components/home/ProductGrid'
import { RetroSection } from '@/components/home/RetroSection'
import { PromoBlock } from '@/components/home/PromoBlock'
import { Testimonials } from '@/components/home/Testimonials'
import { InstagramFeed } from '@/components/home/InstagramFeed'
import { Newsletter } from '@/components/home/Newsletter'
import { getFeaturedProducts, getRetroProducts } from '@/lib/data/products'

export const metadata: Metadata = {
  title: 'Bancada 10 — Camisas de Futebol Atuais, Retrôs e Streetwear',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  const featured = getFeaturedProducts(8)
  const retro = getRetroProducts(4)

  return (
    <>
      <Hero />
      <Benefits />
      <CategoryGrid />
      <ProductGridSection
        title="Mais procuradas"
        subtitle="Os modelos que mais saem na Bancada 10"
        products={featured}
        ctaHref="/lancamentos"
        ctaLabel="Ver todos"
      />
      <RetroSection />
      <PromoBlock />
      {retro.length > 0 && (
        <ProductGridSection title="Coleção retrô" products={retro} ctaHref="/categoria/camisas-retro" ctaLabel="Ver coleção" />
      )}
      <Testimonials />
      <InstagramFeed />
      <Newsletter />
    </>
  )
}
