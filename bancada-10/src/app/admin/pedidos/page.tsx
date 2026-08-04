'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Select, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/format'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface AdminOrder {
  id: string
  protocol: string
  customer_name: string
  customer_email: string
  total: number
  status: OrderStatus
  carrier: string | null
  tracking_code: string | null
  created_at: string
}

function OrderRow({ order, onUpdated }: { order: AdminOrder; onUpdated: () => void }) {
  const [status, setStatus] = useState(order.status)
  const [carrier, setCarrier] = useState(order.carrier ?? '')
  const [trackingCode, setTrackingCode] = useState(order.tracking_code ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    setSaving(true)
    await supabase
      .from('orders')
      .update({ status, carrier: carrier || null, tracking_code: trackingCode || null })
      .eq('id', order.id)
    await supabase.from('order_status_history').insert({ order_id: order.id, status })
    setSaving(false)
    onUpdated()
  }

  return (
    <tr className="border-b border-ink/5 align-top">
      <td className="p-3">
        <p className="font-medium text-ink">{order.protocol}</p>
        <p className="text-xs text-ink-muted">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
      </td>
      <td className="p-3">
        <p>{order.customer_name}</p>
        <p className="text-xs text-ink-muted">{order.customer_email}</p>
      </td>
      <td className="p-3">{formatCurrency(order.total)}</td>
      <td className="p-3">
        <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </td>
      <td className="p-3">
        <Input placeholder="Transportadora" value={carrier} onChange={(e) => setCarrier(e.target.value)} className="mb-2" />
        <Input placeholder="Código de rastreio" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} />
      </td>
      <td className="p-3">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </td>
    </tr>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null)

  async function load() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    const { data } = await supabase
      .from('orders')
      .select('id, protocol, customer_name, customer_email, total, status, carrier, tracking_code, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    setOrders(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Pedidos</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Atualize o status, a transportadora e o código de rastreio. Só as colunas visíveis aqui (status,
        transportadora, rastreio) aparecem para o cliente em &ldquo;Rastrear Pedido&rdquo;.
      </p>

      <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase text-ink-muted">
            <tr>
              <th className="p-3">Pedido</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Envio</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {orders === null ? (
              <tr>
                <td className="p-3 text-ink-muted" colSpan={6}>
                  Carregando…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className="p-3 text-ink-muted" colSpan={6}>
                  Nenhum pedido ainda.
                </td>
              </tr>
            ) : (
              orders.map((order) => <OrderRow key={order.id} order={order} onUpdated={load} />)
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
