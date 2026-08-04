'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Input } from '@/components/ui/Input'
import { Button, type ButtonProps } from '@/components/ui/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface Promotion {
  id: string
  title: string
  description: string
  active: boolean
  coupon_code: string | null
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[] | null>(null)
  const [form, setForm] = useState({ title: '', description: '', couponCode: '' })

  async function load() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    const { data } = await supabase.from('promotions').select('id, title, description, active, coupon_code').order('created_at', { ascending: false })
    setPromotions(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('promotions').insert({
      title: form.title,
      description: form.description,
      coupon_code: form.couponCode || null,
      type: 'first_purchase_coupon',
      active: false,
    })
    setForm({ title: '', description: '', couponCode: '' })
    load()
  }

  async function toggleActive(promotion: Promotion) {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('promotions').update({ active: !promotion.active }).eq('id', promotion.id)
    load()
  }

  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Promoções</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Cadastre a regra da campanha (ex.: compre 3 pague 2, desconto progressivo, frete grátis, cupom de primeira
        compra) e só marque como <strong>ativa</strong> depois de validar a regra — o bloco promocional da home só
        aparece quando há uma promoção ativa (ver <code>src/components/home/PromoBlock.tsx</code>).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 rounded border border-ink/10 bg-white p-4 sm:grid-cols-4">
        <Input label="Título" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <Input label="Descrição" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="sm:col-span-2" />
        <Input label="Cupom vinculado (opcional)" value={form.couponCode} onChange={(e) => setForm((p) => ({ ...p, couponCode: e.target.value }))} />
        <div className="col-span-full">
          <Button type="submit">Criar promoção (inativa)</Button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {promotions?.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded border border-ink/10 bg-white p-4">
            <div>
              <p className="font-medium text-ink">{p.title}</p>
              <p className="text-sm text-ink-muted">{p.description}</p>
              {p.coupon_code && <p className="text-xs text-ink-muted">Cupom: {p.coupon_code}</p>}
            </div>
            <Button size="sm" variant={(p.active ? 'outline' : 'primary') as ButtonProps['variant']} onClick={() => toggleActive(p)}>
              {p.active ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
