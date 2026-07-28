import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { hasError, className = '', maxLength, showCount, value, ...props },
  ref
) {
  const length = typeof value === 'string' ? value.length : 0;
  return (
    <div>
      <textarea
        ref={ref}
        value={value}
        maxLength={maxLength}
        rows={4}
        className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus-visible:ring-2 focus-visible:ring-brand-green-500 ${
          hasError ? 'border-red-400' : 'border-neutral-300'
        } ${className}`}
        {...props}
      />
      {showCount && maxLength && (
        <p className="mt-1 text-right text-xs text-neutral-400">
          {length}/{maxLength}
        </p>
      )}
    </div>
  );
});
