import { useTenant } from '@/context/TenantContext';

function initials(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
}

/**
 * Logo do tenant atual (resolvido por useTenant()), usada nas páginas
 * públicas "/{slug}/...". Se o cliente ainda não cadastrou um logoUrl em
 * /superadmin ou nas configurações, mostra um selo com as iniciais do nome
 * nas cores do tenant, para que cada cliente já tenha uma identidade visual
 * própria mesmo sem enviar um arquivo de imagem.
 */
export function TenantLogo({ className = 'h-12' }: { className?: string }) {
  const { tenant } = useTenant();

  if (tenant.logoUrl) {
    return (
      <img
        src={tenant.logoUrl}
        alt={tenant.name}
        className={`w-auto ${className}`}
        style={{ maxWidth: 260 }}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className="flex aspect-square h-full items-center justify-center rounded-xl font-extrabold text-white"
        style={{ backgroundColor: tenant.primaryColor }}
      >
        {initials(tenant.name)}
      </span>
      <span className="text-lg font-extrabold" style={{ color: tenant.primaryColor }}>
        {tenant.name}
      </span>
    </div>
  );
}
