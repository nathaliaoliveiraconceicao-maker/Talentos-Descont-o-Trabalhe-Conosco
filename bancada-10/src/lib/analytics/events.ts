'use client'

/**
 * Camada fina sobre GA4 / GTM dataLayer / Meta Pixel.
 * Todos os IDs vêm de variáveis de ambiente (ver .env.example) — nada é
 * disparado se a variável correspondente não estiver configurada.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

type EventName =
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'search'
  | 'apply_coupon'
  | 'whatsapp_click'

export function trackEvent(name: EventName, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return

  if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...payload })
  }
  if (window.gtag) {
    window.gtag('event', name, payload)
  }
  if (window.fbq) {
    const metaEventMap: Partial<Record<EventName, string>> = {
      view_item: 'ViewContent',
      add_to_cart: 'AddToCart',
      begin_checkout: 'InitiateCheckout',
      purchase: 'Purchase',
      search: 'Search',
    }
    const metaEvent = metaEventMap[name]
    if (metaEvent) window.fbq('track', metaEvent, payload)
  }
}
