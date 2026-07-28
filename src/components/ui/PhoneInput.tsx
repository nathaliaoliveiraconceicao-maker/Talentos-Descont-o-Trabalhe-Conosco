import { forwardRef, type InputHTMLAttributes } from 'react';
import { maskPhone } from '@/lib/masks';
import { Input } from './Input';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onChange, ...props },
  ref
) {
  return (
    <Input
      ref={ref}
      inputMode="tel"
      autoComplete="tel"
      value={maskPhone(value)}
      onChange={(e) => onChange(maskPhone(e.target.value))}
      {...props}
    />
  );
});
