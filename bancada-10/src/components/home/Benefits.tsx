import { ShieldCheck, Wallet, CreditCard, Truck } from 'lucide-react'

const benefits = [
  { icon: ShieldCheck, title: 'Compra segura', description: 'Ambiente protegido do início ao fim da compra.' },
  { icon: Wallet, title: 'Desconto no Pix', description: 'Preço melhor pagando à vista via Pix.' },
  { icon: CreditCard, title: 'Parcelamento em até 12x', description: 'Divida sem juros no cartão de crédito.' },
  { icon: Truck, title: 'Pedido monitorado', description: 'Acompanhe cada etapa do envio até a entrega.' },
]

export function Benefits() {
  return (
    <section aria-label="Benefícios da loja" className="border-b border-ink/10 py-10">
      <div className="container-page grid grid-cols-2 gap-6 sm:grid-cols-4">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-start gap-2 sm:items-center sm:text-center">
            <Icon size={26} className="text-bancada-red" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="hidden text-xs text-ink-muted sm:block">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
