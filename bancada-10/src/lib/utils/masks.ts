export function maskCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}

export function maskCep(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2')
}

/** Validação de CPF por dígito verificador (algoritmo padrão da Receita Federal). */
export function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  const digits = cpf.split('').map(Number)

  function checkDigit(length: number) {
    const sum = digits.slice(0, length).reduce((acc, digit, i) => acc + digit * (length + 1 - i), 0)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }

  return checkDigit(9) === digits[9] && checkDigit(10) === digits[10]
}
