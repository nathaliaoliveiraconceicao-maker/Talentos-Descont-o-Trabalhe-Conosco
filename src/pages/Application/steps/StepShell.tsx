import type { ReactNode } from 'react';

interface StepShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function StepShell({ title, description, children }: StepShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-800 sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
