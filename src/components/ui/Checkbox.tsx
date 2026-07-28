import { forwardRef, type InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, id, className = '', ...props },
  ref
) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 has-[:checked]:border-brand-green-400 has-[:checked]:bg-brand-green-50 ${className}`}
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-brand-green-600 focus-visible:ring-2 focus-visible:ring-brand-green-500"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-neutral-800">{label}</span>
        {description && <span className="block text-xs text-neutral-500">{description}</span>}
      </span>
    </label>
  );
});
