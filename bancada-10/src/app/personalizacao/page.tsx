import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/catalog/Breadcrumb'
import { ProductGridSection } from '@/components/home/ProductGrid'
import { products } from '@/lib/data/products'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Personalização',
  description: 'Personalize sua camisa de futebol com nome e número na Bancada 10.',
  alternates: { canonical: '/personalizacao' },
}

export default function PersonalizationPage() {
  const personalizable = products.filter((p) => p.personalizationAvailable).slice(0, 8)

  return (
    <div>
      <div className="container-page py-8">
        <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Personalização' }]} />
        <h1 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Personalize sua camisa</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Escolha uma camisa elegível para personalização, informe o nome e o número desejados na página do produto e
          receba sua peça com a identidade que você quiser. Consulte a{' '}
          <Link href="/institucional/personalizacao" className="underline">
            Política de Personalização
          </Link>{' '}
          antes de comprar — itens personalizados podem ter regras específicas de troca.
        </p>
        <Link href="/institucional/personalizacao" className="mt-4 inline-block">
          <Button variant="outline">Ver política de personalização</Button>
        </Link>
      </div>

      <ProductGridSection title="Camisas com personalização disponível" products={personalizable} />
    </div>
  )
}
