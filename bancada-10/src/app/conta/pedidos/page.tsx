'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AccountShell } from '@/components/account/AccountShell'
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/format'
import { useAuth } from '@/lib/auth/auth-context'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface OrderRow {
  id: string
  protocol: string
  total: number
  status: OrderStatus
  created_at: string
}

function OrdersList() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !user) return
    supabase
      .from('orders')
      .select('id, protocol, total, status, created_at')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? [])
        setLoading(false)
      })
  }, [user])

  if (loading) return <p className="text-sm text-ink-muted">Carregando…</p>
  if (orders.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Você ainda não tem pedidos.{' '}
        <Link href="/lancamentos" className="underline">
          Ver lançamentos
        </Link>
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-ink/10 p-4 text-sm">
          <div>
            <p className="font-semibold text-ink">Pedido {order.protocol}</p>
            <p className="text-ink-muted">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-ink">{ORDER_STATUS_LABEL[order.status]}</p>
            <p className="text-ink-muted">{formatCurrency(order.total)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function OrdersPage() {
  return (
    <AccountShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Meus pedidos</h1>
      <div className="mt-6">
        <OrdersList />
      </div>
    </AccountShell>
  )
}
