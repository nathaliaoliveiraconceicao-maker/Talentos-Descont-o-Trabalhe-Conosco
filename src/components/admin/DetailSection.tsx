import type { ReactNode } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-bold text-neutral-800">{title}</h2>
      </CardHeader>
      <CardBody className="grid gap-4 sm:grid-cols-2">{children}</CardBody>
    </Card>
  );
}

export function InfoField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-0.5 text-sm text-neutral-800">{value || <span className="text-neutral-300">—</span>}</p>
    </div>
  );
}

export function InfoFieldFull({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="sm:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-sm text-neutral-800">
        {value || <span className="text-neutral-300">—</span>}
      </p>
    </div>
  );
}
