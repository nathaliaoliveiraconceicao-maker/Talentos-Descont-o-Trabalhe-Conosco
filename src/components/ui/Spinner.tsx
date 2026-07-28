import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-neutral-500">
      <Loader2 className="h-8 w-8 animate-spin text-brand-green-600" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
