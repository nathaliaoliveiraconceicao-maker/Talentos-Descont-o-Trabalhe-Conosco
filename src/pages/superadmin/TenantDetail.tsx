import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Mail,
  Save,
  UserCheck2,
  UserPlus,
  UserX2,
  Users,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logAuditEvent } from '@/lib/auditLog';
import { getTenant, updateTenant } from '@/lib/tenantApi';
import { listPlans } from '@/lib/plansApi';
import { listTenantUsers } from '@/lib/adminApi';
import { cancelInvite, inviteTenantUser, resendInvite, toggleUserActive } from '@/lib/tenantUsersApi';
import { countCandidatesForTenant } from '@/lib/candidatesApi';
import type { Tenant, SubscriptionStatus } from '@/types/tenant';
import { SUBSCRIPTION_STATUS_LABELS } from '@/types/tenant';
import type { Plan } from '@/types/plan';
import type { AdminUser, TenantRole } from '@/types/admin';
import { INVITATION_STATUS_LABELS, TENANT_ROLE_LABELS } from '@/types/admin';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { StatCard } from '@/components/ui/StatCard';

const INVITATION_BADGE_CLASS: Record<string, string> = {
  pending: 'bg-brand-yellow-100 text-brand-yellow-800',
  accepted: 'bg-brand-green-100 text-brand-green-800',
  expired: 'bg-neutral-200 text-neutral-600',
  canceled: 'bg-red-100 text-red-700',
};

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

const SUBSCRIPTION_OPTIONS: SubscriptionStatus[] = ['trial', 'active', 'past_due', 'suspended', 'canceled'];

export function TenantDetail() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { user, platformAdmin } = useAuth();
  const actorName = platformAdmin?.name ?? user?.email ?? 'superadmin';
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [candidateCount, setCandidateCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'owner' as TenantRole });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [userFormSuccess, setUserFormSuccess] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const load = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const [tenantData, planList, userList, count] = await Promise.all([
        getTenant(tenantId),
        listPlans(),
        listTenantUsers(tenantId),
        countCandidatesForTenant(tenantId),
      ]);
      if (!tenantData) {
        setError('Cliente não encontrado.');
        return;
      }
      setTenant(tenantData);
      setPlans(planList);
      setUsers(userList);
      setCandidateCount(count);
    } catch {
      setError('Não foi possível carregar os dados deste cliente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  if (loading) return <Spinner label="Carregando cliente…" />;
  if (error || !tenant || !tenantId) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
        <Link to="/superadmin/clientes" className="text-sm font-medium text-brand-blue-700 hover:underline">
          Voltar para clientes
        </Link>
      </div>
    );
  }

  const set = <K extends keyof Tenant>(key: K, value: Tenant[K]) => {
    setTenant({ ...tenant, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTenant(tenantId, {
        name: tenant.name,
        legalName: tenant.legalName,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        city: tenant.city,
        state: tenant.state,
        planId: tenant.planId,
        subscriptionStatus: tenant.subscriptionStatus,
        subscriptionEndsAt: tenant.subscriptionEndsAt,
        active: tenant.active,
      });
      await logAuditEvent({
        tenantId,
        actorUid: user?.uid ?? '',
        actorName,
        action: 'tenant_updated_by_superadmin',
        details: { subscriptionStatus: tenant.subscriptionStatus, active: tenant.active, planId: tenant.planId },
      });
      setSavedMessage('Cliente atualizado com sucesso.');
      setTimeout(() => setSavedMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleInviteUser = async () => {
    setUserFormError(null);
    setUserFormSuccess(null);
    if (!userForm.name.trim() || !userForm.email.trim()) {
      setUserFormError('Preencha nome e e-mail.');
      return;
    }
    setCreatingUser(true);
    try {
      const { uid, reused } = await inviteTenantUser({ tenantId, ...userForm, invitedBy: actorName });
      await logAuditEvent({
        tenantId,
        actorUid: user?.uid ?? '',
        actorName,
        action: reused ? 'invite_resent_by_superadmin' : 'tenant_user_invited_by_superadmin',
        targetType: 'user',
        targetId: uid,
        details: { email: userForm.email, role: userForm.role },
      });
      setUserFormSuccess(
        `Convite enviado para ${userForm.email.trim().toLowerCase()}. O usuário deverá acessar o e-mail recebido e criar a própria senha antes de entrar na plataforma.`
      );
      setUserForm({ name: '', email: '', role: 'owner' });
      const updatedUsers = await listTenantUsers(tenantId);
      setUsers(updatedUsers);
    } catch (err) {
      setUserFormError(err instanceof Error ? err.message : 'Não foi possível enviar o convite.');
    } finally {
      setCreatingUser(false);
    }
  };

  const withBusyUser = async (uid: string, action: () => Promise<void>, successMessage: string) => {
    setBusyUid(uid);
    setUserFormError(null);
    setUserFormSuccess(null);
    try {
      await action();
      setUserFormSuccess(successMessage);
      const updatedUsers = await listTenantUsers(tenantId);
      setUsers(updatedUsers);
    } catch (err) {
      setUserFormError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleCopyLink = async (email: string) => {
    const link = `${window.location.origin}/app/login`;
    try {
      await navigator.clipboard.writeText(link);
      setUserFormSuccess(`Link do portal de acesso copiado (${email}).`);
    } catch {
      setUserFormSuccess(link);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link to="/superadmin/clientes" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-brand-blue-700">
        <ArrowLeft className="h-4 w-4" /> Voltar para clientes
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-neutral-800">{tenant.name}</h1>
        <p className="text-sm text-neutral-500">/{tenant.slug} · tenantId: {tenant.tenantId}</p>
      </div>

      {(tenant.subscriptionStatus === 'suspended' || tenant.subscriptionStatus === 'canceled' || !tenant.active) && (
        <div className="flex items-start gap-2 rounded-xl2 border border-brand-red-300 bg-brand-red-50 p-4 text-sm text-brand-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Este cliente está com o acesso bloqueado ({SUBSCRIPTION_STATUS_LABELS[tenant.subscriptionStatus]}
            {!tenant.active && ', inativo'}). A equipe de RH deste cliente não consegue realizar ações
            administrativas até que a assinatura seja reativada.
          </p>
        </div>
      )}

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-green-50 p-3 text-sm text-brand-green-800">
          <CheckCircle2 className="h-4 w-4" /> {savedMessage}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Usuários" value={users.length} icon={Users} accent="blue" />
        <StatCard label="Candidatos" value={candidateCount ?? '—'} icon={Users} accent="yellow" />
        <StatCard
          label="Assinatura desde"
          value={new Date(tenant.subscriptionStartedAt).toLocaleDateString('pt-BR')}
          icon={Users}
          accent="neutral"
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-neutral-800">Dados do cliente</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nome público" htmlFor="name">
              <Input id="name" value={tenant.name} onChange={(e) => set('name', e.target.value)} />
            </FormField>
            <FormField label="Razão social" htmlFor="legalName">
              <Input id="legalName" value={tenant.legalName ?? ''} onChange={(e) => set('legalName', e.target.value)} />
            </FormField>
            <FormField label="E-mail" htmlFor="email">
              <Input id="email" type="email" value={tenant.email} onChange={(e) => set('email', e.target.value)} />
            </FormField>
            <FormField label="Telefone" htmlFor="phone">
              <Input id="phone" value={tenant.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            </FormField>
            <FormField label="Endereço" htmlFor="address">
              <Input id="address" value={tenant.address ?? ''} onChange={(e) => set('address', e.target.value)} />
            </FormField>
            <FormField label="Cidade" htmlFor="city">
              <Input id="city" value={tenant.city ?? ''} onChange={(e) => set('city', e.target.value)} />
            </FormField>
            <FormField label="Estado (UF)" htmlFor="state">
              <Input id="state" value={tenant.state ?? ''} onChange={(e) => set('state', e.target.value)} maxLength={2} />
            </FormField>
          </div>
          <Button onClick={handleSave} loading={saving} className="self-start">
            <Save className="h-4 w-4" /> Salvar dados
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-neutral-800">Plano e assinatura</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Plano" htmlFor="planId">
              <Select id="planId" value={tenant.planId} onChange={(e) => set('planId', e.target.value)}>
                {plans.map((p) => (
                  <option key={p.planId} value={p.planId}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status da assinatura" htmlFor="subscriptionStatus">
              <Select
                id="subscriptionStatus"
                value={tenant.subscriptionStatus}
                onChange={(e) => set('subscriptionStatus', e.target.value as SubscriptionStatus)}
              >
                {SUBSCRIPTION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {SUBSCRIPTION_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Vencimento" htmlFor="subscriptionEndsAt">
              <Input
                id="subscriptionEndsAt"
                type="date"
                value={tenant.subscriptionEndsAt?.slice(0, 10) ?? ''}
                onChange={(e) => set('subscriptionEndsAt', e.target.value)}
              />
            </FormField>
            <FormField label="Cliente ativo" htmlFor="active">
              <Select
                id="active"
                value={tenant.active ? 'true' : 'false'}
                onChange={(e) => set('active', e.target.value === 'true')}
              >
                <option value="true">Ativo</option>
                <option value="false">Suspenso / bloqueado</option>
              </Select>
            </FormField>
          </div>
          <Button onClick={handleSave} loading={saving} className="self-start">
            <Save className="h-4 w-4" /> Salvar plano e assinatura
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-neutral-800">Usuários deste cliente</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-200">
            {users.map((u) => {
              const status = u.invitationStatus ?? 'accepted';
              const busy = busyUid === u.uid;
              return (
                <li key={u.uid} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{u.name}</p>
                    <p className="text-xs text-neutral-500">{u.email}</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Enviado em {formatDate(u.invitationSentAt)} · Aceito em{' '}
                      {status === 'accepted' ? formatDate(u.passwordConfiguredAt) : '—'} · Último acesso{' '}
                      {formatDate(u.lastLoginAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${INVITATION_BADGE_CLASS[status]}`}>
                      {INVITATION_STATUS_LABELS[status]}
                    </span>
                    <span className="rounded-full bg-brand-blue-100 px-2.5 py-0.5 text-xs font-semibold text-brand-blue-800">
                      {TENANT_ROLE_LABELS[u.role] ?? u.role}
                    </span>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => handleCopyLink(u.email)} title="Copiar link do portal de acesso">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {status !== 'canceled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          withBusyUser(
                            u.uid,
                            () => resendInvite(tenantId, u.uid, actorName),
                            status === 'pending' ? `Convite reenviado para ${u.email}.` : `Link de redefinição enviado para ${u.email}.`
                          )
                        }
                        title={status === 'pending' ? 'Reenviar convite' : 'Enviar link de redefinição de senha'}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => withBusyUser(u.uid, () => cancelInvite(tenantId, u.uid, actorName), `Convite de ${u.email} cancelado.`)}
                        title="Cancelar convite"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={u.active ? 'danger' : 'outline'}
                      disabled={busy}
                      onClick={() =>
                        withBusyUser(
                          u.uid,
                          () => toggleUserActive(tenantId, u.uid, !u.active, actorName),
                          u.active ? `${u.email} desativado.` : `${u.email} reativado.`
                        )
                      }
                      title={u.active ? 'Desativar usuário' : 'Reativar usuário'}
                    >
                      {u.active ? <UserX2 className="h-3.5 w-3.5" /> : <UserCheck2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </li>
              );
            })}
            {users.length === 0 && (
              <li className="p-4 text-center text-sm text-neutral-400">Nenhum usuário convidado ainda.</li>
            )}
          </ul>

          <div className="rounded-lg border border-dashed border-neutral-300 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-800">
              <UserPlus className="h-4 w-4" /> Convidar usuário
            </h3>
            <p className="mb-3 text-xs text-neutral-500">
              A pessoa convidada recebe um e-mail para criar a própria senha — o superadmin nunca define ou vê essa
              senha.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Nome"
                value={userForm.name}
                onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input
                placeholder="E-mail"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
              />
              <Select
                value={userForm.role}
                onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value as TenantRole }))}
              >
                {(Object.keys(TENANT_ROLE_LABELS) as TenantRole[]).map((role) => (
                  <option key={role} value={role}>
                    {TENANT_ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
            </div>
            {userFormError && <p className="mt-2 text-sm font-medium text-red-600">{userFormError}</p>}
            {userFormSuccess && <p className="mt-2 text-sm font-medium text-brand-green-700">{userFormSuccess}</p>}
            <Button onClick={handleInviteUser} loading={creatingUser} className="mt-3">
              <UserPlus className="h-4 w-4" /> Enviar convite
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
