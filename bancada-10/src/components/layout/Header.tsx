'use client'

import Link from 'next/link'
import { Heart, Menu, ShoppingBag, User } from 'lucide-react'
import { Suspense, useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import { SearchBar } from '@/components/layout/SearchBar'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { mainNav } from '@/lib/site-config'
import { useCart } from '@/lib/cart/cart-context'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { itemCount, openCart } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white">
      <div className="container-page flex h-16 items-center gap-4">
        <button
          className="rounded p-2 text-ink hover:bg-ink/5 lg:hidden"
          aria-label="Abrir menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={22} />
        </button>

        <Logo className="shrink-0" />

        <div className="hidden flex-1 md:block">
          <Suspense fallback={<div className="h-11 w-full rounded border border-ink/15 bg-white" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/conta" className="rounded p-2 text-ink hover:text-bancada-red" aria-label="Minha conta">
            <User size={20} />
          </Link>
          <Link href="/conta/favoritos" className="rounded p-2 text-ink hover:text-bancada-red" aria-label="Favoritos">
            <Heart size={20} />
          </Link>
          <button onClick={openCart} className="relative rounded p-2 text-ink hover:text-bancada-red" aria-label="Abrir carrinho">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bancada-red px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      <div className="border-t border-ink/5 px-4 py-2 md:hidden">
        <Suspense fallback={<div className="h-11 w-full rounded border border-ink/15 bg-white" />}>
          <SearchBar />
        </Suspense>
      </div>

      <nav aria-label="Categorias" className="hidden border-t border-ink/5 lg:block">
        <div className="container-page flex h-11 items-center gap-6">
          {mainNav.map((item) => (
            <div
              key={item.href}
              className="relative h-full"
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => item.children && setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className="flex h-11 items-center text-xs font-semibold uppercase tracking-wide text-ink hover:text-bancada-red"
              >
                {item.label}
              </Link>
              {item.children && openDropdown === item.label && (
                <div className="absolute left-0 top-11 min-w-[220px] rounded-b border border-t-0 border-ink/10 bg-white py-2 shadow-card">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-ink hover:bg-bancada-off hover:text-bancada-red"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}
