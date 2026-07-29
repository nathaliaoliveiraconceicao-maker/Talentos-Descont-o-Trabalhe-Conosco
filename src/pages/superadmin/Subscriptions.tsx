import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { listTenants, updateTenant } from '@/lib/tenantApi';
import type { SubscriptionStatus, Tenant } from '@/types/tenant';
import { SUBSCRIPTION_STATUS_LABELS } from '@/types/tenant';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

const STATUS_OPTIONS: SubscriptionStatus[] = ['trial', 'active', 'past_due', 'suspended', 'canceled'];

function daysUntil(dateIso?: string): number | null {
  if (!dateIso) return null;
  return Math.ceil((new Date(dateIso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function Subscriptions() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setTenants(await listTenants());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (tenantId: string, status: SubscriptionStatus) => {
    setUpdatingId(tenantId);
    try {
      await updateTenant(tenantId, { subscriptionStatus: status });
      setTenants((prev) => prev.map((t) => (t.tenantId === tenantId ? { ...t, subscriptionStatus: status } : t)));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Spinner label="Carregando assinaturas…" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Assinaturas</h1>
        <p className="text-sm text-neutral-500">
          Controle manual do status de assinatura de cada cliente. Clientes suspensos ou cancelados têm
          as ações administrativas bloqueadas no painel deles.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Alterar status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {tenants.map((t) => {
                const remaining = daysUntil(t.subscriptionEndsAt);
                const expiringSoon = remaining !== null && remaining <= 7 && remaining >= 0;
                const overdue = remaining !== null && remaining < 0;
                return (
                  <tr key={t.tenantId} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{t.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{t.planId}</td>
                    <td className="px-4 py-3">
                      <Badge>{SUBSCRIPTION_STATUS_LABELS[t.subscriptionStatus]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {t.subscriptionEndsAt ? new Date(t.subscriptionEndsAt).toLocaleDateString('pt-BR') : '—'}
                      {(expiringSoon || overdue) && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-red-600">
                          <AlertTriangle className="h-3 w-3" /> {overdue ? 'Vencido' : 'Vence em breve'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={t.subscriptionStatus}
                        disabled={updatingId === t.tenantId}
                        onChange={(e) => handleStatusChange(t.tenantId, e.target.value as SubscriptionStatus)}
                        className="w-44"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {SUBSCRIPTION_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                );
              })}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-neutral-400">
                    Nenhum cliente cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
