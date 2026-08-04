import Image from 'next/image'
import { Instagram } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { placeholderImage } from '@/lib/placeholder'

/**
 * Área preparada para a integração com o Instagram da marca.
 * Hoje exibe imagens placeholder — para publicações reais:
 *  1. Configurar INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_BUSINESS_ACCOUNT_ID (.env),
 *  2. Buscar as últimas publicações via Instagram Graph API em uma rota
 *     server-side (ex.: app/api/instagram/route.ts) e substituir este array,
 *  3. Alternativa mais simples: cadastrar imagens manualmente pelo painel admin.
 */
const demoPosts = Array.from({ length: 6 }, (_, i) => ({
  id: `demo-post-${i + 1}`,
  image: placeholderImage(`Instagram Bancada 10 #${i + 1}`, i % 2 === 0 ? 'ink' : 'red', 600, 600),
}))

export function InstagramFeed() {
  return (
    <section className="py-14">
      <div className="container-page">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Siga a Bancada 10</h2>
          <a
            href={siteConfig.social.instagram || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-semibold text-ink hover:text-bancada-red"
          >
            <Instagram size={16} /> @bancada10
          </a>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {demoPosts.map((post) => (
            <div key={post.id} className="relative aspect-square overflow-hidden rounded bg-bancada-off">
              <Image src={post.image} alt="Publicação demonstrativa do Instagram da Bancada 10" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
