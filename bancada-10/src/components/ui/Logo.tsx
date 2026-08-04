import Link from 'next/link'
import { cx } from '@/lib/utils/format'

/**
 * Monograma placeholder da Bancada 10 — B10, com o interior do "0"
 * representando um campo de futebol visto de cima (linha central + círculo).
 *
 * Este é um SVG gerado em código, não a arte final da marca. Assim que os
 * arquivos oficiais existirem, substituir por eles — ver `public/brand/README.md`.
 */
function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={className}
      role="img"
      aria-label="Bancada 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text x="0" y="30" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize="30" fill="currentColor">
        B1
      </text>
      <g transform="translate(38, 4)">
        <rect x="0.5" y="0.5" width="25" height="31" rx="12.5" stroke="currentColor" strokeWidth="3" />
        <line x1="13" y1="0.5" x2="13" y2="31.5" stroke="currentColor" strokeWidth="1.4" opacity="0.85" />
        <circle cx="13" cy="16" r="5" stroke="currentColor" strokeWidth="1.4" opacity="0.85" />
      </g>
    </svg>
  )
}

export function Logo({
  className,
  variant = 'full',
  tone = 'ink',
}: {
  className?: string
  variant?: 'full' | 'mark'
  tone?: 'ink' | 'white'
}) {
  const color = tone === 'white' ? 'text-white' : 'text-ink'
  return (
    <Link href="/" aria-label="Bancada 10 — página inicial" className={cx('inline-flex items-center gap-2', color, className)}>
      <Mark className="h-8 w-auto" />
      {variant === 'full' && (
        <span className="hidden font-display text-sm uppercase tracking-wide2 sm:inline">
          Bancada<span className="text-bancada-red">10</span>
        </span>
      )}
    </Link>
  )
}
