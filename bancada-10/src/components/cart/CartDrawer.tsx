'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { CartLineItem } from '@/components/cart/CartLineItem'
import { FreeShippingBar } from '@/components/cart/FreeShippingBar'
import { useCart } from '@/lib/cart/cart-context'
import { formatCurrency } from '@/lib/utils/format'

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, discount } = useCart()
  const total = Math.max(subtotal - discount, 0)

  return (
    <Drawer open={isOpen} onClose={closeCart} title={`Carrinho (${items.length})`}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <ShoppingBag size={32} className="text-ink/30" />
          <p className="text-sm text-ink-muted">Seu carrinho está vazio.</p>
          <Button variant="outline" size="sm" onClick={closeCart}>
            Continuar comprando
          </Button>
        </div>
      ) : (
        <>
          <FreeShippingBar subtotal={subtotal} />
          <div className="divide-y divide-ink/10 px-4">
            {items.map((item) => (
              <CartLineItem key={`${item.productId}-${item.size}-${item.personalization?.name ?? ''}`} item={item} />
            ))}
          </div>
          <div className="sticky bottom-0 border-t border-ink/10 bg-white p-4">
            {discount > 0 && (
              <div className="mb-1 flex justify-between text-sm text-bancada-red">
                <span>Desconto</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="mb-3 flex justify-between text-base font-semibold text-ink">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Link href="/carrinho" onClick={closeCart}>
              <Button variant="outline" className="mb-2 w-full">
                Ver carrinho
              </Button>
            </Link>
            <Link href="/checkout" onClick={closeCart}>
              <Button className="w-full">Finalizar compra</Button>
            </Link>
          </div>
        </>
      )}
    </Drawer>
  )
}
