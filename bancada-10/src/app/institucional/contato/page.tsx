import type { Metadata } from 'next'
import { MessageCircle, Mail, Clock } from 'lucide-react'
import { InstitutionalPage } from '@/components/institutional/InstitutionalPage'
import { siteConfig, whatsappLink } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com a Bancada 10 pelo WhatsApp ou e-mail.',
  alternates: { canonical: '/institucional/contato' },
}

export default function ContactPage() {
  return (
    <InstitutionalPage title="Contato">
      <p>Estamos por aqui para ajudar com dúvidas sobre produtos, pedidos, trocas e personalização.</p>
      <ul className="not-prose mt-4 space-y-3 text-sm text-ink">
        <li className="flex items-center gap-2">
          <MessageCircle size={16} />
          <a href={whatsappLink('Olá! Gostaria de falar com a Bancada 10.')} className="underline">
            WhatsApp
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Mail size={16} />
          <a href={`mailto:${siteConfig.email}`} className="underline">
            {siteConfig.email}
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Clock size={16} /> {siteConfig.serviceHours}
        </li>
      </ul>
      <p className="mt-6 text-xs text-ink-muted">
        Endereço, telefone fixo, CNPJ e razão social serão adicionados aqui assim que forem definidos — não
        publicamos dados institucionais que ainda não foram confirmados.
      </p>
    </InstitutionalPage>
  )
}
