'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { trackEvent } from '@/lib/analytics/events'
import { cx } from '@/lib/utils/format'

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const query = value.trim()
    if (!query) return
    trackEvent('search', { search_term: query })
    router.push(`/busca?q=${encodeURIComponent(query)}`)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cx('relative w-full', className)}>
      <label htmlFor="site-search" className="sr-only">
        Buscar camisas, times ou seleções
      </label>
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar time, seleção ou camisa retrô…"
        className="h-11 w-full rounded border border-ink/15 bg-white pl-4 pr-11 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-2 text-ink hover:text-bancada-red"
      >
        <Search size={18} />
      </button>
    </form>
  )
}
