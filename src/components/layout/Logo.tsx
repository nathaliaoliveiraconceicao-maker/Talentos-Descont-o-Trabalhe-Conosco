/**
 * Logo da VagaHub — é a ÚNICA marca gráfica exibida em toda a plataforma
 * (portal público de cada tenant, painel do cliente e painel do
 * superadmin). Empresas clientes não têm mais logomarca própria: cada uma é
 * identificada apenas pelo nome em texto (tenant.name).
 */
export function Logo({ className = 'h-12' }: { className?: string }) {
  return (
    <img
      src="/vagahub-logo.svg"
      alt="VagaHub"
      className={`w-auto ${className}`}
      width={420}
      height={100}
    />
  );
}
