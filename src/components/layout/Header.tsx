import { Link } from 'react-router-dom';
import { useTenant } from '@/context/TenantContext';
import { Logo } from './Logo';

export function Header() {
  const { tenant } = useTenant();
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to={`/${tenant.slug}`} className="flex items-center gap-3" aria-label="Página inicial">
          <Logo className="h-8" />
          <span className="hidden h-6 w-px bg-neutral-200 sm:block" aria-hidden="true" />
          <span className="hidden text-sm font-semibold text-neutral-700 sm:block">
            {tenant.name || 'Empresa'}
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            to={`/${tenant.slug}/candidatura`}
            className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors sm:inline-flex"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            Quero me candidatar
          </Link>
        </nav>
      </div>
    </header>
  );
}
