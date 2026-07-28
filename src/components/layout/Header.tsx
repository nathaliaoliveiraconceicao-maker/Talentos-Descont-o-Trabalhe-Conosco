import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Página inicial">
          <Logo />
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            to="/candidatura"
            className="hidden rounded-lg bg-brand-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-green-700 sm:inline-flex"
          >
            Quero me candidatar
          </Link>
        </nav>
      </div>
    </header>
  );
}
