import { forwardRef } from 'react'
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cx } from '@/lib/utils/format'

interface FieldWrapperProps {
  label?: string
  error?: string
  hint?: string
  htmlFor: string
  required?: boolean
}

function FieldWrapper({ label, error, hint, htmlFor, required, children }: FieldWrapperProps & { children: React.ReactNode }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
          {label} {required && <span className="text-bancada-red">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-bancada-red">
          {error}
        </p>
      )}
    </div>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, required, className, ...props }, ref) => {
    const fieldId = id || props.name || label
    return (
      <FieldWrapper label={label} error={error} hint={hint} htmlFor={fieldId as string} required={required}>
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          className={cx(
            'h-11 w-full rounded border bg-white px-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none',
            error ? 'border-bancada-red' : 'border-ink/20',
            className
          )}
          {...props}
        />
      </FieldWrapper>
    )
  }
)
Input.displayName = 'Input'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, required, className, children, ...props }, ref) => {
    const fieldId = id || props.name || label
    return (
      <FieldWrapper label={label} error={error} hint={hint} htmlFor={fieldId as string} required={required}>
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          className={cx(
            'h-11 w-full rounded border bg-white px-3 text-sm text-ink focus:border-ink focus:outline-none',
            error ? 'border-bancada-red' : 'border-ink/20',
            className
          )}
          {...props}
        >
          {children}
        </select>
      </FieldWrapper>
    )
  }
)
Select.displayName = 'Select'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, required, className, ...props }, ref) => {
    const fieldId = id || props.name || label
    return (
      <FieldWrapper label={label} error={error} hint={hint} htmlFor={fieldId as string} required={required}>
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          className={cx(
            'w-full rounded border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none',
            error ? 'border-bancada-red' : 'border-ink/20',
            className
          )}
          {...props}
        />
      </FieldWrapper>
    )
  }
)
Textarea.displayName = 'Textarea'

export function Checkbox({
  label,
  id,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label htmlFor={id} className={cx('flex cursor-pointer items-start gap-2 text-sm text-ink', className)}>
      <input type="checkbox" id={id} className="mt-0.5 h-4 w-4 accent-bancada-red" {...props} />
      <span>{label}</span>
    </label>
  )
}
