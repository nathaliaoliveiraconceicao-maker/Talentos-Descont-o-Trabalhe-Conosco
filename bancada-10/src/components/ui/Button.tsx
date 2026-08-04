import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from '@/lib/utils/format'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-bancada-red text-white hover:bg-bancada-red-dark disabled:bg-bancada-red/50',
  secondary: 'bg-ink text-white hover:bg-ink-soft disabled:bg-ink/50',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-white disabled:opacity-50',
  ghost: 'text-ink hover:bg-ink/5 disabled:opacity-50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-8 text-base',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cx(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-semibold uppercase tracking-wide2 transition-colors duration-150 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
