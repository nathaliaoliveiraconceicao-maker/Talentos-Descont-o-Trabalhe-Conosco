/**
 * Logo da PLATAFORMA — usada no login/painel /app/* (antes de resolver o
 * tenant do usuário) e em /superadmin/*. Para a logo de um tenant específico
 * nas páginas públicas "/{slug}/...", use <TenantLogo /> em vez deste.
 */
export function Logo({ className = 'h-12' }: { className?: string }) {
  return (
    <img
      src="/logo-placeholder.svg"
      alt="Plataforma de Recrutamento"
      className={`w-auto ${className}`}
      width={360}
      height={90}
    />
  );
}
