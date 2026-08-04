'use client'

import Link from 'next/link'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/lib/cart/cart-context'

export default function CheckoutPage() {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="font-display text-2xl uppercase tracking-tightest">Seu carrinho está vazio</h1>
        <p className="text-sm text-ink-muted">Adicione produtos ao carrinho antes de continuar para o checkout.</p>
        <Link href="/lancamentos">
          <Button>Ver lançamentos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-6">
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Carrinho', href: '/carrinho' }, { label: 'Checkout' }]} />
      <h1 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Finalizar compra</h1>
      <div className="mt-6">
        <CheckoutForm />
      </div>
    </div>
  )
}
