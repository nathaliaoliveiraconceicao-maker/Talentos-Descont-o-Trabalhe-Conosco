import type { Metadata } from 'next'
import { InstitutionalPage } from '@/components/institutional/InstitutionalPage'

export const metadata: Metadata = {
  title: 'Política de Reembolso',
  description: 'Prazos e formas de reembolso na Bancada 10.',
  alternates: { canonical: '/institucional/reembolso' },
}

export default function RefundPolicyPage() {
  return (
    <InstitutionalPage title="Política de Reembolso">
      <p>
        Após a confirmação de uma troca ou devolução (ver Política de Trocas e Devoluções), o reembolso é feito da
        seguinte forma:
      </p>
      <ul>
        <li>
          <strong>Pix:</strong> reembolso em até 5 dias úteis após a confirmação, no mesmo Pix usado na compra.
        </li>
        <li>
          <strong>Cartão de crédito:</strong> estorno solicitado à operadora, que pode levar até 2 faturas para
          aparecer, conforme o prazo do seu banco/operadora.
        </li>
        <li>
          <strong>Boleto:</strong> reembolso via transferência bancária, em até 10 dias úteis após a confirmação dos
          dados bancários.
        </li>
      </ul>
      <p>O frete de devolução, quando aplicável por defeito de fabricação, é custeado pela Bancada 10.</p>

      <p className="mt-6 text-xs text-ink-muted">
        Documento em elaboração — será revisado por um profissional jurídico antes da operação real da loja.
      </p>
    </InstitutionalPage>
  )
}
