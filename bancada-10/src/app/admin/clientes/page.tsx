'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface AdminCustomer {
  id: string
  full_name: string | null
  cpf: string | null
  phone: string | null
  created_at: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    supabase
      .from('customers')
      .select('id, full_name, cpf, phone, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => setCustomers(data ?? []))
  }, [])

  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Clientes</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Lista de clientes com conta cadastrada. O e-mail fica no Supabase Auth — consulte pelo painel do Supabase se
        precisar cruzar com o CPF/telefone abaixo.
      </p>

      <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase text-ink-muted">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">CPF</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {customers === null ? (
              <tr>
                <td className="p-3 text-ink-muted" colSpan={4}>
                  Carregando…
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td className="p-3 text-ink-muted" colSpan={4}>
                  Nenhum cliente cadastrado ainda.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="p-3">{c.full_name || '—'}</td>
                  <td className="p-3">{c.cpf || '—'}</td>
                  <td className="p-3">{c.phone || '—'}</td>
                  <td className="p-3">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
