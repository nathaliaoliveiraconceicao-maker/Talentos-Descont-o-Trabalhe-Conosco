import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: 'green' | 'yellow' | 'neutral';
  hint?: string;
}

const accentClasses = {
  green: 'bg-brand-green-100 text-brand-green-700',
  yellow: 'bg-brand-yellow-100 text-brand-yellow-800',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function StatCard({ label, value, icon: Icon, accent = 'green', hint }: StatCardProps) {
  return (
    <div className="rounded-xl2 border border-neutral-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <span className={`rounded-lg p-2 ${accentClasses[accent]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-neutral-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
