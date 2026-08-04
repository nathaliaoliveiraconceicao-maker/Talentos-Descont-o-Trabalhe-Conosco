import Link from 'next/link'
import { Instagram, Mail, MessageCircle } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { footerLinks, siteConfig, whatsappLink } from '@/lib/site-config'

const paymentMethods = ['Pix', 'Cartão de crédito', 'Boleto bancário']
const shippingMethods = ['Transportadora parceira', 'Envio padrão e expresso']

export function Footer() {
  const hasLegalInfo = siteConfig.legal.cnpj || siteConfig.legal.legalName

  return (
    <footer className="border-t border-ink/10 bg-bancada-off text-ink">
      <div className="container-page grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-muted">
            Camisas de futebol atuais, retrôs, infantis e streetwear para quem vive a paixão pelo futebol dentro e fora do
            estádio.
          </p>
          <div className="mt-4 flex items-center gap-3">
            {siteConfig.social.instagram && (
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Bancada 10"
                className="rounded-full border border-ink/15 p-2 hover:border-ink"
              >
                <Instagram size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xs uppercase tracking-wide2">Atendimento</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>
              <a href={whatsappLink('Olá! Preciso de ajuda com um pedido na Bancada 10.')} className="flex items-center gap-2 hover:text-ink">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 hover:text-ink">
                <Mail size={16} /> {siteConfig.email}
              </a>
            </li>
            <li>{siteConfig.serviceHours}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xs uppercase tracking-wide2">Institucional</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            {footerLinks.institucional.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xs uppercase tracking-wide2">Políticas</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            {footerLinks.politicas.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>
              <strong className="text-ink">Pagamento:</strong> {paymentMethods.join(' · ')}
            </span>
            <span>
              <strong className="text-ink">Envio:</strong> {shippingMethods.join(' · ')}
            </span>
          </div>
          <div>
            {hasLegalInfo ? (
              <span>
                {siteConfig.legal.legalName} {siteConfig.legal.cnpj && `— CNPJ ${siteConfig.legal.cnpj}`}
              </span>
            ) : (
              <span>© {new Date().getFullYear()} Bancada 10</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
