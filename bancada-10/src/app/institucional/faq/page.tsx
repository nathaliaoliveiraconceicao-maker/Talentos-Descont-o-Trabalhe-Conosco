import type { Metadata } from 'next'
import { InstitutionalPage } from '@/components/institutional/InstitutionalPage'

export const metadata: Metadata = {
  title: 'Perguntas Frequentes',
  description: 'Tire suas dúvidas sobre compra, envio, trocas e personalização na Bancada 10.',
  alternates: { canonical: '/institucional/faq' },
}

const faqs = [
  {
    question: 'As camisas são oficiais?',
    answer:
      'Depende do produto. Cada página de produto informa claramente se a camisa é oficial licenciada, versão torcedor, versão jogador, retrô, alternativa ou uma peça autoral da Bancada 10 sem vínculo com clube — nunca apresentamos um produto não licenciado como oficial.',
  },
  {
    question: 'Como escolho o tamanho certo?',
    answer:
      'Na página de cada produto há um "Guia de medidas" com tabelas para adulto, feminino e infantil, além de instruções para medir uma camisa que você já tem em casa.',
  },
  {
    question: 'Posso personalizar minha camisa com nome e número?',
    answer:
      'Sim, nos produtos com a opção de personalização disponível. Basta marcar a opção na página do produto e preencher nome e número antes de adicionar ao carrinho. Consulte a Política de Personalização para regras de troca.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Pix (com desconto), cartão de crédito em até 12x e boleto bancário, processados com segurança pelo Mercado Pago.',
  },
  {
    question: 'Como acompanho meu pedido?',
    answer: 'Use a página "Rastrear Pedido" com o número do pedido e o e-mail ou CPF usados na compra.',
  },
  {
    question: 'Como funcionam trocas e devoluções?',
    answer: 'Consulte a Política de Trocas e Devoluções — o prazo e as condições variam conforme o motivo e se o produto é personalizado.',
  },
]

export default function FaqPage() {
  return (
    <InstitutionalPage title="Perguntas Frequentes">
      <div className="not-prose divide-y divide-ink/10 border-y border-ink/10">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink">
              {faq.question}
              <span className="text-ink-muted group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-ink-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </InstitutionalPage>
  )
}
