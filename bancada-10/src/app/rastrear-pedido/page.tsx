'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cx } from '@/lib/utils/format'

interface TrackingResult {
  protocol: string
  statusLabel: string
  carrier: string | null
  trackingCode: string | null
  timeline: { status: string; label: string; date: string }[]
}

export default function TrackOrderPage() {
  const [protocol, setProtocol] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const response = await fetch('/api/rastrear-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol, identifier }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Não foi possível localizar o pedido.')
        return
      }
      setResult(data)
    } catch {
      setError('Não foi possível consultar o rastreamento agora. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Rastrear Pedido' }]} />
      <h1 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Rastrear pedido</h1>
      <p className="mt-1 max-w-md text-sm text-ink-muted">
        Informe o número do pedido (protocolo) e o e-mail ou CPF usados na compra.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid max-w-md grid-cols-1 gap-4">
        <Input label="Número do pedido" required value={protocol} onChange={(e) => setProtocol(e.target.value)} placeholder="B10-XXXXXX-XXXX" />
        <Input label="E-mail ou CPF" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        {error && (
          <p role="alert" className="text-xs font-medium text-bancada-red">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Consultando…' : 'Consultar'}
        </Button>
      </form>

      {result && (
        <div className="mt-10 max-w-lg">
          <p className="text-sm text-ink-muted">
            Pedido <span className="font-semibold text-ink">{result.protocol}</span>
          </p>
          <p className="mt-1 font-display text-lg uppercase">{result.statusLabel}</p>
          {result.carrier && (
            <p className="mt-1 text-sm text-ink-muted">
              Transportadora: {result.carrier}
              {result.trackingCode && ` — código ${result.trackingCode}`}
            </p>
          )}

          <ol className="mt-6 space-y-4 border-l border-ink/10 pl-4">
            {result.timeline.map((step, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-0.5 text-bancada-red">
                  {i === result.timeline.length - 1 ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </span>
                <p className={cx('text-sm font-medium', i === result.timeline.length - 1 ? 'text-ink' : 'text-ink-muted')}>
                  {step.label}
                </p>
                <p className="text-xs text-ink-muted">{new Date(step.date).toLocaleString('pt-BR')}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
