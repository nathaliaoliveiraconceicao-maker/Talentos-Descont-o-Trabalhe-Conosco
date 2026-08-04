'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Input, Select, Checkbox } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { useCart } from '@/lib/cart/cart-context'
import { checkoutSchema } from '@/lib/validators/checkout'
import { maskCep, maskCpf, maskPhone } from '@/lib/utils/masks'
import { lookupCep } from '@/lib/shipping/viacep'
import { calculateShipping, type ShippingOption } from '@/lib/shipping/calculate'
import { formatCurrency } from '@/lib/utils/format'
import { trackEvent } from '@/lib/analytics/events'
import { cx } from '@/lib/utils/format'

const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const PAYMENT_METHODS: { id: 'pix' | 'credit_card' | 'boleto'; label: string; hint: string }[] = [
  { id: 'pix', label: 'Pix', hint: 'Aprovação imediata, com desconto.' },
  { id: 'credit_card', label: 'Cartão de crédito', hint: 'Em até 12x, processado com segurança pelo Mercado Pago.' },
  { id: 'boleto', label: 'Boleto bancário', hint: 'Compensação em até 3 dias úteis.' },
]

type FieldErrors = Record<string, string>

export function CheckoutForm() {
  const router = useRouter()
  const { items, subtotal, discount, couponCode, clear } = useCart()

  const [identification, setIdentification] = useState({ name: '', email: '', cpf: '', phone: '' })
  const [address, setAddress] = useState({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShippingId, setSelectedShippingId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)

  const selectedShipping = shippingOptions.find((o) => o.id === selectedShippingId) ?? null
  const total = Math.max(subtotal - discount, 0) + (selectedShipping?.price ?? 0)

  async function handleCepBlur() {
    const digits = address.zipCode.replace(/\D/g, '')
    if (digits.length !== 8) return

    setCepLoading(true)
    const result = await lookupCep(digits)
    if (result) {
      setAddress((prev) => ({
        ...prev,
        street: result.logradouro || prev.street,
        neighborhood: result.bairro || prev.neighborhood,
        city: result.localidade || prev.city,
        state: result.uf || prev.state,
      }))
    }

    try {
      const options = await calculateShipping({ zipCode: digits, subtotal: subtotal - discount })
      setShippingOptions(options)
      setSelectedShippingId(options[0]?.id ?? '')
    } catch {
      setShippingOptions([])
    }
    setCepLoading(false)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)

    const payload = {
      identification,
      address,
      shippingOptionId: selectedShippingId,
      paymentMethod,
      acceptedTerms,
    }

    const validation = checkoutSchema.safeParse(payload)
    if (!validation.success) {
      const fieldErrors: FieldErrors = {}
      for (const issue of validation.error.issues) {
        fieldErrors[issue.path.join('.')] = issue.message
      }
      setErrors(fieldErrors)
      const firstError = document.querySelector('[aria-invalid="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setErrors({})
    setSubmitting(true)

    try {
      trackEvent('begin_checkout', { value: total })
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            personalization: item.personalization,
          })),
          couponCode: couponCode ?? undefined,
          shippingZipCode: address.zipCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error ?? 'Não foi possível concluir o pedido. Tente novamente.')
        setSubmitting(false)
        return
      }

      trackEvent('purchase', { value: data.total, transaction_id: data.protocol })
      clear()
      router.push(`/pedido-confirmado?protocolo=${data.protocol}${data.demo ? '&demo=1' : ''}`)
    } catch {
      setSubmitError('Não foi possível concluir o pedido. Verifique sua conexão e tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        <section>
          <h2 className="font-display text-sm uppercase tracking-wide2">1. Identificação</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome completo"
              required
              value={identification.name}
              onChange={(e) => setIdentification((p) => ({ ...p, name: e.target.value }))}
              error={errors['identification.name']}
              className="sm:col-span-2"
            />
            <Input
              label="E-mail"
              type="email"
              required
              value={identification.email}
              onChange={(e) => setIdentification((p) => ({ ...p, email: e.target.value }))}
              error={errors['identification.email']}
            />
            <Input
              label="CPF"
              required
              inputMode="numeric"
              value={identification.cpf}
              onChange={(e) => setIdentification((p) => ({ ...p, cpf: maskCpf(e.target.value) }))}
              error={errors['identification.cpf']}
              placeholder="000.000.000-00"
            />
            <Input
              label="Telefone / WhatsApp"
              required
              inputMode="numeric"
              value={identification.phone}
              onChange={(e) => setIdentification((p) => ({ ...p, phone: maskPhone(e.target.value) }))}
              error={errors['identification.phone']}
              placeholder="(00) 00000-0000"
            />
          </div>
        </section>

        <section>
          <h2 className="font-display text-sm uppercase tracking-wide2">2. Endereço de entrega</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="CEP"
              required
              inputMode="numeric"
              value={address.zipCode}
              onChange={(e) => setAddress((p) => ({ ...p, zipCode: maskCep(e.target.value) }))}
              onBlur={handleCepBlur}
              error={errors['address.zipCode']}
              hint={cepLoading ? 'Buscando endereço…' : undefined}
              placeholder="00000-000"
            />
            <Input
              label="Rua"
              required
              value={address.street}
              onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
              error={errors['address.street']}
              className="sm:col-span-2"
            />
            <Input
              label="Número"
              required
              value={address.number}
              onChange={(e) => setAddress((p) => ({ ...p, number: e.target.value }))}
              error={errors['address.number']}
            />
            <Input
              label="Complemento"
              value={address.complement}
              onChange={(e) => setAddress((p) => ({ ...p, complement: e.target.value }))}
            />
            <Input
              label="Bairro"
              required
              value={address.neighborhood}
              onChange={(e) => setAddress((p) => ({ ...p, neighborhood: e.target.value }))}
              error={errors['address.neighborhood']}
            />
            <Input
              label="Cidade"
              required
              value={address.city}
              onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
              error={errors['address.city']}
            />
            <Select
              label="Estado"
              required
              value={address.state}
              onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
              error={errors['address.state']}
            >
              <option value="">UF</option>
              {BR_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </Select>
          </div>
        </section>

        <section>
          <h2 className="font-display text-sm uppercase tracking-wide2">3. Entrega</h2>
          {shippingOptions.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">Informe o CEP acima para ver as opções de entrega.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className={cx(
                    'flex cursor-pointer items-center justify-between rounded border px-4 py-3 text-sm',
                    selectedShippingId === option.id ? 'border-ink' : 'border-ink/15'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedShippingId === option.id}
                      onChange={() => setSelectedShippingId(option.id)}
                      className="h-4 w-4 accent-bancada-red"
                    />
                    <span>
                      {option.service} — até {option.estimatedBusinessDays} dias úteis
                    </span>
                  </span>
                  <span className="font-semibold">{option.price === 0 ? 'Grátis' : formatCurrency(option.price)}</span>
                </label>
              ))}
            </div>
          )}
          {errors.shippingOptionId && <p className="mt-1.5 text-xs font-medium text-bancada-red">{errors.shippingOptionId}</p>}
        </section>

        <section>
          <h2 className="font-display text-sm uppercase tracking-wide2">4. Pagamento</h2>
          <div className="mt-3 space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={cx(
                  'flex cursor-pointer items-start gap-3 rounded border px-4 py-3',
                  paymentMethod === method.id ? 'border-ink' : 'border-ink/15'
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                  className="mt-0.5 h-4 w-4 accent-bancada-red"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">{method.label}</span>
                  <span className="block text-xs text-ink-muted">{method.hint}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Pagamento processado com segurança pelo Mercado Pago. Nenhum dado de cartão é armazenado neste site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-sm uppercase tracking-wide2">5. Revisão e confirmação</h2>
          <div className="mt-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              label={
                <>
                  Li e aceito os{' '}
                  <Link href="/institucional/termos" className="underline" target="_blank">
                    Termos e Condições
                  </Link>{' '}
                  e a{' '}
                  <Link href="/institucional/privacidade" className="underline" target="_blank">
                    Política de Privacidade
                  </Link>
                  .
                </>
              }
            />
            {errors.acceptedTerms && <p className="mt-1.5 text-xs font-medium text-bancada-red">{errors.acceptedTerms}</p>}
          </div>

          {submitError && (
            <p role="alert" className="mt-3 text-sm font-medium text-bancada-red">
              {submitError}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-4 w-full sm:w-auto" disabled={submitting}>
            {submitting ? 'Processando…' : 'Confirmar pedido'}
          </Button>
        </section>
      </div>

      <OrderSummary
        items={items}
        subtotal={subtotal}
        discount={discount}
        shippingCost={selectedShipping?.price ?? null}
        total={total}
      />
    </form>
  )
}
