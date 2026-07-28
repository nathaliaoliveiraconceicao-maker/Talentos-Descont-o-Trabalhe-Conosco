/**
 * Gera um número de protocolo legível para a candidatura, ex: "DSC-20260728-8F42".
 * O prefixo identifica a empresa, seguido da data e de um sufixo aleatório
 * para reduzir a chance de colisão sem depender de um contador central.
 */
export function generateProtocol(): string {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DSC-${datePart}-${randomPart}`;
}
