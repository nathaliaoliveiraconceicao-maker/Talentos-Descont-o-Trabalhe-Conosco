import type { Metadata } from 'next'
import { TopBar } from '@/components/layout/TopBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartProvider } from '@/lib/cart/cart-context'
import { FavoritesProvider } from '@/lib/favorites/favorites-context'
import { AuthProvider } from '@/lib/auth/auth-context'
import { AnalyticsScripts } from '@/components/analytics/AnalyticsScripts'
import { siteConfig } from '@/lib/site-config'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Bancada 10 — Camisas de Futebol Atuais, Retrôs e Streetwear',
    template: '%s | Bancada 10',
  },
  description:
    'Camisas de futebol atuais, retrôs, infantis e streetwear. Personalize com nome e número e viva o futebol dentro e fora do estádio.',
  keywords: ['camisas de futebol', 'camisas retrô', 'camisas de times', 'kits infantis de futebol', 'camisas de seleções'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Bancada 10',
    title: 'Bancada 10 — Camisas de Futebol Atuais, Retrôs e Streetwear',
    description:
      'Camisas de futebol atuais, retrôs, infantis e streetwear. Personalize com nome e número e viva o futebol dentro e fora do estádio.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        <a href="#conteudo-principal" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <TopBar />
              <Header />
              <main id="conteudo-principal" className="flex-1">
                {children}
              </main>
              <Footer />
              <WhatsAppFloat />
              <CartDrawer />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
        <CookieConsent />
        <AnalyticsScripts />
      </body>
    </html>
  )
}
