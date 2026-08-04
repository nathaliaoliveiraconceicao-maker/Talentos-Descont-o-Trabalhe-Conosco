'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-display text-2xl uppercase tracking-tightest">Algo deu errado</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Não conseguimos carregar esta página agora. Tente novamente em instantes.
      </p>
      <Button className="mt-6" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  )
}
