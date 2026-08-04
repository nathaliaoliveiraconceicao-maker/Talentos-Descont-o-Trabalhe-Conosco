'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Client Supabase para uso em Client Components. Retorna `null` se as
 * variáveis de ambiente não estiverem configuradas — chamadores devem tratar
 * esse caso (ex.: desabilitar login até o Supabase ser configurado) em vez
 * de deixar a página quebrar.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(url, anonKey)
  }
  return browserClient
}
