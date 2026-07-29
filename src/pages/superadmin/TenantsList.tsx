import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, Plus, Search } from 'lucide-react';
import { createTenant, isValidSlug, listTenants, slugify } from '@/lib/tenantApi';
import { listPlans } from '@/lib/plansApi';
import type { Tenant } from '@/types/tenant';
import { SUBSCRIPTION_STATUS_LABELS } from '@/types/tenant';
import type { Plan } from '@/types/plan';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';

const emptyForm = { name: '', slug: '', email: '', planId: '' };

export function TenantsList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tenantList, planList] = await Promise.all([listTenants(), listPlans()]);
      setTenants(tenantList);
      setPlans(planList);
    } catch {
      setError('Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = tenants.filter(
    (t) =>
      !search.trim() ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setForm({ ...emptyForm, planId: plans[0]?.planId ?? '' });
    setFormError(null);
    setModalOpen(true);
  };

  const handleCreate = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.email.trim() || !form.planId) {
      setFormError('Preencha nome, e-mail e plano.');
      return;
    }
    if (!isValidSlug(form.slug)) {
      setFormError('Slug inválido. Use letras minúsculas, números e hífens (3 a 60 caracteres).');
      return;
    }
    setCreating(true);
    try {
      await createTenant(form);
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível criar o cliente.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Spinner label="Carregando clientes…" />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Clientes</h1>
          <p className="text-sm text-neutral-500">{tenants.length} clientes cadastrados na plataforma.</p>
        </div>
        <Button variant="accent" onClick={openModal}>
          <Plus className="h-4 w-4" /> Cadastrar cliente
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Buscar por nome ou slug"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Assinatura</th>
                <th className="px-4 py-3">Ativo</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((t) => (
                <tr key={t.tenantId} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-800">{t.name}</td>
                  <td className="px-4 py-3 text-neutral-600">/{t.slug}</td>
                  <td className="px-4 py-3 text-neutral-600">{t.planId}</td>
                  <td className="px-4 py-3 text-neutral-600">{SUBSCRIPTION_STATUS_LABELS[t.subscriptionStatus]}</td>
                  <td className="px-4 py-3 text-neutral-600">{t.active ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/superadmin/clientes/${t.tenantId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-neutral-400">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => !creating && setModalOpen(false)}
        title="Cadastrar novo cliente"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={creating}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} loading={creating}>
              Criar cliente
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Nome do cliente" htmlFor="tenantName" required>
            <Input
              id="tenantName"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))
              }
            />
          </FormField>
          <FormField label="Slug (URL pública)" htmlFor="tenantSlug" required hint="Ex.: /mercado-primavera">
            <Input
              id="tenantSlug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            />
          </FormField>
          <FormField label="E-mail de contato" htmlFor="tenantEmail" required>
            <Input
              id="tenantEmail"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </FormField>
          <FormField label="Plano" htmlFor="tenantPlan" required>
            <Select
              id="tenantPlan"
              value={form.planId}
              onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
            >
              <option value="">Selecione</option>
              {plans.map((p) => (
                <option key={p.planId} value={p.planId}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormField>
          {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
        </div>
      </Modal>
    </div>
  );
}
