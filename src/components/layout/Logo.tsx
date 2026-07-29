/**
 * Logo da PLATAFORMA (VagaHub) — usada no login/painel /app/* (antes de
 * resolver o tenant do usuário) e em /superadmin/*. Para a logo de um tenant
 * específico nas páginas públicas "/{slug}/...", use <TenantLogo /> em vez
 * deste.
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
