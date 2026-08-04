'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart/cart-context'
import { CartLineItem } from '@/components/cart/CartLineItem'
import { FreeShippingBar } from '@/components/cart/FreeShippingBar'
import { CouponInput } from '@/components/cart/CouponInput'
import { ShippingEstimator } from '@/components/product/ShippingEstimator'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { formatCurrency } from '@/lib/utils/format'
import { trackEvent } from '@/lib/analytics/events'

export default function CartPage() {
  const { items, subtotal, discount } = useCart()
  const total = Math.max(subtotal - discount, 0)

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag size={40} className="text-ink/20" />
        <h1 className="font-display text-2xl uppercase tracking-tightest">Seu carrinho está vazio</h1>
        <p className="text-sm text-ink-muted">Explore os lançamentos e encontre sua próxima camisa.</p>
        <Link href="/lancamentos">
          <Button>Ver lançamentos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-6">
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Carrinho' }]} />
      <h1 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Meu carrinho</h1>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 overflow-hidden rounded border border-ink/10">
            <FreeShippingBar subtotal={subtotal} />
          </div>
          <div className="divide-y divide-ink/10 rounded border border-ink/10 px-4">
            {items.map((item) => (
              <CartLineItem key={`${item.productId}-${item.size}-${item.personalization?.name ?? ''}`} item={item} />
            ))}
          </div>
          <Link href="/lancamentos" className="mt-4 inline-block text-sm font-medium text-ink underline">
            Continuar comprando
          </Link>
        </div>

        <aside className="h-fit rounded border border-ink/10 p-5">
          <h2 className="font-display text-sm uppercase tracking-wide2">Resumo do pedido</h2>

          <div className="mt-4">
            <CouponInput />
          </div>

          <ShippingEstimator subtotal={subtotal} />

          <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-bancada-red">
                <span>Desconto</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <p className="text-xs text-ink-muted">Frete calculado acima, conforme o CEP informado.</p>
          </div>

          <Link href="/checkout" onClick={() => trackEvent('begin_checkout', { value: total })}>
            <Button className="mt-4 w-full" size="lg">
              Ir para o checkout
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  )
}
