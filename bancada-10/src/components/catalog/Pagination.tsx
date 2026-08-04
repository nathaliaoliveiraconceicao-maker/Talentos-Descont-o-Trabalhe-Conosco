import Link from 'next/link'
import { cx } from '@/lib/utils/format'

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-2">
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cx(
            'flex h-9 w-9 items-center justify-center rounded border text-sm font-medium',
            page === currentPage ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink'
          )}
        >
          {page}
        </Link>
      ))}
    </nav>
  )
}
