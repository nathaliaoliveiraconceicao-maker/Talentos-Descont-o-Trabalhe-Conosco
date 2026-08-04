'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cx } from '@/lib/utils/format'

export interface FilterFacets {
  clubs: string[]
  leagues: string[]
  seasons: string[]
  sizes: string[]
  colors: string[]
}

const SLEEVE_LABEL: Record<string, string> = { manga_curta: 'Manga curta', manga_longa: 'Manga longa' }
const VERSION_LABEL: Record<string, string> = { torcedor: 'Torcedor', jogador: 'Jogador' }
const LINE_LABEL: Record<string, string> = { adulto: 'Adulto', infantil: 'Infantil', feminino: 'Feminino' }

export function FilterPanel({ facets, onApplied }: { facets: FilterFacets; onApplied?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [priceMin, setPriceMin] = useState(searchParams.get('precoMin') ?? '')
  const [priceMax, setPriceMax] = useState(searchParams.get('precoMax') ?? '')

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('pagina')
    router.push(`${pathname}?${params.toString()}`)
    onApplied?.()
  }

  function toggleSize(size: string) {
    const current = searchParams.get('tamanho')
    updateParam('tamanho', current === size ? '' : size)
  }

  function toggleValue(key: string, value: string) {
    const current = searchParams.get(key)
    updateParam(key, current === value ? '' : value)
  }

  function handlePriceSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (priceMin) params.set('precoMin', priceMin)
    else params.delete('precoMin')
    if (priceMax) params.set('precoMax', priceMax)
    else params.delete('precoMax')
    params.delete('pagina')
    router.push(`${pathname}?${params.toString()}`)
    onApplied?.()
  }

  function clearAll() {
    router.push(pathname)
    onApplied?.()
  }

  const activeSize = searchParams.get('tamanho')
  const activeLine = searchParams.get('linha')
  const activeVersion = searchParams.get('versao')
  const activeSleeve = searchParams.get('manga')
  const activeKind = searchParams.get('tipo')
  const activeAvailability = searchParams.get('disponibilidade')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-wide2">Filtrar</h2>
        <button onClick={clearAll} className="text-xs font-medium text-bancada-red hover:underline">
          Limpar filtros
        </button>
      </div>

      {facets.clubs.length > 0 && (
        <Select label="Clube" value={searchParams.get('clube') ?? ''} onChange={(e) => updateParam('clube', e.target.value)}>
          <option value="">Todos</option>
          {facets.clubs.map((club) => (
            <option key={club} value={club}>
              {club}
            </option>
          ))}
        </Select>
      )}

      {facets.leagues.length > 0 && (
        <Select label="Liga / Seleções" value={searchParams.get('liga') ?? ''} onChange={(e) => updateParam('liga', e.target.value)}>
          <option value="">Todas</option>
          {facets.leagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </Select>
      )}

      {facets.seasons.length > 0 && (
        <Select label="Temporada" value={searchParams.get('temporada') ?? ''} onChange={(e) => updateParam('temporada', e.target.value)}>
          <option value="">Todas</option>
          {facets.seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </Select>
      )}

      {facets.sizes.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">Tamanho</p>
          <div className="flex flex-wrap gap-1.5">
            {facets.sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={cx(
                  'h-8 min-w-8 rounded border px-2 text-xs font-semibold',
                  activeSize === size ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Versão</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(VERSION_LABEL).map(([value, label]) => (
            <button
              key={value}
              onClick={() => toggleValue('versao', value)}
              className={cx(
                'rounded border px-2.5 py-1.5 text-xs font-semibold',
                activeVersion === value ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Manga</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(SLEEVE_LABEL).map(([value, label]) => (
            <button
              key={value}
              onClick={() => toggleValue('manga', value)}
              className={cx(
                'rounded border px-2.5 py-1.5 text-xs font-semibold',
                activeSleeve === value ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {facets.colors.length > 0 && (
        <Select label="Cor" value={searchParams.get('cor') ?? ''} onChange={(e) => updateParam('cor', e.target.value)}>
          <option value="">Todas</option>
          {facets.colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </Select>
      )}

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Linha</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(LINE_LABEL).map(([value, label]) => (
            <button
              key={value}
              onClick={() => toggleValue('linha', value)}
              className={cx(
                'rounded border px-2.5 py-1.5 text-xs font-semibold',
                activeLine === value ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Retrô ou atual</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => toggleValue('tipo', 'atual')}
            className={cx(
              'rounded border px-2.5 py-1.5 text-xs font-semibold',
              activeKind === 'atual' ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink'
            )}
          >
            Atual
          </button>
          <button
            onClick={() => toggleValue('tipo', 'retro')}
            className={cx(
              'rounded border px-2.5 py-1.5 text-xs font-semibold',
              activeKind === 'retro' ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink'
            )}
          >
            Retrô
          </button>
        </div>
      </div>

      <form onSubmit={handlePriceSubmit}>
        <p className="mb-1.5 text-sm font-medium text-ink">Faixa de preço</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Mín."
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-9 w-full rounded border border-ink/20 px-2 text-sm"
          />
          <span className="text-ink-muted">–</span>
          <input
            type="number"
            min={0}
            placeholder="Máx."
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-9 w-full rounded border border-ink/20 px-2 text-sm"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" className="mt-2 w-full">
          Aplicar
        </Button>
      </form>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={activeAvailability === 'em-estoque'}
          onChange={(e) => updateParam('disponibilidade', e.target.checked ? 'em-estoque' : '')}
          className="h-4 w-4 accent-bancada-red"
        />
        Somente disponíveis em estoque
      </label>
    </div>
  )
}
