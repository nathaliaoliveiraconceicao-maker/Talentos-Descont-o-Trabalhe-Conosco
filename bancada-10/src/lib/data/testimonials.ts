import type { Testimonial } from '@/lib/types'

/**
 * IMPORTANTE: todos os itens abaixo são DEMONSTRATIVOS (`isDemo: true`) e
 * devem ser exibidos com identificação clara de que são exemplos, até que
 * avaliações reais de clientes sejam cadastradas (ver painel admin →
 * Depoimentos). Nunca remover a flag `isDemo` sem substituir pelo conteúdo
 * real correspondente.
 */
export const testimonials: Testimonial[] = [
  {
    id: 't-001',
    customerName: 'Rafael M.',
    rating: 5,
    comment: 'Camisa com acabamento muito bom, chegou antes do prazo e o tecido é ótimo pro dia a dia.',
    productName: 'Camisa Atlético Vermelho I 2025',
    date: '2026-06-12',
    verifiedPurchase: true,
    isDemo: true,
  },
  {
    id: 't-002',
    customerName: 'Camila S.',
    rating: 5,
    comment: 'Comprei a retrô pro meu pai e ele amou, veio exatamente como nas fotos.',
    productName: 'Camisa Retrô Seleção Alfa 1994',
    date: '2026-05-28',
    verifiedPurchase: true,
    isDemo: true,
  },
  {
    id: 't-003',
    customerName: 'Diego A.',
    rating: 4,
    comment: 'Personalização ficou boa, só demorou um pouco mais que o previsto pra ficar pronta.',
    productName: 'Camisa União Metropolitana II 2025',
    date: '2026-05-02',
    verifiedPurchase: true,
    isDemo: true,
  },
  {
    id: 't-004',
    customerName: 'Bianca F.',
    rating: 5,
    comment: 'Kit infantil ficou lindo no meu filho, tecido leve e não desbota na lavagem.',
    productName: 'Kit Infantil Seleção Alfa 2026 (camisa + shorts)',
    date: '2026-04-19',
    verifiedPurchase: true,
    isDemo: true,
  },
]
