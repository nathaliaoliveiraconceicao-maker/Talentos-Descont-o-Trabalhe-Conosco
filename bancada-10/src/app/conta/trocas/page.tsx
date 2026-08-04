'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { AccountShell } from '@/components/account/AccountShell'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { whatsappLink } from '@/lib/site-config'

function ExchangeForm() {
  const [protocol, setProtocol] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('loading')
    setError(null)
    try {
      const response = await fetch('/api/trocas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol, email, reason }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Não foi possível registrar a solicitação.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setError('Não foi possível registrar a solicitação agora.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="max-w-md text-sm text-ink">
        Solicitação registrada! Vamos analisar seu pedido e entrar em contato pelo e-mail informado. Você também pode
        acompanhar pelo protocolo em{' '}
        <Link href="/rastrear-pedido" className="underline">
          Rastrear Pedido
        </Link>
        .
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <p className="text-sm text-ink-muted">
        Confira nossa{' '}
        <Link href="/institucional/trocas-devolucoes" className="underline">
          Política de Trocas e Devoluções
        </Link>{' '}
        antes de solicitar. Itens personalizados podem ter regras específicas.
      </p>
      <Input label="Número do pedido (protocolo)" required value={protocol} onChange={(e) => setProtocol(e.target.value)} />
      <Input label="E-mail usado na compra" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Textarea label="Motivo da troca" required rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
      {error && (
        <div className="text-xs font-medium text-bancada-red">
          {error}{' '}
          <a href={whatsappLink('Olá! Preciso solicitar uma troca de um pedido da Bancada 10.')} className="underline">
            Falar no WhatsApp
          </a>
        </div>
      )}
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando…' : 'Solicitar troca'}
      </Button>
    </form>
  )
}

export default function ExchangePage() {
  return (
    <AccountShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Solicitar troca</h1>
      <div className="mt-6">
        <ExchangeForm />
      </div>
    </AccountShell>
  )
}
