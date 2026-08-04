import type { Metadata } from 'next'
import { InstitutionalPage } from '@/components/institutional/InstitutionalPage'

export const metadata: Metadata = {
  title: 'Termos e Condições',
  description: 'Termos e condições de uso e compra no site da Bancada 10.',
  alternates: { canonical: '/institucional/termos' },
}

export default function TermsPage() {
  return (
    <InstitutionalPage title="Termos e Condições">
      <p>Ao usar o site e realizar compras na Bancada 10, você concorda com os termos abaixo.</p>

      <h2>Produtos</h2>
      <p>
        Cada página de produto indica claramente o tipo de licenciamento (oficial, versão torcedor, versão jogador,
        retrô, alternativa ou peça autoral sem vínculo com clube). Fotos são meramente ilustrativas; pequenas
        variações de tom podem ocorrer entre monitores.
      </p>

      <h2>Preços e pagamento</h2>
      <p>
        Preços exibidos em Reais (R$), com desconto para pagamento via Pix e parcelamento em cartão de crédito
        conforme indicado em cada produto. Pagamentos são processados pelo Mercado Pago.
      </p>

      <h2>Direito de arrependimento</h2>
      <p>
        Conforme o art. 49 do Código de Defesa do Consumidor, compras feitas fora do estabelecimento comercial
        (incluindo internet) podem ser canceladas em até 7 dias corridos após o recebimento, sem necessidade de
        justificativa, com devolução integral dos valores pagos. Produtos personalizados podem ter regras
        específicas — ver Política de Personalização.
      </p>

      <h2>Uso do site</h2>
      <ul>
        <li>Você é responsável por manter a confidencialidade dos dados da sua conta.</li>
        <li>É proibido usar o site para fins ilícitos ou que violem direitos de terceiros.</li>
        <li>Reservamo-nos o direito de cancelar pedidos com indícios de fraude.</li>
      </ul>

      <p className="mt-6 text-xs text-ink-muted">
        Documento em elaboração — será revisado por um profissional jurídico antes da operação real da loja.
      </p>
    </InstitutionalPage>
  )
}
