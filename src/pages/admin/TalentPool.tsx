import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Eye, Inbox, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCandidates } from '@/hooks/useCandidates';
import { deleteCandidateData, updateCandidateStatus } from '@/lib/candidatesApi';
import { getRetentionSettings } from '@/lib/settingsApi';
import { jobAreaLabel } from '@/data/jobAreas';
import type { Candidate } from '@/types/candidate';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

function daysSince(dateIso: string): number {
  return Math.floor((Date.now() - new Date(dateIso).getTime()) / (24 * 60 * 60 * 1000));
}

export function TalentPool() {
  const { admin, user } = useAuth();
  const { candidates, loading, error, reload } = useCandidates();
  const [search, setSearch] = useState('');
  const [retentionMonths, setRetentionMonths] = useState(24);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const actorName = admin?.name ?? user?.email ?? 'administrador';

  useEffect(() => {
    getRetentionSettings().then((s) => setRetentionMonths(s.talentPoolRetentionMonths));
  }, []);

  const pool = useMemo(
    () => candidates.filter((c) => c.status === 'banco_talentos'),
    [candidates]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pool;
    return pool.filter(
      (c) =>
        c.personal.fullName.toLowerCase().includes(term) ||
        c.personal.neighborhood.toLowerCase().includes(term) ||
        jobAreaLabel(c.interest.mainAreaOfInterest).toLowerCase().includes(term)
    );
  }, [pool, search]);

  const retentionDays = retentionMonths * 30;

  const handleReactivate = async (candidate: Candidate) => {
    setReactivatingId(candidate.id);
    try {
      await updateCandidateStatus(candidate.id, 'em_analise', actorName, {
        note: 'Reativado do banco de talentos para um novo processo seletivo.',
        changedByUid: user?.uid,
        previousStatus: candidate.status,
      });
      await reload();
    } finally {
      setReactivatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!candidateToDelete) return;
    setDeleting(true);
    try {
      await deleteCandidateData(candidateToDelete.id);
      setCandidateToDelete(null);
      await reload();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner label="Carregando banco de talentos…" />;
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Banco de talentos</h1>
        <p className="text-sm text-neutral-500">
          {pool.length} candidatos guardados para futuros processos seletivos. Prazo de retenção
          configurado: {retentionMonths} meses.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Buscar por nome, bairro ou área"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {pool.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="rounded-full bg-neutral-100 p-4 text-neutral-400">
              <Inbox className="h-8 w-8" />
            </span>
            <h2 className="text-lg font-bold text-neutral-700">Banco de talentos vazio</h2>
            <p className="max-w-sm text-sm text-neutral-500">
              Candidatos marcados com o status "Banco de talentos" aparecerão aqui.
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Bairro</th>
                  <th className="px-4 py-3">Área</th>
                  <th className="px-4 py-3">Armazenado há</th>
                  <th className="px-4 py-3">Prazo de retenção</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((c) => {
                  const stored = daysSince(c.updatedAt);
                  const remaining = retentionDays - stored;
                  const nearDeadline = remaining <= 30;
                  return (
                    <tr key={c.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-800">{c.personal.fullName}</td>
                      <td className="px-4 py-3 text-neutral-600">{c.personal.neighborhood}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {jobAreaLabel(c.interest.mainAreaOfInterest)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{stored} dias</td>
                      <td className="px-4 py-3">
                        {nearDeadline ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-red-100 px-2.5 py-1 text-xs font-semibold text-brand-red-700">
                            <AlertTriangle className="h-3 w-3" />
                            {remaining <= 0 ? 'Prazo vencido' : `${remaining} dias restantes`}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">{remaining} dias restantes</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/candidatos/${c.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                          >
                            <Eye className="h-3.5 w-3.5" /> Ver
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReactivate(c)}
                            loading={reactivatingId === c.id}
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Reativar
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setCandidateToDelete(c)}>
                            <Trash2 className="h-3.5 w-3.5" /> Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-neutral-400">
                      Nenhum candidato encontrado nessa busca.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={!!candidateToDelete}
        onClose={() => !deleting && setCandidateToDelete(null)}
        title="Excluir dados do candidato"
        footer={
          <>
            <Button variant="outline" onClick={() => setCandidateToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Excluir permanentemente
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Esta ação é <strong>irreversível</strong> e removerá permanentemente os dados e o currículo
          de <strong>{candidateToDelete?.personal.fullName}</strong>, conforme a política de retenção
          do banco de talentos.
        </p>
      </Modal>
    </div>
  );
}
