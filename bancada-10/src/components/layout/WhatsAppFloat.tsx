'use client'

import { MessageCircle } from 'lucide-react'
import { siteConfig, whatsappLink } from '@/lib/site-config'
import { trackEvent } from '@/lib/analytics/events'

export function WhatsAppFloat({ contextMessage }: { contextMessage?: string }) {
  const message = contextMessage || `Olá! Estou vendo o site da ${siteConfig.name} e gostaria de tirar uma dúvida.`

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('whatsapp_click', { context: contextMessage ? 'product' : 'generic' })}
      className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-card transition-transform hover:scale-105"
      aria-label="Falar com a Bancada 10 pelo WhatsApp"
    >
      <MessageCircle size={22} />
    </a>
  )
}
