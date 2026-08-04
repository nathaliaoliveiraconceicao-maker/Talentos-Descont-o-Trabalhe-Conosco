'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface Coupon {
  code: string
  description: string
  type: 'percent' | 'fixed' | 'free_shipping'
  value: number
  active: boolean
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null)
  const [form, setForm] = useState({ code: '', description: '', type: 'percent' as Coupon['type'], value: '' })

  async function load() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    const { data } = await supabase.from('coupons').select('code, description, type, value, active').order('created_at', { ascending: false })
    setCoupons(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('coupons').upsert({
      code: form.code.toUpperCase(),
      description: form.description,
      type: form.type,
      value: Number(form.value) || 0,
    })
    setForm({ code: '', description: '', type: 'percent', value: '' })
    load()
  }

  async function toggleActive(coupon: Coupon) {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('coupons').update({ active: !coupon.active }).eq('code', coupon.code)
    load()
  }

  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Cupons</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Cupons cadastrados aqui passam a valer para o checkout assim que a loja consumir cupons do Supabase (hoje o
        checkout demonstrativo valida contra <code>src/lib/data/coupons.ts</code> — ver README para o passo de
        migração).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 rounded border border-ink/10 bg-white p-4 sm:grid-cols-5">
        <Input label="Código" required value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
        <Input label="Descrição" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="sm:col-span-2" />
        <Select label="Tipo" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Coupon['type'] }))}>
          <option value="percent">Percentual</option>
          <option value="fixed">Valor fixo</option>
          <option value="free_shipping">Frete grátis</option>
        </Select>
        <Input label="Valor" type="number" step="0.01" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} />
        <div className="col-span-full">
          <Button type="submit">Salvar cupom</Button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase text-ink-muted">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Descrição</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {coupons?.map((c) => (
              <tr key={c.code} className="border-b border-ink/5">
                <td className="p-3 font-semibold">{c.code}</td>
                <td className="p-3 text-ink-muted">{c.description}</td>
                <td className="p-3">{c.type}</td>
                <td className="p-3">{c.value}</td>
                <td className="p-3">{c.active ? 'Ativo' : 'Inativo'}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(c)} className="text-xs font-medium text-ink underline">
                    {c.active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
