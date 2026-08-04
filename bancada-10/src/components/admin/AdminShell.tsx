'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Image as ImageIcon,
  Star,
  Tag,
  Percent,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useAdminRole } from '@/lib/auth/use-admin-role'
import { Logo } from '@/components/ui/Logo'
import { cx } from '@/lib/utils/format'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/fornecedores', label: 'Fornecedores', icon: Truck },
  { href: '/admin/cupons', label: 'Cupons', icon: Tag },
  { href: '/admin/promocoes', label: 'Promoções', icon: Percent },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/depoimentos', label: 'Depoimentos', icon: Star },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut, isSupabaseConfigured } = useAuth()
  const { isAdmin, loading: roleLoading } = useAdminRole()
  const router = useRouter()
  const pathname = usePathname()
  const loading = authLoading || roleLoading

  useEffect(() => {
    if (!loading && isSupabaseConfigured && !user) {
      router.replace('/admin/login')
    }
  }, [loading, user, isSupabaseConfigured, router])

  if (!isSupabaseConfigured) {
    return (
      <div className="container-page py-16 text-center">
        <p className="mx-auto max-w-md text-sm text-ink-muted">
          O painel administrativo depende do Supabase. Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> em <code>.env.local</code>, aplique{' '}
          <code>supabase/schema.sql</code> e crie o primeiro administrador (ver README).
        </p>
      </div>
    )
  }

  if (loading) {
    return <div className="container-page py-16 text-center text-sm text-ink-muted">Carregando…</div>
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-sm text-ink-muted">
          Esta conta ({user.email}) não tem acesso ao painel administrativo. Peça a um administrador para adicionar
          seu usuário em <code>admin_users</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-bancada-off">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-ink/10 bg-white p-4 lg:flex">
        <Logo />
        <nav className="mt-6 flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  'flex items-center gap-2 rounded px-3 py-2 text-sm font-medium',
                  active ? 'bg-ink text-white' : 'text-ink hover:bg-ink/5'
                )}
              >
                <Icon size={16} /> {link.label}
              </Link>
            )
          })}
        </nav>
        <button
          onClick={() => signOut()}
          className="mt-auto flex items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-bancada-red hover:bg-bancada-red/5"
        >
          <LogOut size={16} /> Sair
        </button>
      </aside>
      <main className="flex-1 overflow-x-hidden p-4 sm:p-8">{children}</main>
    </div>
  )
}
