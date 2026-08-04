import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-6xl text-bancada-red">404</p>
      <h1 className="mt-4 font-display text-2xl uppercase tracking-tightest">Página não encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        O produto ou a página que você procura não existe mais ou o endereço está incorreto.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button>Voltar à loja</Button>
        </Link>
        <Link href="/lancamentos">
          <Button variant="outline">Ver lançamentos</Button>
        </Link>
      </div>
    </div>
  )
}
