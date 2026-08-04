'use client'

import Link from 'next/link'
import { useFavorites } from '@/lib/favorites/favorites-context'
import { getProductById } from '@/lib/data/products'
import { ProductCard } from '@/components/product/ProductCard'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { useAuth } from '@/lib/auth/auth-context'

export default function FavoritesPage() {
  const { favoriteIds } = useFavorites()
  const { user, isSupabaseConfigured } = useAuth()
  const favoriteProducts = favoriteIds.map((id) => getProductById(id)).filter((p): p is NonNullable<typeof p> => !!p)

  return (
    <div className="container-page py-6">
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Favoritos' }]} />
      <h1 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Favoritos</h1>

      {isSupabaseConfigured && !user && (
        <p className="mt-2 text-sm text-ink-muted">
          Seus favoritos ficam salvos neste navegador.{' '}
          <Link href="/conta/login" className="underline">
            Crie uma conta ou entre
          </Link>{' '}
          para sincronizar entre dispositivos.
        </p>
      )}

      {favoriteProducts.length === 0 ? (
        <p className="mt-8 text-sm text-ink-muted">
          Você ainda não favoritou nenhum produto. Toque no coração em um produto para salvá-lo aqui.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
