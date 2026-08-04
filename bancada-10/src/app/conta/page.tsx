'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AccountShell } from '@/components/account/AccountShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { maskCpf, maskPhone } from '@/lib/utils/masks'
import { useAuth } from '@/lib/auth/auth-context'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

function PersonalDataForm() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !user) return

    supabase
      .from('customers')
      .select('full_name, cpf, phone')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? '')
          setCpf(data.cpf ?? '')
          setPhone(data.phone ?? '')
        }
        setLoading(false)
      })
  }, [user])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !user) return

    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from('customers')
      .upsert({ id: user.id, full_name: fullName, cpf, phone }, { onConflict: 'id' })
    setSaving(false)
    setMessage(error ? 'Não foi possível salvar. Tente novamente.' : 'Dados salvos com sucesso.')
  }

  if (loading) return <p className="text-sm text-ink-muted">Carregando…</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <Input label="E-mail" value={user?.email ?? ''} disabled />
      <Input label="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input label="CPF" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} />
      <Input label="Telefone" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />
      {message && <p className="text-xs text-ink-muted">{message}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? 'Salvando…' : 'Salvar alterações'}
      </Button>
    </form>
  )
}

export default function AccountPage() {
  return (
    <AccountShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Dados pessoais</h1>
      <div className="mt-6">
        <PersonalDataForm />
      </div>
    </AccountShell>
  )
}
