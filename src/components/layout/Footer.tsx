import { Link } from 'react-router-dom';
import { useTenant } from '@/context/TenantContext';

export function Footer() {
  const { tenant } = useTenant();
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-3 py-8 text-sm text-neutral-500 sm:flex-row">
        <p>© {new Date().getFullYear()} {tenant.name} — Banco de Talentos.</p>
        <div className="flex items-center gap-4">
          <Link
            to={`/${tenant.slug}/politica-de-privacidade`}
            className="hover:underline"
            style={{ color: tenant.primaryColor }}
          >
            Política de Privacidade
          </Link>
          <Link to="/app/login" className="hover:underline" style={{ color: tenant.primaryColor }}>
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
