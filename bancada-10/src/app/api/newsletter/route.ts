import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const schema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    // Supabase ainda não configurado neste ambiente — aceita a requisição
    // para não quebrar a UI, mas não persiste nada. Configurar
    // NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY para ativar.
    return NextResponse.json({ ok: true, persisted: false })
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: parsed.data.email }, { onConflict: 'email' })

  if (error) {
    return NextResponse.json({ error: 'Não foi possível concluir o cadastro.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, persisted: true })
}
