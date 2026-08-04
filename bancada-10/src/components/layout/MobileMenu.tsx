'use client'

import Link from 'next/link'
import { ChevronDown, MessageCircle, User } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { mainNav, siteConfig, whatsappLink } from '@/lib/site-config'

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <Drawer open={open} onClose={onClose} side="left" title="Menu">
      <nav aria-label="Menu principal" className="flex flex-col divide-y divide-ink/10">
        {mainNav.map((item) => (
          <div key={item.href}>
            {item.children ? (
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-ink"
                aria-expanded={expanded === item.label}
                onClick={() => setExpanded((current) => (current === item.label ? null : item.label))}
              >
                {item.label}
                <ChevronDown size={16} className={expanded === item.label ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
            ) : (
              <Link href={item.href} onClick={onClose} className="block px-4 py-3 text-sm font-semibold text-ink">
                {item.label}
              </Link>
            )}
            {item.children && expanded === item.label && (
              <div className="bg-bancada-off/60 pb-2">
                {item.children.map((child) => (
                  <Link key={child.href} href={child.href} onClick={onClose} className="block px-8 py-2 text-sm text-ink-muted">
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="mt-4 flex flex-col gap-1 border-t border-ink/10 px-4 py-4">
        <Link href="/conta" onClick={onClose} className="flex items-center gap-2 py-2 text-sm text-ink">
          <User size={18} /> Minha conta
        </Link>
        <a
          href={whatsappLink(`Olá! Vim pelo site da ${siteConfig.name} e gostaria de tirar uma dúvida.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 py-2 text-sm text-ink"
        >
          <MessageCircle size={18} /> Falar no WhatsApp
        </a>
      </div>
    </Drawer>
  )
}
