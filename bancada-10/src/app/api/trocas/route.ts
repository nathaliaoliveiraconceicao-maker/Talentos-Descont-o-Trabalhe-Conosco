import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  protocol: z.string().min(3),
  email: z.string().email(),
  reason: z.string().min(10, 'Descreva o motivo com um pouco mais de detalhe.'),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Solicitações de troca ainda não estão conectadas a um banco neste ambiente. Fale com a gente pelo WhatsApp.' },
      { status: 503 }
    )
  }

  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, customer_email, status')
    .eq('protocol', parsed.data.protocol)
    .maybeSingle()

  if (findError || !order || order.customer_email.toLowerCase() !== parsed.data.email.toLowerCase()) {
    return NextResponse.json({ error: 'Pedido não encontrado para o protocolo e e-mail informados.' }, { status: 404 })
  }

  await supabase.from('orders').update({ status: 'troca_solicitada' }).eq('id', order.id)
  await supabase.from('order_status_history').insert({
    order_id: order.id,
    status: 'troca_solicitada',
    note: `Solicitação de troca do cliente: ${parsed.data.reason}`,
  })

  return NextResponse.json({ ok: true })
}
