'use client'

import { useState, type FormEvent } from 'react'
import { Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/lib/cart/cart-context'

export function CouponInput() {
  const { couponCode, couponError, applyCoupon, removeCoupon } = useCart()
  const [value, setValue] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!value.trim()) return
    applyCoupon(value.trim())
  }

  if (couponCode) {
    return (
      <div className="flex items-center justify-between rounded border border-ink/15 bg-bancada-off px-3 py-2 text-sm">
        <span className="flex items-center gap-1.5 font-medium text-ink">
          <Tag size={14} /> Cupom {couponCode} aplicado
        </span>
        <button onClick={removeCoupon} aria-label="Remover cupom" className="text-ink-muted hover:text-bancada-red">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="coupon" className="sr-only">
          Cupom de desconto
        </label>
        <input
          id="coupon"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cupom de desconto"
          className="h-10 flex-1 rounded border border-ink/20 px-3 text-sm uppercase focus:border-ink focus:outline-none"
        />
        <Button type="submit" variant="outline" size="sm">
          Aplicar
        </Button>
      </form>
      {couponError && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-bancada-red">
          {couponError}
        </p>
      )}
    </div>
  )
}
