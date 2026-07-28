import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Save, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRetentionSettings, getScoringSettings, saveRetentionSettings, saveScoringSettings } from '@/lib/settingsApi';
import { deleteCandidateData, listCandidates } from '@/lib/candidatesApi';
import { defaultScoringWeights, type ScoringWeights } from '@/types/admin';
import type { Candidate } from '@/types/candidate';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

const WEIGHT_LABELS: Record<keyof ScoringWeights, string> = {
  easyAccess: 'Fácil acesso ao local de trabalho',
  variedAvailability: 'Disponibilidade em diferentes horários',
  weekendAvailability: 'Disponibilidade aos fins de semana',
  areaExperience: 'Experiência na área escolhida',
  supermarketExperience: 'Experiência em supermercado',
  customerServiceExperience: 'Experiência com atendimento',
  canStartImmediately: 'Pode iniciar imediatamente',
  resumeAttached: 'Currículo anexado',
  wellFilledProfile: 'Respostas profissionais bem preenchidas',
};

export function Settings() {
  const { admin, user } = useAuth();
  const actorName = admin?.name ?? user?.email ?? 'administrador';

  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);
  const [retentionMonths, setRetentionMonths] = useState(24);
  const [loading, setLoading] = useState(true);
  const [savingScoring, setSavingScoring] = useState(false);
  const [savingRetention, setSavingRetention] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const [scoring, retention] = await Promise.all([getScoringSettings(), getRetentionSettings()]);
      setWeights(scoring.weights);
      setRetentionMonths(retention.talentPoolRetentionMonths);
      setLoading(false);
    })();
  }, []);

  const handleSaveScoring = async () => {
    setSavingScoring(true);
    try {
      await saveScoringSettings(weights, actorName);
      setSavedMessage('Pesos de pontuação atualizados com sucesso.');
    } finally {
      setSavingScoring(false);
      setTimeout(() => setSavedMessage(null), 4000);
    }
  };

  const handleSaveRetention = async () => {
    setSavingRetention(true);
    try {
      await saveRetentionSettings(retentionMonths, actorName);
      setSavedMessage('Prazo de retenção atualizado com sucesso.');
    } finally {
      setSavingRetention(false);
      setTimeout(() => setSavedMessage(null), 4000);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const all = await listCandidates();
      const term = searchTerm.trim().toLowerCase();
      setSearchResults(
        all.filter(
          (c) =>
            c.contact.email.toLowerCase().includes(term) ||
            c.contact.whatsapp.replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
            c.protocol.toLowerCase().includes(term) ||
            c.personal.fullName.toLowerCase().includes(term)
        )
      );
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async () => {
    if (!candidateToDelete) return;
    setDeleting(true);
    try {
      await deleteCandidateData(candidateToDelete.id);
      setSearchResults((prev) => prev.filter((c) => c.id !== candidateToDelete.id));
      setCandidateToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner label="Carregando configurações…" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Configurações</h1>
        <p className="text-sm text-neutral-500">Pontuação, retenção de dados e solicitações LGPD.</p>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-green-50 p-3 text-sm text-brand-green-800">
          <CheckCircle2 className="h-4 w-4" /> {savedMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-bold text-neutral-800">Pesos do sistema de pontuação</h2>
          <p className="mt-1 text-xs text-neutral-500">
            A pontuação é apenas um apoio à triagem — a decisão final deve sempre ser humana.
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(weights) as (keyof ScoringWeights)[]).map((key) => (
              <FormField key={key} label={WEIGHT_LABELS[key]} htmlFor={key}>
                <Input
                  id={key}
                  type="number"
                  min={0}
                  max={10}
                  value={weights[key]}
                  onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                />
              </FormField>
            ))}
          </div>
          <Button onClick={handleSaveScoring} loading={savingScoring} className="self-start">
            <Save className="h-4 w-4" /> Salvar pontuação
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-neutral-800">Retenção de dados (LGPD)</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Prazo, em meses, para manutenção dos dados de candidatos no banco de talentos.
          </p>
        </CardHeader>
        <CardBody className="flex flex-wrap items-end gap-4">
          <FormField label="Meses de retenção" htmlFor="retentionMonths">
            <Input
              id="retentionMonths"
              type="number"
              min={1}
              max={120}
              value={retentionMonths}
              onChange={(e) => setRetentionMonths(Number(e.target.value))}
              className="w-40"
            />
          </FormField>
          <Button onClick={handleSaveRetention} loading={savingRetention}>
            <Save className="h-4 w-4" /> Salvar prazo
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 font-bold text-neutral-800">
            <ShieldAlert className="h-4 w-4 text-brand-yellow-600" /> Exclusão de dados por solicitação (LGPD)
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Busque por nome, e-mail, telefone ou protocolo para localizar e excluir os dados de um
            candidato mediante solicitação.
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome, e-mail, telefone ou protocolo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} loading={searching}>
              <Search className="h-4 w-4" /> Buscar
            </Button>
          </div>

          {searchResults.length > 0 && (
            <ul className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-200">
              {searchResults.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{c.personal.fullName}</p>
                    <p className="text-xs text-neutral-500">
                      {c.contact.email} · {c.contact.whatsapp} · Protocolo {c.protocol}
                    </p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setCandidateToDelete(c)}>
                    <Trash2 className="h-3.5 w-3.5" /> Excluir dados
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {searchTerm && searchResults.length === 0 && !searching && (
            <p className="flex items-center gap-2 text-sm text-neutral-500">
              <AlertCircle className="h-4 w-4" /> Nenhum candidato encontrado para essa busca.
            </p>
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!candidateToDelete}
        onClose={() => !deleting && setCandidateToDelete(null)}
        title="Confirmar exclusão de dados"
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
          Esta ação é <strong>irreversível</strong> e removerá permanentemente todos os dados e o
          currículo de <strong>{candidateToDelete?.personal.fullName}</strong>, conforme solicitação
          do titular, em conformidade com a LGPD.
        </p>
      </Modal>
    </div>
  );
}
