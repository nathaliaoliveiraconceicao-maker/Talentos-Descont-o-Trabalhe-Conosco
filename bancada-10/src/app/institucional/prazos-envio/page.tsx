import type { Metadata } from 'next'
import { InstitutionalPage } from '@/components/institutional/InstitutionalPage'

export const metadata: Metadata = {
  title: 'Prazos de Envio',
  description: 'Prazos de processamento e envio dos pedidos na Bancada 10.',
  alternates: { canonical: '/institucional/prazos-envio' },
}

export default function ShippingPolicyPage() {
  return (
    <InstitutionalPage title="Prazos de Envio">
      <h2>Processamento</h2>
      <p>
        Após a aprovação do pagamento, seu pedido segue para separação. O prazo de processamento varia por produto
        (camisas personalizadas e retrôs sob encomenda costumam levar mais tempo) e é exibido na página de cada
        produto.
      </p>

      <h2>Transporte</h2>
      <p>
        Utilizamos transportadora parceira, com prazo estimado calculado no carrinho e no checkout a partir do seu
        CEP. O prazo total do pedido é o processamento somado ao prazo de transporte.
      </p>

      <h2>Frete grátis</h2>
      <p>
        Campanhas de frete grátis por valor mínimo de compra são exibidas no carrinho quando ativas — consulte as
        condições vigentes no momento da compra.
      </p>

      <h2>Acompanhamento</h2>
      <p>
        Assim que seu pedido for despachado, você pode acompanhar o status em{' '}
        <a href="/rastrear-pedido">Rastrear Pedido</a>.
      </p>

      <p className="mt-6 text-xs text-ink-muted">
        Prazos podem variar por região e por indisponibilidade temporária de estoque em um fornecedor específico.
      </p>
    </InstitutionalPage>
  )
}
