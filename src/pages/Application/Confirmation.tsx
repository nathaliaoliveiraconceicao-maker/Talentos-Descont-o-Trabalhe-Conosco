import { Link, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Copy, Home } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function Confirmation() {
  const location = useLocation();
  const protocol = (location.state as { protocol?: string } | null)?.protocol;
  const [copied, setCopied] = useState(false);

  if (!protocol) {
    return <Navigate to="/" replace />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(protocol);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível; usuário pode copiar manualmente
    }
  };

  return (
    <div className="container-page flex max-w-xl flex-col items-center gap-6 py-16 text-center">
      <span className="rounded-full bg-brand-blue-100 p-4 text-brand-blue-700">
        <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold text-neutral-800 sm:text-3xl">
        Pré-candidatura enviada com sucesso!
      </h1>
      <p className="text-neutral-600">
        Obrigado pelo interesse em fazer parte da equipe do Supermercado Descontão. Nossa equipe
        analisará suas informações e, caso seu perfil seja selecionado, entraremos em contato.
      </p>

      <div className="flex w-full flex-col items-center gap-2 rounded-xl2 border border-dashed border-brand-blue-400 bg-brand-blue-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue-700">
          Número de protocolo
        </p>
        <p className="text-2xl font-extrabold text-brand-blue-900">{protocol}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue-700 hover:underline"
        >
          <Copy className="h-3.5 w-3.5" /> {copied ? 'Copiado!' : 'Copiar protocolo'}
        </button>
      </div>

      <p className="text-xs text-neutral-400">
        Guarde este número. Ele pode ser solicitado pela nossa equipe em contatos futuros.
      </p>

      <Link to="/">
        <Button variant="outline">
          <Home className="h-4 w-4" /> Voltar para o início
        </Button>
      </Link>
    </div>
  );
}
