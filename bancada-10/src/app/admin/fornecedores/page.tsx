'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface Supplier {
  id: string
  name: string
  contact_email: string | null
  contact_phone: string | null
  active: boolean
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null)
  const [form, setForm] = useState({ name: '', contact_email: '', contact_phone: '' })

  async function load() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    const { data } = await supabase.from('suppliers').select('id, name, contact_email, contact_phone, active').order('name')
    setSuppliers(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('suppliers').insert({
      name: form.name,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
    })
    setForm({ name: '', contact_email: '', contact_phone: '' })
    load()
  }

  async function toggleActive(supplier: Supplier) {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('suppliers').update({ active: !supplier.active }).eq('id', supplier.id)
    load()
  }

  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Fornecedores</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Cadastro dos fornecedores responsáveis pelo envio direto ao cliente. A integração com catálogo/API própria de
        um fornecedor específico ainda não existe — esta tela só registra os dados administrativos, sem inventar uma
        integração automática.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 rounded border border-ink/10 bg-white p-4 sm:grid-cols-4">
        <Input label="Nome" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <Input label="E-mail de contato" type="email" value={form.contact_email} onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))} />
        <Input label="Telefone" value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} />
        <div className="flex items-end">
          <Button type="submit">Adicionar</Button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase text-ink-muted">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {suppliers?.map((s) => (
              <tr key={s.id} className="border-b border-ink/5">
                <td className="p-3">{s.name}</td>
                <td className="p-3 text-ink-muted">
                  {s.contact_email} {s.contact_phone}
                </td>
                <td className="p-3">{s.active ? 'Ativo' : 'Inativo'}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(s)} className="text-xs font-medium text-ink underline">
                    {s.active ? 'Desativar' : 'Ativar'}
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
