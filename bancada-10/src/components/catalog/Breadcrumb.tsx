import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-4 text-xs text-ink-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronRight size={12} />}
          </li>
        ))}
      </ol>
    </nav>
  )
}
