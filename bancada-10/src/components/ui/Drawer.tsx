'use client'

import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cx } from '@/lib/utils/format'

export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right'
  title: string
  children: React.ReactNode
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-ink/50"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'absolute top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-xl',
          side === 'right' ? 'right-0 animate-fade-up' : 'left-0 animate-fade-up'
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-4">
          <h2 className="font-display text-sm uppercase tracking-wide2">{title}</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fechar"
            className="rounded p-1.5 text-ink hover:bg-ink/5"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
