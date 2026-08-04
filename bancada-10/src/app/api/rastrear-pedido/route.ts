import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { CUSTOMER_VISIBLE_STATUS, ORDER_STATUS_LABEL } from '@/lib/types'

const schema = z.object({
  protocol: z.string().min(3),
  identifier: z.string().min(3), // e-mail ou CPF
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Informe o número do pedido e o e-mail ou CPF usados na compra.' }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'O rastreamento ainda não está conectado a um banco neste ambiente. Configure o Supabase para ativar.' },
      { status: 503 }
    )
  }

  const identifier = parsed.data.identifier.replace(/\D/g, '')
  const isEmail = parsed.data.identifier.includes('@')

  // Nunca selecionar colunas internas do fornecedor aqui (supplier_id,
  // supplier_internal_code, cost_price, internal_notes) — só o necessário
  // ao cliente.
  const query = supabase
    .from('orders')
    .select('protocol, status, carrier, tracking_code, dispatched_at, created_at, id')
    .eq('protocol', parsed.data.protocol)

  const { data: order, error } = await (isEmail
    ? query.ilike('customer_email', parsed.data.identifier)
    : query.eq('customer_cpf', identifier)
  ).maybeSingle()

  if (error || !order) {
    return NextResponse.json({ error: 'Pedido não encontrado. Confira o número do pedido e os dados informados.' }, { status: 404 })
  }

  const { data: history } = await supabase
    .from('order_status_history')
    .select('status, created_at')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true })

  if (!CUSTOMER_VISIBLE_STATUS.includes(order.status)) {
    return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
  }

  return NextResponse.json({
    protocol: order.protocol,
    status: order.status,
    statusLabel: ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL],
    carrier: order.carrier,
    trackingCode: order.tracking_code,
    dispatchedAt: order.dispatched_at,
    createdAt: order.created_at,
    timeline: (history ?? [])
      .filter((h) => CUSTOMER_VISIBLE_STATUS.includes(h.status))
      .map((h) => ({ status: h.status, label: ORDER_STATUS_LABEL[h.status as keyof typeof ORDER_STATUS_LABEL], date: h.created_at })),
  })
}
