import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  HeartHandshake,
  Palette,
  Plus,
  Save,
  Search,
  Settings2,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logAuditEvent } from '@/lib/auditLog';
import { getScoringSettings, saveScoringSettings } from '@/lib/settingsApi';
import {
  deleteTenantJobArea,
  getTenant,
  getTenantJobAreas,
  getTenantSettings,
  saveTenantJobArea,
  saveTenantSettings,
  updateTenant,
} from '@/lib/tenantApi';
import { getBehavioralScreeningSettings, saveBehavioralScreeningSettings } from '@/lib/behavioralScreeningApi';
import { deleteCandidateData, listCandidates } from '@/lib/candidatesApi';
import { defaultScoringWeights, type ScoringWeights } from '@/types/admin';
import type { Candidate } from '@/types/candidate';
import type { Tenant, TenantJobArea, TenantSettings } from '@/types/tenant';
import { defaultTenantSettings } from '@/types/tenant';
import {
  BEHAVIORAL_QUESTION_KEYS,
  BEHAVIORAL_QUESTION_LABELS,
  PLATFORM_DEFAULT_BEHAVIORAL_SCREENING,
  type BehavioralQuestionSetting,
  type BehavioralScreeningSettings,
} from '@/types/behavioralProfile';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

type BehavioralQuestionMode = 'disabled' | 'optional' | 'required';

function modeOfQuestion(setting: BehavioralQuestionSetting): BehavioralQuestionMode {
  if (!setting.enabled) return 'disabled';
  return setting.required ? 'required' : 'optional';
}

function questionFromMode(mode: BehavioralQuestionMode): BehavioralQuestionSetting {
  if (mode === 'disabled') return { enabled: false, required: false };
  if (mode === 'required') return { enabled: true, required: true };
  return { enabled: true, required: false };
}

type BehavioralDraft = Omit<BehavioralScreeningSettings, 'updatedAt' | 'updatedBy'>;

/** Grade de perguntas reutilizada tanto na configuração geral quanto na customização por vaga. */
function BehavioralQuestionsGrid({
  draft,
  onChange,
}: {
  draft: BehavioralDraft;
  onChange: (next: BehavioralDraft) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {BEHAVIORAL_QUESTION_KEYS.map((key) => (
        <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3">
          <span className="text-sm font-medium text-neutral-700">{BEHAVIORAL_QUESTION_LABELS[key]}</span>
          <Select
            className="w-40"
            value={modeOfQuestion(draft[key])}
            onChange={(e) =>
              onChange({ ...draft, [key]: questionFromMode(e.target.value as BehavioralQuestionMode) })
            }
          >
            <option value="disabled">Desativada</option>
            <option value="optional">Opcional</option>
            <option value="required">Obrigatória</option>
          </Select>
        </div>
      ))}
    </div>
  );
}

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
  const { admin, user, tenantId } = useAuth();
  const actorName = admin?.name ?? user?.email ?? 'administrador';

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [brandForm, setBrandForm] = useState({ name: '', logoUrl: '', primaryColor: '', secondaryColor: '' });
  const [savingBrand, setSavingBrand] = useState(false);

  const [tenantSettings, setTenantSettings] = useState<Omit<TenantSettings, 'updatedAt' | 'updatedBy'>>(
    defaultTenantSettings
  );
  const [savingContent, setSavingContent] = useState(false);

  const [jobs, setJobs] = useState<TenantJobArea[]>([]);
  const [newJobLabel, setNewJobLabel] = useState('');
  const [savingJobs, setSavingJobs] = useState(false);

  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);
  const [savingScoring, setSavingScoring] = useState(false);

  const [behavioralSettings, setBehavioralSettings] = useState<BehavioralDraft>(PLATFORM_DEFAULT_BEHAVIORAL_SCREENING);
  const [savingBehavioral, setSavingBehavioral] = useState(false);

  const [jobBehavioralTarget, setJobBehavioralTarget] = useState<TenantJobArea | null>(null);
  const [jobBehavioralDraft, setJobBehavioralDraft] = useState<BehavioralDraft | null>(null);
  const [savingJobBehavioral, setSavingJobBehavioral] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      const [tenantData, scoring, settings, jobsData, behavioral] = await Promise.all([
        getTenant(tenantId),
        getScoringSettings(tenantId),
        getTenantSettings(tenantId),
        getTenantJobAreas(tenantId),
        getBehavioralScreeningSettings(tenantId),
      ]);
      if (tenantData) {
        setTenant(tenantData);
        setBrandForm({
          name: tenantData.name,
          logoUrl: tenantData.logoUrl ?? '',
          primaryColor: tenantData.primaryColor,
          secondaryColor: tenantData.secondaryColor,
        });
      }
      setWeights(scoring.weights);
      setTenantSettings(settings);
      setJobs(jobsData);
      setBehavioralSettings(behavioral);
      setLoading(false);
    })();
  }, [tenantId]);

  const flashSaved = (message: string) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handleSaveBrand = async () => {
    if (!tenantId) return;
    setSavingBrand(true);
    try {
      await updateTenant(tenantId, brandForm);
      await logAuditEvent({ tenantId, actorUid: user?.uid ?? '', actorName, action: 'brand_updated' });
      flashSaved('Identidade visual atualizada com sucesso.');
    } finally {
      setSavingBrand(false);
    }
  };

  const handleSaveContent = async () => {
    if (!tenantId) return;
    setSavingContent(true);
    try {
      await saveTenantSettings(tenantId, tenantSettings, actorName);
      await logAuditEvent({ tenantId, actorUid: user?.uid ?? '', actorName, action: 'portal_settings_updated' });
      flashSaved('Configurações do portal atualizadas com sucesso.');
    } finally {
      setSavingContent(false);
    }
  };

  const handleAddJob = async () => {
    if (!tenantId || !newJobLabel.trim()) return;
    setSavingJobs(true);
    try {
      const id = newJobLabel
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      const area: TenantJobArea = { id: id || `area_${Date.now()}`, label: newJobLabel.trim(), active: true };
      await saveTenantJobArea(tenantId, area);
      setJobs((prev) => [...prev, area]);
      setNewJobLabel('');
    } finally {
      setSavingJobs(false);
    }
  };

  const handleToggleJob = async (area: TenantJobArea) => {
    if (!tenantId) return;
    const updated = { ...area, active: !area.active };
    await saveTenantJobArea(tenantId, updated);
    setJobs((prev) => prev.map((j) => (j.id === area.id ? updated : j)));
  };

  const handleDeleteJob = async (areaId: string) => {
    if (!tenantId) return;
    await deleteTenantJobArea(tenantId, areaId);
    setJobs((prev) => prev.filter((j) => j.id !== areaId));
  };

  const handleSaveBehavioral = async () => {
    if (!tenantId) return;
    setSavingBehavioral(true);
    try {
      await saveBehavioralScreeningSettings(tenantId, behavioralSettings, actorName);
      await logAuditEvent({ tenantId, actorUid: user?.uid ?? '', actorName, action: 'behavioral_screening_settings_updated' });
      flashSaved('Configuração de triagem comportamental atualizada com sucesso.');
    } finally {
      setSavingBehavioral(false);
    }
  };

  const openJobBehavioralModal = (area: TenantJobArea) => {
    setJobBehavioralTarget(area);
    setJobBehavioralDraft(area.behavioralScreeningSettings ? { ...area.behavioralScreeningSettings } : { ...behavioralSettings });
  };

  const handleUseGeneralForJob = async () => {
    if (!tenantId || !jobBehavioralTarget) return;
    setSavingJobBehavioral(true);
    try {
      const updated: TenantJobArea = { ...jobBehavioralTarget, behavioralScreeningSettings: null };
      await saveTenantJobArea(tenantId, updated);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      setJobBehavioralTarget(null);
    } finally {
      setSavingJobBehavioral(false);
    }
  };

  const handleSaveJobBehavioral = async () => {
    if (!tenantId || !jobBehavioralTarget || !jobBehavioralDraft) return;
    setSavingJobBehavioral(true);
    try {
      const payload = { ...jobBehavioralDraft, updatedAt: new Date().toISOString(), updatedBy: actorName };
      const updated: TenantJobArea = { ...jobBehavioralTarget, behavioralScreeningSettings: payload };
      await saveTenantJobArea(tenantId, updated);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      setJobBehavioralTarget(null);
    } finally {
      setSavingJobBehavioral(false);
    }
  };

  const handleSaveScoring = async () => {
    if (!tenantId) return;
    setSavingScoring(true);
    try {
      await saveScoringSettings(tenantId, weights, actorName);
      await logAuditEvent({ tenantId, actorUid: user?.uid ?? '', actorName, action: 'scoring_weights_updated' });
      flashSaved('Pesos de pontuação atualizados com sucesso.');
    } finally {
      setSavingScoring(false);
    }
  };

  const handleSearch = async () => {
    if (!tenantId || !searchTerm.trim()) return;
    setSearching(true);
    try {
      const all = await listCandidates(tenantId);
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
    if (!candidateToDelete || !tenantId) return;
    setDeleting(true);
    try {
      await logAuditEvent({
        tenantId,
        actorUid: user?.uid ?? '',
        actorName,
        action: 'candidate_deleted',
        targetType: 'candidate',
        targetId: candidateToDelete.id,
        details: { name: candidateToDelete.personal.fullName, protocol: candidateToDelete.protocol, reason: 'lgpd_request' },
      });
      await deleteCandidateData(tenantId, candidateToDelete.id);
      setSearchResults((prev) => prev.filter((c) => c.id !== candidateToDelete.id));
      setCandidateToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !tenant) return <Spinner label="Carregando configurações…" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Configurações</h1>
        <p className="text-sm text-neutral-500">
          Identidade visual, textos do portal, áreas de interesse, pontuação e privacidade.
        </p>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-green-50 p-3 text-sm text-brand-green-800">
          <CheckCircle2 className="h-4 w-4" /> {savedMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 font-bold text-neutral-800">
            <Palette className="h-4 w-4" /> Identidade visual
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Nome público, logotipo e cores usadas no seu portal de candidaturas.
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nome público" htmlFor="brandName">
              <Input
                id="brandName"
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
              />
            </FormField>
            <FormField label="URL do logotipo" htmlFor="brandLogo" hint="PNG ou SVG com fundo transparente.">
              <Input
                id="brandLogo"
                value={brandForm.logoUrl}
                onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                placeholder="https://…"
              />
            </FormField>
            <FormField label="Cor primária" htmlFor="primaryColor">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandForm.primaryColor}
                  onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                  className="h-10 w-14 rounded border border-neutral-300"
                />
                <Input
                  id="primaryColor"
                  value={brandForm.primaryColor}
                  onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                />
              </div>
            </FormField>
            <FormField label="Cor secundária" htmlFor="secondaryColor">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandForm.secondaryColor}
                  onChange={(e) => setBrandForm({ ...brandForm, secondaryColor: e.target.value })}
                  className="h-10 w-14 rounded border border-neutral-300"
                />
                <Input
                  id="secondaryColor"
                  value={brandForm.secondaryColor}
                  onChange={(e) => setBrandForm({ ...brandForm, secondaryColor: e.target.value })}
                />
              </div>
            </FormField>
          </div>
          <Button onClick={handleSaveBrand} loading={savingBrand} className="self-start">
            <Save className="h-4 w-4" /> Salvar identidade visual
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-neutral-800">Textos do portal</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Mensagem inicial, política de privacidade, retenção de dados e mensagens de WhatsApp.
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <FormField label="Título de destaque (hero)" htmlFor="heroTitle">
            <Input
              id="heroTitle"
              value={tenantSettings.heroTitle}
              onChange={(e) => setTenantSettings({ ...tenantSettings, heroTitle: e.target.value })}
            />
          </FormField>
          <FormField label="Subtítulo de destaque" htmlFor="heroSubtitle">
            <Textarea
              id="heroSubtitle"
              rows={2}
              value={tenantSettings.heroSubtitle}
              onChange={(e) => setTenantSettings({ ...tenantSettings, heroSubtitle: e.target.value })}
            />
          </FormField>
          <FormField label="Aviso inicial (ex.: sobre não garantir contratação)" htmlFor="initialMessage">
            <Textarea
              id="initialMessage"
              rows={2}
              value={tenantSettings.initialMessage}
              onChange={(e) => setTenantSettings({ ...tenantSettings, initialMessage: e.target.value })}
            />
          </FormField>
          <FormField label="Texto da política de privacidade" htmlFor="privacyPolicyText">
            <Textarea
              id="privacyPolicyText"
              rows={4}
              value={tenantSettings.privacyPolicyText}
              onChange={(e) => setTenantSettings({ ...tenantSettings, privacyPolicyText: e.target.value })}
            />
          </FormField>
          <FormField label="Prazo de retenção do banco de talentos (meses)" htmlFor="retentionMonths">
            <Input
              id="retentionMonths"
              type="number"
              min={1}
              max={120}
              className="w-40"
              value={tenantSettings.talentPoolRetentionMonths}
              onChange={(e) =>
                setTenantSettings({ ...tenantSettings, talentPoolRetentionMonths: Number(e.target.value) })
              }
            />
          </FormField>
          <FormField
            label="Mensagem padrão de WhatsApp"
            htmlFor="whatsappGenericMessage"
            hint="Use {{nome}} e {{empresa}} — serão substituídos automaticamente."
          >
            <Textarea
              id="whatsappGenericMessage"
              rows={3}
              value={tenantSettings.whatsappGenericMessage}
              onChange={(e) => setTenantSettings({ ...tenantSettings, whatsappGenericMessage: e.target.value })}
            />
          </FormField>
          <FormField
            label="Mensagem de convite para entrevista"
            htmlFor="whatsappInterviewMessage"
            hint="Use {{nome}}, {{empresa}}, {{data}}, {{horario}} e {{local}}."
          >
            <Textarea
              id="whatsappInterviewMessage"
              rows={3}
              value={tenantSettings.whatsappInterviewMessage}
              onChange={(e) => setTenantSettings({ ...tenantSettings, whatsappInterviewMessage: e.target.value })}
            />
          </FormField>
          <Button onClick={handleSaveContent} loading={savingContent} className="self-start">
            <Save className="h-4 w-4" /> Salvar textos
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-neutral-800">Áreas de interesse (cargos)</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Cargos disponíveis no formulário de pré-candidatura. Desative em vez de excluir se já houver
            candidatos vinculados.
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-200">
            {jobs.map((area) => (
              <li key={area.id} className="flex items-center justify-between gap-3 p-3">
                <div>
                  <p className={`text-sm font-medium ${area.active ? 'text-neutral-800' : 'text-neutral-400 line-through'}`}>
                    {area.label}
                  </p>
                  <p className="text-xs text-neutral-400">{area.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {behavioralSettings.enabled && (
                    <Button size="sm" variant="outline" onClick={() => openJobBehavioralModal(area)}>
                      <Settings2 className="h-3.5 w-3.5" />
                      Triagem: {area.behavioralScreeningSettings ? 'customizada' : 'geral'}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleToggleJob(area)}>
                    {area.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteJob(area.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do novo cargo"
              value={newJobLabel}
              onChange={(e) => setNewJobLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddJob()}
            />
            <Button onClick={handleAddJob} loading={savingJobs}>
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 font-bold text-neutral-800">
            <HeartHandshake className="h-4 w-4" /> Triagem emocional e perfil comportamental
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Seção opcional do formulário público, usada apenas como apoio à entrevista — nunca gera diagnóstico,
            eliminação automática ou pontuação. Desativada por padrão.
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Checkbox
            id="behavioralEnabled"
            label="Ativar a seção Perfil comportamental no formulário de candidatura"
            checked={behavioralSettings.enabled}
            onChange={(e) => setBehavioralSettings((s) => ({ ...s, enabled: e.target.checked }))}
          />

          {behavioralSettings.enabled && (
            <>
              <BehavioralQuestionsGrid
                draft={behavioralSettings}
                onChange={(next) => setBehavioralSettings(next)}
              />
              <Checkbox
                id="interviewerNotesEnabled"
                label="Mostrar a área privada &quot;Observações do entrevistador&quot; na ficha do candidato"
                description="Visível apenas para owner, admin e rh — nunca para o candidato, viewer ou exportação CSV."
                checked={behavioralSettings.interviewerNotesEnabled}
                onChange={(e) => setBehavioralSettings((s) => ({ ...s, interviewerNotesEnabled: e.target.checked }))}
              />
            </>
          )}

          <Button onClick={handleSaveBehavioral} loading={savingBehavioral} className="self-start">
            <Save className="h-4 w-4" /> Salvar triagem comportamental
          </Button>
        </CardBody>
      </Card>

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

      <Modal
        open={!!jobBehavioralTarget}
        onClose={() => !savingJobBehavioral && setJobBehavioralTarget(null)}
        title={`Triagem comportamental — ${jobBehavioralTarget?.label ?? ''}`}
        footer={
          <>
            <Button variant="outline" onClick={handleUseGeneralForJob} loading={savingJobBehavioral}>
              Usar configuração geral
            </Button>
            <Button onClick={handleSaveJobBehavioral} loading={savingJobBehavioral}>
              Salvar customização desta vaga
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-neutral-500">
            Esta configuração substitui inteiramente a configuração geral da empresa só para candidaturas desta vaga.
            Clique em &quot;Usar configuração geral&quot; para voltar a seguir a configuração da empresa.
          </p>
          {jobBehavioralDraft && (
            <BehavioralQuestionsGrid draft={jobBehavioralDraft} onChange={setJobBehavioralDraft} />
          )}
        </div>
      </Modal>
    </div>
  );
}
