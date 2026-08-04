import type { Product } from '@/lib/types'

export type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'lancamentos' | 'avaliacao'

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'lancamentos', label: 'Lançamentos' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
  { value: 'avaliacao', label: 'Melhor avaliados' },
]

export interface CatalogSearchParams {
  clube?: string
  liga?: string
  temporada?: string
  tamanho?: string
  versao?: string
  manga?: string
  cor?: string
  linha?: string
  tipo?: string // atual | retro
  disponibilidade?: string // em-estoque
  precoMin?: string
  precoMax?: string
  ordenar?: string
  pagina?: string
}

function toParam(value: string) {
  return value.toLowerCase()
}

export function filterProducts(products: Product[], params: CatalogSearchParams): Product[] {
  return products.filter((p) => {
    if (params.clube && toParam(p.club ?? '') !== toParam(params.clube)) return false
    if (params.liga && toParam(p.league ?? '') !== toParam(params.liga)) return false
    if (params.temporada && p.season !== params.temporada) return false
    if (params.tamanho && !p.variants.some((v) => v.size === params.tamanho)) return false
    if (params.versao && p.version !== params.versao) return false
    if (params.manga && p.sleeve !== params.manga) return false
    if (params.cor && toParam(p.color) !== toParam(params.cor)) return false
    if (params.linha && p.line !== params.linha) return false
    if (params.tipo && p.kind !== params.tipo) return false
    if (params.disponibilidade === 'em-estoque' && !p.variants.some((v) => v.stock > 0)) return false
    if (params.precoMin && p.price < Number(params.precoMin)) return false
    if (params.precoMax && p.price > Number(params.precoMax)) return false
    return true
  })
}

export function sortProducts(products: Product[], sort?: string): Product[] {
  const list = [...products]
  switch (sort as SortOption) {
    case 'menor-preco':
      return list.sort((a, b) => a.price - b.price)
    case 'maior-preco':
      return list.sort((a, b) => b.price - a.price)
    case 'avaliacao':
      return list.sort((a, b) => b.rating - a.rating)
    case 'lancamentos':
      return list.sort((a, b) => Number(b.badges.includes('lancamento')) - Number(a.badges.includes('lancamento')))
    default:
      return list
  }
}

export function buildFilterFacets(products: Product[]) {
  const uniq = (values: (string | undefined)[]) => Array.from(new Set(values.filter(Boolean))) as string[]

  return {
    clubs: uniq(products.map((p) => p.club)).sort(),
    leagues: uniq(products.map((p) => p.league)).sort(),
    seasons: uniq(products.map((p) => p.season)).sort().reverse(),
    sizes: uniq(products.flatMap((p) => p.variants.map((v) => v.size))),
    colors: uniq(products.map((p) => p.color)).sort(),
  }
}
