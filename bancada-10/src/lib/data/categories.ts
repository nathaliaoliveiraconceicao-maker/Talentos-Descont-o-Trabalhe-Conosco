import type { Category } from '@/lib/types'
import { placeholderImage } from '@/lib/placeholder'

/**
 * Categorias em destaque na home e usadas no menu principal.
 * TODO(conteúdo real): substituir `heroImage` por fotografia de produto real
 * assim que disponível; textos podem ser editados livremente pelo painel admin.
 */
export const categories: Category[] = [
  {
    slug: 'times-brasileiros',
    name: 'Times Brasileiros',
    description: 'Camisas dos principais clubes do futebol nacional, de todas as divisões.',
    heroImage: { url: placeholderImage('Brasileirão', 'ink', 1600, 700), alt: 'Camisas de times brasileiros' },
    competitionKind: 'clube_brasileiro',
  },
  {
    slug: 'times-internacionais',
    name: 'Times Internacionais',
    description: 'Grandes ligas europeias e clubes que marcam época fora do Brasil.',
    heroImage: { url: placeholderImage('Europa', 'red', 1600, 700), alt: 'Camisas de times internacionais' },
    competitionKind: 'clube_internacional',
  },
  {
    slug: 'selecoes',
    name: 'Seleções',
    description: 'Camisas de seleções nacionais, de Copas passadas às convocações atuais.',
    heroImage: { url: placeholderImage('Seleções', 'ink', 1600, 700), alt: 'Camisas de seleções' },
    competitionKind: 'selecao',
  },
  {
    slug: 'camisas-retro',
    name: 'Camisas Retrô',
    description: 'Temporadas e títulos que marcaram época — para colecionadores e nostálgicos.',
    heroImage: { url: placeholderImage('Retrô', 'red', 1600, 700), alt: 'Camisas retrô' },
  },
  {
    slug: 'linha-infantil',
    name: 'Linha Infantil',
    description: 'Kits e camisas para a torcida mirim, do bebê ao juvenil.',
    heroImage: { url: placeholderImage('Infantil', 'ink', 1600, 700), alt: 'Camisas infantis' },
  },
  {
    slug: 'streetwear',
    name: 'Streetwear',
    description: 'Camisas com apelo urbano para usar dentro e fora do estádio.',
    heroImage: { url: placeholderImage('Streetwear', 'red', 1600, 700), alt: 'Camisas streetwear' },
  },
]

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug)
}
