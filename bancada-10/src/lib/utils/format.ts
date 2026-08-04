export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function pixPrice(price: number, pixDiscountPercent: number) {
  return price * (1 - pixDiscountPercent / 100)
}

export function installmentPrice(price: number, installments: number) {
  return price / installments
}

export function discountPercent(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) return 0
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
