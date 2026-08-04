import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Atualiza o token de sessão do Supabase a cada requisição (necessário para
 * que Server Components/Route Handlers enxerguem sessões válidas). Não faz
 * nada se o Supabase ainda não estiver configurado.
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let response = NextResponse.next({ request })

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|placeholder-image).*)'],
}
