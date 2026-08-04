'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Heart, LogOut, MapPin, Package, RotateCcw, User } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { cx } from '@/lib/utils/format'

const links = [
  { href: '/conta', label: 'Dados pessoais', icon: User },
  { href: '/conta/enderecos', label: 'Endereços', icon: MapPin },
  { href: '/conta/pedidos', label: 'Meus pedidos', icon: Package },
  { href: '/conta/favoritos', label: 'Favoritos', icon: Heart },
  { href: '/conta/trocas', label: 'Solicitar troca', icon: RotateCcw },
]

export function AccountShell({ children }: { children: React.ReactNode }) {
  const { user, loading, isSupabaseConfigured, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && isSupabaseConfigured) {
      router.replace(`/conta/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [loading, user, isSupabaseConfigured, pathname, router])

  if (loading) {
    return <div className="container-page py-16 text-center text-sm text-ink-muted">Carregando…</div>
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="container-page py-16 text-center">
        <p className="mx-auto max-w-md text-sm text-ink-muted">
          A área do cliente ainda não está disponível neste ambiente — configure o Supabase (
          <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) para ativar cadastro,
          login e histórico de pedidos.
        </p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container-page grid grid-cols-1 gap-8 py-8 lg:grid-cols-[220px_1fr]">
      <aside>
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  'flex items-center gap-2 whitespace-nowrap rounded px-3 py-2 text-sm font-medium',
                  active ? 'bg-ink text-white' : 'text-ink hover:bg-ink/5'
                )}
              >
                <Icon size={16} /> {link.label}
              </Link>
            )
          })}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 whitespace-nowrap rounded px-3 py-2 text-left text-sm font-medium text-bancada-red hover:bg-bancada-red/5"
          >
            <LogOut size={16} /> Sair
          </button>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  )
}
