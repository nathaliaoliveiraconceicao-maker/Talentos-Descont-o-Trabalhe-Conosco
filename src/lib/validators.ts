import { onlyDigits } from './masks';

export function isValidEmail(email: string): boolean {
  if (!email.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = onlyDigits(phone);
  return digits.length === 10 || digits.length === 11;
}

export function isValidCpf(cpf: string): boolean {
  const digits = onlyDigits(cpf);
  if (!digits) return true; // opcional
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calcCheckDigit = (base: string, factor: number) => {
    let total = 0;
    for (const digit of base) {
      total += Number(digit) * factor--;
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const digit1 = calcCheckDigit(digits.slice(0, 9), 10);
  const digit2 = calcCheckDigit(digits.slice(0, 10), 11);
  return digit1 === Number(digits[9]) && digit2 === Number(digits[10]);
}

export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !Number.isNaN(date.getTime());
}

export function isAdult(dateStr: string, minAge = 16): boolean {
  if (!isValidDate(dateStr)) return false;
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= minAge;
}

export function requiredMessage(fieldLabel: string): string {
  return `${fieldLabel} é obrigatório.`;
}

export const MAX_TEXT_SHORT = 400;
export const MAX_TEXT_LONG = 800;

export function textLengthOk(value: string, max: number): boolean {
  return value.trim().length > 0 && value.length <= max;
}
