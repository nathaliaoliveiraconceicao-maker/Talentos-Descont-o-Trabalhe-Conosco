'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { AccountShell } from '@/components/account/AccountShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { maskCep } from '@/lib/utils/masks'
import { useAuth } from '@/lib/auth/auth-context'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface Address {
  id: string
  zip_code: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
}

function AddressesManager() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ zipCode: '', street: '', number: '', neighborhood: '', city: '', state: '' })

  async function loadAddresses() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !user) return
    const { data } = await supabase.from('addresses').select('*').eq('customer_id', user.id).order('created_at')
    setAddresses(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadAddresses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !user) return

    await supabase.from('addresses').insert({
      customer_id: user.id,
      zip_code: form.zipCode,
      street: form.street,
      number: form.number,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
    })
    setForm({ zipCode: '', street: '', number: '', neighborhood: '', city: '', state: '' })
    setShowForm(false)
    loadAddresses()
  }

  async function handleDelete(id: string) {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('addresses').delete().eq('id', id)
    loadAddresses()
  }

  if (loading) return <p className="text-sm text-ink-muted">Carregando…</p>

  return (
    <div className="max-w-lg space-y-4">
      {addresses.length === 0 && !showForm && <p className="text-sm text-ink-muted">Você ainda não tem endereços salvos.</p>}

      <ul className="space-y-3">
        {addresses.map((address) => (
          <li key={address.id} className="flex items-start justify-between rounded border border-ink/10 p-4 text-sm">
            <div>
              <p className="font-medium text-ink">
                {address.street}, {address.number}
              </p>
              <p className="text-ink-muted">
                {address.neighborhood} — {address.city}/{address.state}
              </p>
              <p className="text-ink-muted">CEP {address.zip_code}</p>
            </div>
            <button onClick={() => handleDelete(address.id)} aria-label="Remover endereço" className="text-ink-muted hover:text-bancada-red">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-3 rounded border border-ink/10 p-4">
          <Input label="CEP" required value={form.zipCode} onChange={(e) => setForm((p) => ({ ...p, zipCode: maskCep(e.target.value) }))} />
          <Input label="Rua" required value={form.street} onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))} />
          <Input label="Número" required value={form.number} onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))} />
          <Input
            label="Bairro"
            required
            value={form.neighborhood}
            onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))}
          />
          <Input label="Cidade" required value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
          <Input label="Estado (UF)" required maxLength={2} value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value.toUpperCase() }))} />
          <div className="flex gap-2">
            <Button type="submit">Salvar endereço</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Adicionar endereço
        </Button>
      )}
    </div>
  )
}

export default function AddressesPage() {
  return (
    <AccountShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Endereços</h1>
      <div className="mt-6">
        <AddressesManager />
      </div>
    </AccountShell>
  )
}
