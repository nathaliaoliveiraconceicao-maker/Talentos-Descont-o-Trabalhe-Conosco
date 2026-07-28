/**
 * Área reservada para a logomarca oficial do Supermercado Descontão.
 * Troque o arquivo em public/logo-placeholder.svg pela logo oficial,
 * ou aponte "src" para um novo arquivo dentro de /public.
 */
export function Logo({ className = 'h-10' }: { className?: string }) {
  return (
    <img
      src="/logo-placeholder.svg"
      alt="Supermercado Descontão"
      className={className}
      width={220}
      height={56}
    />
  );
}
