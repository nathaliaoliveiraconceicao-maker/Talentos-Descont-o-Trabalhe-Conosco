'use client'

import { Truck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { calculateShipping, type ShippingOption } from '@/lib/shipping/calculate'
import { formatCurrency } from '@/lib/utils/format'
import { Button } from '@/components/ui/Button'

export function ShippingEstimator({ subtotal }: { subtotal: number }) {
  const [zip, setZip] = useState('')
  const [options, setOptions] = useState<ShippingOption[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await calculateShipping({ zipCode: zip, subtotal })
      setOptions(result)
    } catch (err) {
      setOptions(null)
      setError(err instanceof Error ? err.message : 'Não foi possível calcular o frete.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-ink/10 pt-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
        <Truck size={16} /> Calcular frete e prazo
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="cep" className="sr-only">
          CEP
        </label>
        <input
          id="cep"
          inputMode="numeric"
          placeholder="00000-000"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          maxLength={9}
          className="h-10 w-32 rounded border border-ink/20 px-3 text-sm focus:border-ink focus:outline-none"
        />
        <Button type="submit" variant="outline" size="sm" disabled={loading}>
          {loading ? 'Calculando…' : 'Calcular'}
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-xs text-bancada-red">
          {error}
        </p>
      )}
      {options && (
        <ul className="mt-3 space-y-1.5 text-sm text-ink">
          {options.map((option) => (
            <li key={option.id} className="flex justify-between">
              <span>
                {option.service} — até {option.estimatedBusinessDays} dias úteis
              </span>
              <span className="font-semibold">{option.price === 0 ? 'Grátis' : formatCurrency(option.price)}</span>
            </li>
          ))}
        </ul>
      )}
      <a href="/institucional/prazos-envio" className="mt-2 inline-block text-xs text-ink-muted underline">
        Ver prazos de envio
      </a>
    </div>
  )
}
