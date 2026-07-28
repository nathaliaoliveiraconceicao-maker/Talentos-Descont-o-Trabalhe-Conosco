import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-3 py-8 text-sm text-neutral-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Supermercado Descontão — Banco de Talentos.</p>
        <div className="flex items-center gap-4">
          <Link to="/politica-de-privacidade" className="hover:text-brand-green-700 hover:underline">
            Política de Privacidade
          </Link>
          <Link to="/admin" className="hover:text-brand-green-700 hover:underline">
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
