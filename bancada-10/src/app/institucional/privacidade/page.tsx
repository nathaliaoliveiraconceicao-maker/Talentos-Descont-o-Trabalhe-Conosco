import type { Metadata } from 'next'
import { InstitutionalPage } from '@/components/institutional/InstitutionalPage'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como a Bancada 10 coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
  alternates: { canonical: '/institucional/privacidade' },
}

export default function PrivacyPolicyPage() {
  return (
    <InstitutionalPage title="Política de Privacidade">
      <p>
        Esta Política de Privacidade explica como a Bancada 10 coleta, usa, armazena e protege seus dados pessoais,
        em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>Dados de identificação e contato: nome, e-mail, telefone, CPF.</li>
        <li>Dados de endereço, para cálculo de frete e entrega.</li>
        <li>Dados de navegação e uso do site, via cookies e ferramentas de analytics.</li>
        <li>Dados de pagamento são processados diretamente pelo Mercado Pago — não armazenamos número de cartão.</li>
      </ul>

      <h2>Para que usamos seus dados</h2>
      <ul>
        <li>Processar e entregar seus pedidos.</li>
        <li>Emitir nota fiscal e cumprir obrigações legais.</li>
        <li>Enviar comunicações de marketing, somente com seu consentimento (ex.: newsletter).</li>
        <li>Melhorar a experiência de navegação e prevenir fraudes.</li>
      </ul>

      <h2>Compartilhamento</h2>
      <p>
        Compartilhamos dados estritamente necessários com parceiros que viabilizam a operação: processador de
        pagamento (Mercado Pago), transportadoras/fornecedor responsável pelo envio e ferramentas de analytics.
        Nunca vendemos seus dados a terceiros.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar a qualquer momento a confirmação, o acesso, a correção ou a exclusão dos seus dados
        pessoais, entrando em contato pelo e-mail{' '}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos cookies essenciais ao funcionamento do site (ex.: carrinho de compras) e, mediante seu consentimento,
        cookies de analytics e publicidade. Você pode gerenciar sua preferência no aviso de cookies exibido no site.
      </p>

      <p className="mt-6 text-xs text-ink-muted">
        Documento em elaboração — será revisado por um profissional jurídico antes da operação real da loja.
      </p>
    </InstitutionalPage>
  )
}
