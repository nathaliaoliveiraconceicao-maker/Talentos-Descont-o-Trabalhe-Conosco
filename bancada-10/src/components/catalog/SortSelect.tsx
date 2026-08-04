'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { sortOptions } from '@/lib/catalog/filter'

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('ordenar', value)
    else params.delete('ordenar')
    params.delete('pagina')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <span className="hidden sm:inline">Ordenar por</span>
      <select
        value={searchParams.get('ordenar') ?? 'relevancia'}
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 rounded border border-ink/20 px-2 text-sm focus:border-ink focus:outline-none"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}
