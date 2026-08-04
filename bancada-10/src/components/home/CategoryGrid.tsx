import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { categories } from '@/lib/data/categories'

export function CategoryGrid() {
  return (
    <section className="py-14">
      <div className="container-page">
        <h2 className="font-display text-2xl uppercase tracking-tightest sm:text-3xl">Categorias em destaque</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categoria/${category.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded bg-ink"
            >
              <Image
                src={category.heroImage.url}
                alt={category.heroImage.alt}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover opacity-70 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/10 to-transparent p-3">
                <span className="flex items-center gap-1 text-sm font-semibold text-white">
                  {category.name}
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
