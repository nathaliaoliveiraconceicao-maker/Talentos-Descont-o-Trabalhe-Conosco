import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Client Supabase para Server Components / Route Handlers, respeitando a
 * sessão do usuário via cookies. Retorna `null` se o Supabase ainda não
 * estiver configurado (ver .env.example) — chamadores devem tratar isso.
 */
export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const cookieStore = await cookies()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options ?? {}))
        } catch {
          // set() chamado de um Server Component sem middleware de refresh de
          // sessão — pode ser ignorado com segurança se houver um middleware
          // cuidando disso (ver src/middleware.ts).
        }
      },
    },
  })
}

/**
 * Client com a chave `service_role` — acesso administrativo total, ignora
 * Row Level Security. Uso EXCLUSIVO em rotas server-side de confiança
 * (ex.: painel admin, scripts de importação). NUNCA importar em código que
 * roda no navegador.
 */
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
