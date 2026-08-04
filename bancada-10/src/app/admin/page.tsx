'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

function DashboardStats() {
  const [stats, setStats] = useState<{ orders: number; revenue: number; products: number; pending: number } | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    async function load() {
      if (!supabase) return
      const [{ count: orders }, { count: products }, { count: pending }, { data: revenueRows }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pagamento_pendente'),
        supabase.from('orders').select('total').eq('status', 'pagamento_aprovado'),
      ])
      const revenue = (revenueRows ?? []).reduce((sum: number, row: { total: number }) => sum + row.total, 0)
      setStats({ orders: orders ?? 0, revenue, products: products ?? 0, pending: pending ?? 0 })
    }

    load()
  }, [])

  if (!stats) return <p className="text-sm text-ink-muted">Carregando…</p>

  const cards = [
    { label: 'Pedidos totais', value: stats.orders },
    { label: 'Receita aprovada', value: formatCurrency(stats.revenue) },
    { label: 'Produtos cadastrados', value: stats.products },
    { label: 'Pagamentos pendentes', value: stats.pending },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded border border-ink/10 bg-white p-4">
          <p className="text-xs text-ink-muted">{card.label}</p>
          <p className="mt-1 font-display text-2xl">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">Visão geral da loja (dados reais do Supabase, quando configurado).</p>
      <div className="mt-6">
        <DashboardStats />
      </div>
    </AdminShell>
  )
}
