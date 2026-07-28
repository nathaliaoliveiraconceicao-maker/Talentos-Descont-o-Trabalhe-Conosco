import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="rounded-full bg-neutral-100 p-4 text-neutral-400">
        <SearchX className="h-10 w-10" />
      </span>
      <h1 className="text-2xl font-bold text-neutral-800">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-neutral-500">
        O endereço acessado não existe ou foi movido. Volte para a página inicial para continuar.
      </p>
      <Link to="/">
        <Button>
          <Home className="h-4 w-4" /> Voltar para o início
        </Button>
      </Link>
    </div>
  );
}
