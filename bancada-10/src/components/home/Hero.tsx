import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { placeholderImage } from '@/lib/placeholder'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <Image
          src={placeholderImage('Bancada 10 — coleção da temporada', 'ink', 1920, 1080)}
          alt="Composição urbana com camisas de futebol da coleção atual da Bancada 10"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>
      <div className="container-page relative flex min-h-[520px] flex-col justify-end gap-6 py-16 sm:min-h-[600px]">
        <h1 className="max-w-xl font-display text-4xl uppercase leading-[0.95] tracking-tightest sm:text-6xl">
          Vista sua <span className="text-bancada-red">paixão</span>.
        </h1>
        <p className="max-w-md text-base text-bancada-off/90 sm:text-lg">
          Dos clássicos que marcaram época aos lançamentos da temporada.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/lancamentos">
            <Button size="lg">Ver lançamentos</Button>
          </Link>
          <Link href="/categoria/camisas-retro">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-ink">
              Explorar camisas retrô
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
