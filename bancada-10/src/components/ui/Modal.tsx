'use client'

import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Fechar" className="absolute inset-0 bg-ink/60" onClick={onClose} tabIndex={-1} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded bg-white shadow-xl animate-fade-up"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-ink/10 bg-white px-5 py-4">
          <h2 className="font-display text-sm uppercase tracking-wide2">{title}</h2>
          <button ref={closeButtonRef} onClick={onClose} aria-label="Fechar" className="rounded p-1.5 text-ink hover:bg-ink/5">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
