export const siteConfig = {
  name: 'Bancada 10',
  tagline: 'Para quem vive o futebol dentro e fora do estádio.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  email: 'contato@bancada10.com.br', // TODO: confirmar e-mail oficial de atendimento
  serviceHours: 'Segunda a sexta, 9h às 18h', // TODO: confirmar horário real de atendimento
  social: {
    instagram: 'https://instagram.com/bancada10', // TODO: confirmar handle oficial
    tiktok: '', // TODO
  },
  legal: {
    // TODO: preencher com CNPJ e razão social reais assim que fornecidos — nunca inventar.
    cnpj: '',
    legalName: '',
  },
} as const

export interface NavSubItem {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href: string
  children?: NavSubItem[]
}

export const mainNav: NavItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Lançamentos', href: '/lancamentos' },
  {
    label: 'Times Brasileiros',
    href: '/categoria/times-brasileiros',
    children: [
      { label: 'Todos os times brasileiros', href: '/categoria/times-brasileiros' },
      { label: 'Camisas atuais', href: '/categoria/times-brasileiros?tipo=atual' },
      { label: 'Camisas retrô', href: '/categoria/times-brasileiros?tipo=retro' },
    ],
  },
  {
    label: 'Times Internacionais',
    href: '/categoria/times-internacionais',
    children: [
      { label: 'Todos os times internacionais', href: '/categoria/times-internacionais' },
      { label: 'Camisas atuais', href: '/categoria/times-internacionais?tipo=atual' },
      { label: 'Camisas retrô', href: '/categoria/times-internacionais?tipo=retro' },
    ],
  },
  { label: 'Seleções', href: '/categoria/selecoes' },
  { label: 'Camisas Retrô', href: '/categoria/camisas-retro' },
  { label: 'Linha Infantil', href: '/categoria/linha-infantil' },
  { label: 'Streetwear', href: '/categoria/streetwear' },
  { label: 'Personalização', href: '/personalizacao' },
  { label: 'Ofertas', href: '/ofertas' },
  { label: 'Rastrear Pedido', href: '/rastrear-pedido' },
]

export const topBarMessages: string[] = [
  'Frete grátis para compras acima de R$ 399 nas condições da campanha',
  'Até 10% de desconto pagando no Pix',
  'Parcelamento em até 12x no cartão',
  'Personalize sua camisa com nome e número',
  'Já comprou? Acompanhe seu pedido em "Rastrear Pedido"',
]

export const footerLinks = {
  institucional: [
    { label: 'Quem Somos', href: '/institucional/quem-somos' },
    { label: 'Contato', href: '/institucional/contato' },
    { label: 'Perguntas Frequentes', href: '/institucional/faq' },
    { label: 'Rastrear Pedido', href: '/rastrear-pedido' },
  ],
  politicas: [
    { label: 'Política de Privacidade', href: '/institucional/privacidade' },
    { label: 'Termos e Condições', href: '/institucional/termos' },
    { label: 'Trocas e Devoluções', href: '/institucional/trocas-devolucoes' },
    { label: 'Política de Reembolso', href: '/institucional/reembolso' },
    { label: 'Prazos de Envio', href: '/institucional/prazos-envio' },
    { label: 'Política de Personalização', href: '/institucional/personalizacao' },
  ],
}

export function whatsappLink(message: string) {
  const base = siteConfig.whatsappNumber ? `https://wa.me/${siteConfig.whatsappNumber}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(message)}`
}
