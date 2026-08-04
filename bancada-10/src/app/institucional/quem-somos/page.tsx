import type { Metadata } from 'next'
import { InstitutionalPage } from '@/components/institutional/InstitutionalPage'

export const metadata: Metadata = {
  title: 'Quem Somos',
  description: 'Conheça a Bancada 10, loja de camisas de futebol atuais, retrôs, infantis e streetwear.',
  alternates: { canonical: '/institucional/quem-somos' },
}

export default function AboutPage() {
  return (
    <InstitutionalPage title="Quem Somos">
      <p>
        A Bancada 10 nasceu para quem vive o futebol dentro e fora do estádio: torcedores de carteirinha,
        colecionadores de camisas retrô, quem usa camisa de time como peça de streetwear no dia a dia e famílias que
        querem vestir os pequenos torcedores com conforto e qualidade.
      </p>
      <p>
        Trabalhamos com camisas atuais, retrôs, infantis e uma linha autoral inspirada na cultura de arquibancada —
        sempre deixando claro quando um produto é oficial licenciado, versão torcedor, versão jogador ou uma peça
        autoral sem vínculo com qualquer clube.
      </p>
      <h2>Nosso compromisso</h2>
      <ul>
        <li>Transparência sobre o tipo e o licenciamento de cada produto.</li>
        <li>Atendimento direto pelo WhatsApp, sem robôs escondendo um humano do outro lado.</li>
        <li>Prazos de envio e status de pedido sempre visíveis para o cliente.</li>
      </ul>
      <p>
        Esta página será atualizada com a razão social, CNPJ e demais dados institucionais assim que a Bancada 10
        formalizar sua operação.
      </p>
    </InstitutionalPage>
  )
}
