import type { Metadata } from 'next'
import { InstitutionalPage } from '@/components/institutional/InstitutionalPage'

export const metadata: Metadata = {
  title: 'Política de Personalização',
  description: 'Regras para personalização de camisas com nome e número na Bancada 10.',
  alternates: { canonical: '/institucional/personalizacao' },
}

export default function PersonalizationPolicyPage() {
  return (
    <InstitutionalPage title="Política de Personalização">
      <p>
        Alguns produtos permitem personalização com nome e número, aplicada sob encomenda especialmente para o seu
        pedido.
      </p>

      <h2>Antes de comprar</h2>
      <ul>
        <li>Confira com atenção o nome e o número informados — a produção segue exatamente o que foi digitado.</li>
        <li>Consulte o guia de medidas antes de escolher o tamanho.</li>
        <li>Personalizações têm um valor adicional, exibido na página do produto antes da compra.</li>
      </ul>

      <h2>Trocas em produtos personalizados</h2>
      <p>
        Por serem feitos sob encomenda, produtos personalizados não têm garantia de arrependimento por engano no
        nome/número informado pelo cliente. O direito de troca por defeito de fabricação (peça com problema não
        relacionado à personalização escolhida) permanece garantido, conforme o Código de Defesa do Consumidor — ver
        a Política de Trocas e Devoluções.
      </p>

      <h2>Prazo</h2>
      <p>
        Produtos personalizados podem ter um prazo de processamento maior que produtos sem personalização — o prazo
        de cada produto é exibido em sua página antes da compra.
      </p>

      <p className="mt-6 text-xs text-ink-muted">
        Documento em elaboração — será revisado por um profissional jurídico antes da operação real da loja.
      </p>
    </InstitutionalPage>
  )
}
