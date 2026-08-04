import type { Metadata } from 'next'
import Link from 'next/link'
import { InstitutionalPage } from '@/components/institutional/InstitutionalPage'

export const metadata: Metadata = {
  title: 'Trocas e Devoluções',
  description: 'Como funcionam trocas e devoluções na Bancada 10.',
  alternates: { canonical: '/institucional/trocas-devolucoes' },
}

export default function ExchangePolicyPage() {
  return (
    <InstitutionalPage title="Trocas e Devoluções">
      <h2>Arrependimento (produtos não personalizados)</h2>
      <p>
        Você pode solicitar troca ou devolução em até 7 dias corridos após o recebimento, sem necessidade de
        justificativa, conforme o Código de Defesa do Consumidor. O produto deve estar sem uso, com etiquetas e
        embalagem originais.
      </p>

      <h2>Defeito de fabricação</h2>
      <p>
        Produtos com defeito podem ser trocados em até 90 dias após o recebimento, conforme o art. 26 do CDC.
        Envie fotos do defeito junto com sua solicitação para agilizar a análise.
      </p>

      <h2>Produtos personalizados (nome e número)</h2>
      <p>
        Por serem feitos sob encomenda, camisas personalizadas não têm garantia de arrependimento por
        &ldquo;mudança de ideia&rdquo; sobre o nome/número escolhido. O direito de troca por defeito de fabricação continua
        garantido normalmente. Ver detalhes na{' '}
        <Link href="/institucional/personalizacao">Política de Personalização</Link>.
      </p>

      <h2>Como solicitar</h2>
      <p>
        Acesse{' '}
        <Link href="/conta/trocas">Solicitar troca</Link> na sua conta, informando o número do pedido e o motivo.
        Você também pode falar com a gente pelo WhatsApp.
      </p>

      <p className="mt-6 text-xs text-ink-muted">
        Documento em elaboração — será revisado por um profissional jurídico antes da operação real da loja.
      </p>
    </InstitutionalPage>
  )
}
