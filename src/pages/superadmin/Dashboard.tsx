import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Building2, CheckCircle2, PauseCircle, Users, XCircle } from 'lucide-react';
import { listTenants } from '@/lib/tenantApi';
import { countCandidatesForTenant } from '@/lib/candidatesApi';
import type { Tenant } from '@/types/tenant';
import { SUBSCRIPTION_STATUS_LABELS } from '@/types/tenant';
import { Spinner } from '@/components/ui/Spinner';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardBody } from '@/components/ui/Card';

export function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [totalCandidates, setTotalCandidates] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await listTenants();
        setTenants(list);
        const counts = await Promise.all(list.map((t) => countCandidatesForTenant(t.tenantId)));
        setTotalCandidates(counts.reduce((sum, n) => sum + n, 0));
      } catch {
        setError('Não foi possível carregar os dados da plataforma.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner label="Carregando painel da plataforma…" />;
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>
    );
  }

  const active = tenants.filter((t) => t.active && (t.subscriptionStatus === 'active' || t.subscriptionStatus === 'trial'));
  const suspended = tenants.filter((t) => t.subscriptionStatus === 'suspended' || !t.active);
  const canceled = tenants.filter((t) => t.subscriptionStatus === 'canceled');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Painel da plataforma</h1>
        <p className="text-sm text-neutral-500">Visão geral de todos os clientes cadastrados.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Clientes cadastrados" value={tenants.length} icon={Building2} accent="blue" />
        <StatCard label="Clientes ativos" value={active.length} icon={CheckCircle2} accent="blue" />
        <StatCard label="Suspensos/inativos" value={suspended.length} icon={PauseCircle} accent="red" />
        <StatCard label="Cancelados" value={canceled.length} icon={XCircle} accent="neutral" />
        <StatCard
          label="Total de candidatos (todos os clientes)"
          value={totalCandidates ?? '—'}
          icon={Users}
          accent="yellow"
        />
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Assinatura</th>
                  <th className="px-4 py-3">Ativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {tenants.map((t) => (
                  <tr key={t.tenantId} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <Link to={`/superadmin/clientes/${t.tenantId}`} className="font-medium text-brand-blue-700 hover:underline">
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">/{t.slug}</td>
                    <td className="px-4 py-3 text-neutral-600">{t.planId}</td>
                    <td className="px-4 py-3 text-neutral-600">{SUBSCRIPTION_STATUS_LABELS[t.subscriptionStatus]}</td>
                    <td className="px-4 py-3 text-neutral-600">{t.active ? 'Sim' : 'Não'}</td>
                  </tr>
                ))}
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
        </CardBody>
      </Card>
    </div>
  );
}
