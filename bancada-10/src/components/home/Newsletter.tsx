'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Input'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!consent) {
      setError('É necessário aceitar o uso dos seus dados para receber comunicações, conforme a LGPD.')
      return
    }
    setError(null)
    setStatus('loading')
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error('Falha ao cadastrar')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-ink py-14 text-white">
      <div className="container-page flex flex-col items-center text-center">
        <h2 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Entre para a Bancada.</h2>
        <p className="mt-2 max-w-md text-sm text-bancada-off/80">
          Cadastre-se para receber lançamentos, ofertas e novidades do mundo da bola.
        </p>

        {status === 'success' ? (
          <p className="mt-6 text-sm font-semibold text-bancada-off">Cadastro recebido! Fique de olho no seu e-mail.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-md flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                E-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-11 flex-1 rounded border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
              />
              <Button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Enviando…' : 'Cadastrar'}
              </Button>
            </div>
            <Checkbox
              id="newsletter-consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="text-left text-white/80"
              label="Aceito receber comunicações da Bancada 10 e concordo com a Política de Privacidade."
            />
            {error && (
              <p role="alert" className="text-left text-xs text-bancada-red">
                {error}
              </p>
            )}
            {status === 'error' && (
              <p role="alert" className="text-left text-xs text-bancada-red">
                Não foi possível concluir o cadastro agora. Tente novamente em instantes.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
