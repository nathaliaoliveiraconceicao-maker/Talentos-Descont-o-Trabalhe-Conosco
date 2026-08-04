'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@/lib/types'
import { ProductBadgePill } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { discountPercent, formatCurrency, installmentPrice, pixPrice } from '@/lib/utils/format'
import { useCart } from '@/lib/cart/cart-context'
import { useFavorites } from '@/lib/favorites/favorites-context'
import { cx } from '@/lib/utils/format'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)

  const discount = discountPercent(product.price, product.compareAtPrice)
  const pix = pixPrice(product.price, product.pixDiscountPercent)
  const installment = installmentPrice(product.price, product.maxInstallments)
  const favorite = isFavorite(product.id)
  const primaryImage = product.images[0]
  const hoverImage = product.hoverImage ?? product.images[1]

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true)
      return
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: primaryImage?.url ?? '',
      size: selectedSize,
      price: product.price,
    })
  }

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded bg-bancada-off">
        <Link href={`/produto/${product.slug}`} aria-label={product.name}>
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={cx('object-cover transition-opacity duration-300', hoverImage && 'group-hover:opacity-0')}
            />
          )}
          {hoverImage && (
            <Image
              src={hoverImage.url}
              alt={hoverImage.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.badges.map((badge) => (
            <ProductBadgePill key={badge} badge={badge} />
          ))}
        </div>

        <button
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={favorite}
          aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-ink hover:text-bancada-red"
        >
          <Heart size={16} className={favorite ? 'fill-bancada-red text-bancada-red' : ''} />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 p-2 transition-transform duration-200 group-hover:translate-y-0">
          <div className="flex flex-wrap gap-1">
            {product.variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock === 0}
                onClick={() => {
                  setSelectedSize(v.size)
                  setSizeError(false)
                }}
                className={cx(
                  'h-7 min-w-7 rounded border px-1.5 text-[11px] font-semibold',
                  v.stock === 0 && 'cursor-not-allowed opacity-30 line-through',
                  selectedSize === v.size ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink'
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
          {sizeError && <p className="mt-1 text-[11px] text-bancada-red">Escolha um tamanho</p>}
          <button
            onClick={handleAddToCart}
            className="mt-2 h-8 w-full rounded bg-bancada-red text-xs font-bold uppercase tracking-wide text-white hover:bg-bancada-red-dark"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <Link href={`/produto/${product.slug}`} className="text-sm font-medium text-ink hover:underline">
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.reviewsCount} />
        <div className="mt-1 flex items-center gap-2">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-ink-muted line-through">{formatCurrency(product.compareAtPrice)}</span>
          )}
          {discount > 0 && <span className="text-xs font-bold text-bancada-red">-{discount}%</span>}
        </div>
        <p className="font-display text-lg">{formatCurrency(product.price)}</p>
        <p className="text-xs text-ink-muted">
          {formatCurrency(pix)} no Pix · {product.maxInstallments}x {formatCurrency(installment)}
        </p>
      </div>
    </div>
  )
}
