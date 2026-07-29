/**
 * Área reservada para a logomarca oficial do Supermercado Descontão.
 * Troque o arquivo em public/logo-placeholder.svg pela logo oficial,
 * ou aponte "src" para um novo arquivo dentro de /public.
 */
export function Logo({ className = 'h-12' }: { className?: string }) {
  return (
    <img
      src="/logo-placeholder.svg"
      alt="Supermercado Descontão"
      className={`w-auto ${className}`}
      width={480}
      height={190}
    />
  );
}
