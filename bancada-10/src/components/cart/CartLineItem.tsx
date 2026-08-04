import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X } from 'lucide-react'
import type { CartItem } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/format'
import { useCart } from '@/lib/cart/cart-context'

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex gap-3 border-b border-ink/10 py-4">
      <Link href={`/produto/${item.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-bancada-off">
        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/produto/${item.slug}`} className="text-sm font-semibold text-ink hover:underline">
            {item.name}
          </Link>
          <button
            onClick={() => removeItem(item)}
            aria-label={`Remover ${item.name} do carrinho`}
            className="shrink-0 text-ink-muted hover:text-bancada-red"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-ink-muted">Tamanho: {item.size}</p>
        {item.personalization && (
          <p className="text-xs text-ink-muted">
            Personalização: {item.personalization.name} · nº {item.personalization.number}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center rounded border border-ink/15">
            <button
              onClick={() => updateQuantity(item, item.quantity - 1)}
              aria-label="Diminuir quantidade"
              className="p-1.5 text-ink hover:text-bancada-red"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm" aria-live="polite">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item, item.quantity + 1)}
              aria-label="Aumentar quantidade"
              className="p-1.5 text-ink hover:text-bancada-red"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-sm font-semibold text-ink">{formatCurrency(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  )
}
