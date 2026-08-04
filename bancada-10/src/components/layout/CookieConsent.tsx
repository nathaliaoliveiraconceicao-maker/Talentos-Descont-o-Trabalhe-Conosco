'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const STORAGE_KEY = 'bancada10:cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) setVisible(true)
  }, [])

  function respond(value: 'accepted' | 'rejected') {
    window.localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white px-4 py-4 shadow-card sm:px-6"
    >
      <div className="container-page flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          Usamos cookies para melhorar sua experiência e personalizar conteúdo, conforme a nossa{' '}
          <Link href="/institucional/privacidade" className="font-medium text-ink underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => respond('rejected')}>
            Recusar
          </Button>
          <Button size="sm" onClick={() => respond('accepted')}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  )
}
