'use client'

import { useEffect, useState } from 'react'
import { topBarMessages } from '@/lib/site-config'

const ROTATE_INTERVAL_MS = 5000

export function TopBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % topBarMessages.length)
    }, ROTATE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="hidden bg-ink text-bancada-off sm:block" role="region" aria-label="Avisos da loja">
      <div className="container-page flex h-9 items-center justify-center overflow-hidden">
        <p key={index} aria-live="polite" className="animate-ticker-in text-center text-xs font-medium tracking-wide">
          {topBarMessages[index]}
        </p>
      </div>
    </div>
  )
}
