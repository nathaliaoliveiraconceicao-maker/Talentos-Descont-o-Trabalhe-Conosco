import { Link } from 'react-router-dom';
import { Building2, LogIn } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';

/**
 * Página raiz da plataforma ("/"). Cada empresa cliente tem seu próprio
 * portal público em "/{slug}" (ex.: "/descontao"); esta página não pertence
 * a nenhum tenant específico — serve apenas como ponto de entrada neutro
 * para quem chega direto na raiz do domínio.
 */
export function PlatformLanding() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-50 px-4 text-center">
      <Logo className="h-14" />
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-neutral-800">Todas as suas contratações em um só lugar.</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Cada empresa cliente possui seu próprio portal de pré-candidatura, acessível pelo link
          exclusivo fornecido a ela (ex.: <code className="rounded bg-neutral-100 px-1.5 py-0.5">/descontao</code>).
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/app/login">
          <Button variant="outline">
            <LogIn className="h-4 w-4" /> Já sou cliente — acessar painel
          </Button>
        </Link>
        <Link to="/superadmin/login">
          <Button variant="ghost">
            <Building2 className="h-4 w-4" /> Acesso da plataforma
          </Button>
        </Link>
      </div>
    </div>
  );
}
