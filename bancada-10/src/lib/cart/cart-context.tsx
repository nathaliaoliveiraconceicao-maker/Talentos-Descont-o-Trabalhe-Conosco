'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem, CartPersonalization } from '@/lib/types'
import { findCoupon } from '@/lib/data/coupons'
import { trackEvent } from '@/lib/analytics/events'

const STORAGE_KEY = 'bancada10:cart'

function cartItemKey(item: Pick<CartItem, 'productId' | 'size' | 'personalization'>) {
  return [item.productId, item.size, item.personalization?.name ?? '', item.personalization?.number ?? ''].join('::')
}

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (item: Pick<CartItem, 'productId' | 'size' | 'personalization'>) => void
  updateQuantity: (item: Pick<CartItem, 'productId' | 'size' | 'personalization'>, quantity: number) => void
  clear: () => void
  couponCode: string | null
  couponError: string | null
  applyCoupon: (code: string) => void
  removeCoupon: () => void
  subtotal: number
  discount: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { items: CartItem[]; couponCode: string | null }
        setItems(parsed.items ?? [])
        setCouponCode(parsed.couponCode ?? null)
      }
    } catch {
      // localStorage indisponível ou dado corrompido — segue com carrinho vazio
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, couponCode }))
  }, [items, couponCode, hydrated])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const key = cartItemKey(item)
      const existing = prev.find((i) => cartItemKey(i) === key)
      if (existing) {
        return prev.map((i) => (cartItemKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...prev, { ...item, quantity }]
    })
    trackEvent('add_to_cart', { product_id: item.productId, size: item.size, quantity })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((item: Pick<CartItem, 'productId' | 'size' | 'personalization'>) => {
    const key = cartItemKey(item)
    setItems((prev) => prev.filter((i) => cartItemKey(i) !== key))
  }, [])

  const updateQuantity = useCallback((item: Pick<CartItem, 'productId' | 'size' | 'personalization'>, quantity: number) => {
    const key = cartItemKey(item)
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => cartItemKey(i) !== key)
        : prev.map((i) => (cartItemKey(i) === key ? { ...i, quantity } : i))
    )
  }, [])

  const clear = useCallback(() => {
    setItems([])
    setCouponCode(null)
  }, [])

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items])

  const discount = useMemo(() => {
    if (!couponCode) return 0
    const coupon = findCoupon(couponCode)
    if (!coupon) return 0
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0
    if (coupon.type === 'percent') return subtotal * (coupon.value / 100)
    if (coupon.type === 'fixed') return Math.min(coupon.value, subtotal)
    return 0 // free_shipping é abatido no frete, não no subtotal
  }, [couponCode, subtotal])

  const applyCoupon = useCallback(
    (code: string) => {
      const coupon = findCoupon(code)
      if (!coupon) {
        setCouponError('Cupom inválido ou expirado.')
        return
      }
      if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
        setCouponError(`Este cupom exige subtotal mínimo de ${coupon.minSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`)
        return
      }
      setCouponError(null)
      setCouponCode(coupon.code)
      trackEvent('apply_coupon', { coupon_code: coupon.code })
    },
    [subtotal]
  )

  const removeCoupon = useCallback(() => {
    setCouponCode(null)
    setCouponError(null)
  }, [])

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const value: CartContextValue = {
    items,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    removeItem,
    updateQuantity,
    clear,
    couponCode,
    couponError,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    itemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>')
  return ctx
}

export { cartItemKey }
