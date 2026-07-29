import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError, className = '', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus-visible:ring-2 focus-visible:ring-brand-blue-500 focus-visible:ring-offset-0 disabled:bg-neutral-100 disabled:text-neutral-400 ${
        hasError ? 'border-red-400' : 'border-neutral-300'
      } ${className}`}
      {...props}
    />
  );
});
