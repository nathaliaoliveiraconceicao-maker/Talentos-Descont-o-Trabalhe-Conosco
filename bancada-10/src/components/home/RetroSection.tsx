import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { placeholderImage } from '@/lib/placeholder'

export function RetroSection() {
  return (
    <section className="bg-ink text-bancada-off">
      <div className="container-page grid grid-cols-1 items-center gap-0 lg:grid-cols-2">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[480px]">
          <Image
            src={placeholderImage('Coleção retrô', 'red', 1200, 1200)}
            alt="Camisas retrô da Bancada 10, composição editorial"
            fill
            className="object-cover"
          />
        </div>
        <div className="px-6 py-14 sm:px-12 lg:py-0">
          <h2 className="font-display text-3xl uppercase tracking-tightest sm:text-4xl">Camisas que carregam histórias.</h2>
          <p className="mt-4 max-w-md text-sm text-bancada-off/80 sm:text-base">
            Reviva temporadas, títulos e momentos que nunca saíram da memória do torcedor.
          </p>
          <Link href="/categoria/camisas-retro" className="mt-6 inline-block">
            <Button variant="outline" className="border-bancada-off text-bancada-off hover:bg-bancada-off hover:text-ink">
              Ver coleção retrô
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
