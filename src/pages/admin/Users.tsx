import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Mail, Plus, UserX2, UserCheck2, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { listTenantUsers } from '@/lib/adminApi';
import { cancelInvite, inviteTenantUser, resendInvite, toggleUserActive } from '@/lib/tenantUsersApi';
import type { AdminUser, TenantRole } from '@/types/admin';
import { INVITATION_STATUS_LABELS, MANAGE_ROLES, TENANT_ROLE_LABELS } from '@/types/admin';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';

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

export function Users() {
  const { admin, user, tenantId } = useAuth();
  const actorName = admin?.name ?? user?.email ?? 'administrador';
  const canManage = !!admin && MANAGE_ROLES.includes(admin.role);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'rh' as TenantRole });
  const [formError, setFormError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setUsers(await listTenantUsers(tenantId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const flash = (message: string, isError = false) => {
    setFeedback(isError ? null : message);
    setFeedbackError(isError ? message : null);
    setTimeout(() => {
      setFeedback(null);
      setFeedbackError(null);
    }, 6000);
  };

  const withBusy = async (uid: string, action: () => Promise<void>, successMessage: string) => {
    setBusyUid(uid);
    try {
      await action();
      flash(successMessage);
      await load();
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Não foi possível concluir a ação.', true);
    } finally {
      setBusyUid(null);
    }
  };

  const handleInvite = async () => {
    setFormError(null);
    if (!tenantId || !form.name.trim() || !form.email.trim()) {
      setFormError('Preencha nome e e-mail.');
      return;
    }
    setInviting(true);
    try {
      await inviteTenantUser({ tenantId, name: form.name.trim(), email: form.email, role: form.role, invitedBy: actorName });
      setModalOpen(false);
      setForm({ name: '', email: '', role: 'rh' });
      flash(
        `Convite enviado para ${form.email.trim().toLowerCase()}. O usuário deverá acessar o e-mail recebido e criar a própria senha antes de entrar na plataforma.`
      );
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível enviar o convite.');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = async (email: string) => {
    const link = `${window.location.origin}/app/login`;
    try {
      await navigator.clipboard.writeText(link);
      flash(`Link do portal de acesso copiado (${email}).`);
    } catch {
      flash(link, false);
    }
  };

  if (loading) return <Spinner label="Carregando usuários…" />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Usuários</h1>
          <p className="text-sm text-neutral-500">{users.length} usuário(s) vinculado(s) a esta empresa.</p>
        </div>
        {canManage && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Convidar usuário
          </Button>
        )}
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-green-50 p-3 text-sm text-brand-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {feedback}
        </div>
      )}
      {feedbackError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {feedbackError}
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Convite</th>
                <th className="px-4 py-3">Enviado em</th>
                <th className="px-4 py-3">Último acesso</th>
                <th className="px-4 py-3">Ativo</th>
                {canManage && <th className="px-4 py-3 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => {
                const status = u.invitationStatus ?? 'accepted';
                const busy = busyUid === u.uid;
                return (
                  <tr key={u.uid} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-800">{u.name}</p>
                      <p className="text-xs text-neutral-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{TENANT_ROLE_LABELS[u.role] ?? u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${INVITATION_BADGE_CLASS[status]}`}>
                        {INVITATION_STATUS_LABELS[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">{formatDate(u.invitationSentAt)}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">{formatDate(u.lastLoginAt)}</td>
                    <td className="px-4 py-3 text-neutral-600">{u.active ? 'Sim' : 'Não'}</td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => handleCopyLink(u.email)}
                            title="Copiar link do portal de acesso"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          {status !== 'canceled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() =>
                                withBusy(
                                  u.uid,
                                  () => resendInvite(tenantId!, u.uid, actorName),
                                  status === 'pending'
                                    ? `Convite reenviado para ${u.email}.`
                                    : `Link de redefinição de senha reenviado para ${u.email}.`
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
                              onClick={() =>
                                withBusy(u.uid, () => cancelInvite(tenantId!, u.uid, actorName), `Convite de ${u.email} cancelado.`)
                              }
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
                              withBusy(
                                u.uid,
                                () => toggleUserActive(tenantId!, u.uid, !u.active, actorName),
                                u.active ? `${u.email} desativado.` : `${u.email} reativado.`
                              )
                            }
                            title={u.active ? 'Desativar usuário' : 'Reativar usuário'}
                          >
                            {u.active ? <UserX2 className="h-3.5 w-3.5" /> : <UserCheck2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-4 py-10 text-center text-neutral-400">
                    Nenhum usuário cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => !inviting && setModalOpen(false)}
        title="Convidar usuário"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={inviting}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} loading={inviting}>
              Enviar convite
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-neutral-500">
            A pessoa convidada recebe um e-mail para criar a própria senha — ninguém deste painel define ou vê a senha
            dela.
          </p>
          <FormField label="Nome" htmlFor="inviteName" required>
            <Input id="inviteName" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="E-mail" htmlFor="inviteEmail" required>
            <Input
              id="inviteEmail"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </FormField>
          <FormField label="Papel" htmlFor="inviteRole" required>
            <Select id="inviteRole" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as TenantRole }))}>
              {(Object.keys(TENANT_ROLE_LABELS) as TenantRole[]).map((role) => (
                <option key={role} value={role}>
                  {TENANT_ROLE_LABELS[role]}
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
