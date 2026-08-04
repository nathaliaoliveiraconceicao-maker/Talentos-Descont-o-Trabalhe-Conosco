import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Pedido confirmado',
  robots: { index: false, follow: false },
}

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ protocolo?: string; demo?: string; status?: string }>
}) {
  const { protocolo, demo, status } = await searchParams

  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <CheckCircle2 size={48} className="text-bancada-red" />
      <h1 className="mt-4 font-display text-2xl uppercase tracking-tightest sm:text-3xl">
        {status === 'pendente' ? 'Pedido recebido' : 'Pedido confirmado'}
      </h1>
      {protocolo && (
        <p className="mt-2 text-sm text-ink-muted">
          Protocolo do pedido: <span className="font-semibold text-ink">{protocolo}</span>
        </p>
      )}
      <p className="mt-1 max-w-md text-sm text-ink-muted">
        Enviamos os detalhes para o e-mail informado. Você pode acompanhar o status a qualquer momento em
        &ldquo;Rastrear Pedido&rdquo;, usando este protocolo.
      </p>

      {demo === '1' && (
        <div className="mt-6 max-w-md rounded border border-ink/15 bg-bancada-off p-4 text-left text-xs text-ink-muted">
          <strong className="block text-ink">Modo demonstração</strong>
          O gateway de pagamento (Mercado Pago) ainda não está configurado neste ambiente — o pedido foi validado e
          registrado, mas nenhuma cobrança real foi processada. Configure <code>MERCADO_PAGO_ACCESS_TOKEN</code> em{' '}
          <code>.env.local</code> para ativar o pagamento real.
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link href="/rastrear-pedido">
          <Button variant="outline">Rastrear pedido</Button>
        </Link>
        <Link href="/">
          <Button>Voltar à loja</Button>
        </Link>
      </div>
    </div>
  )
}
