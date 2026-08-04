import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'
import { categories } from '@/lib/data/categories'
import { products } from '@/lib/data/products'

const staticRoutes = [
  '',
  '/lancamentos',
  '/ofertas',
  '/personalizacao',
  '/rastrear-pedido',
  '/institucional/quem-somos',
  '/institucional/contato',
  '/institucional/faq',
  '/institucional/privacidade',
  '/institucional/termos',
  '/institucional/trocas-devolucoes',
  '/institucional/reembolso',
  '/institucional/prazos-envio',
  '/institucional/personalizacao',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: now,
      changeFrequency: (route === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
      priority: route === '' ? 1 : 0.6,
    })),
    ...categories.map((category) => ({
      url: `${siteConfig.url}/categoria/${category.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${siteConfig.url}/produto/${product.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
