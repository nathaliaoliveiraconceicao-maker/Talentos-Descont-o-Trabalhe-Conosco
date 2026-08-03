import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CalendarClock,
  CheckCircle,
  Download,
  MessageCircle,
  Printer,
  Star,
  Trash2,
  UserX,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenantJobs } from '@/hooks/useTenantJobs';
import { logAuditEvent } from '@/lib/auditLog';
import {
  deleteCandidateData,
  getCandidate,
  getStatusHistory,
  updateCandidateEvaluation,
  updateCandidateStatus,
} from '@/lib/candidatesApi';
import { getTenant, getTenantSettings, jobAreaLabel } from '@/lib/tenantApi';
import { getBehavioralScreeningSettings } from '@/lib/behavioralScreeningApi';
import {
  addInterviewerNote,
  getBehavioralProfile,
  listInterviewerNotes,
  type BehavioralProfileRecord,
  type InterviewerNote,
} from '@/lib/behavioralProfileApi';
import type { Candidate, StatusHistoryEntry } from '@/types/candidate';
import { STATUS_LABELS } from '@/types/candidate';
import type { TenantSettings } from '@/types/tenant';
import { WRITE_ROLES } from '@/types/admin';
import {
  BEHAVIORAL_QUESTION_LABELS,
  LIFE_WHEEL_KEYS,
  LIFE_WHEEL_LABELS,
  type BehavioralQuestionKey,
  type BehavioralScreeningSettings,
} from '@/types/behavioralProfile';
import { EDUCATION_LEVELS } from '@/data/educationLevels';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { StatusBadge } from '@/components/ui/Badge';
import { DetailSection, InfoField, InfoFieldFull } from '@/components/admin/DetailSection';

/**
 * Campo de "Observação do RH" reutilizado tanto por pergunta do perfil
 * comportamental quanto pela área geral "Observações do entrevistador".
 * Cada gravação cria um novo documento em
 * tenants/{t}/candidates/{c}/evaluations (histórico imutável) — nunca
 * sobrescreve a observação anterior.
 */
function BehavioralNoteField({
  tenantId,
  candidateId,
  questionKey,
  maxLength,
  existingNote,
  evaluatorId,
  evaluatorName,
  onSaved,
}: {
  tenantId: string;
  candidateId: string;
  questionKey?: BehavioralQuestionKey;
  maxLength: number;
  existingNote?: InterviewerNote;
  evaluatorId: string;
  evaluatorName: string;
  onSaved: () => void;
}) {
  const [text, setText] = useState(existingNote?.interviewerNotes ?? '');
  const [saving, setSaving] = useState(false);
  const fieldId = `behavioral-note-${questionKey ?? 'general'}`;

  const save = async () => {
    setSaving(true);
    try {
      await addInterviewerNote(tenantId, candidateId, {
        interviewerNotes: text,
        questionKey,
        evaluatorId,
        evaluatorName,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-dashed border-neutral-300 p-3">
      <FormField label="Observação do RH" htmlFor={fieldId}>
        <Textarea id={fieldId} rows={2} maxLength={maxLength} showCount value={text} onChange={(e) => setText(e.target.value)} />
      </FormField>
      {existingNote && (
        <p className="mt-1 text-xs text-neutral-400">
          Última observação de {existingNote.evaluatorName} em {new Date(existingNote.updatedAt).toLocaleString('pt-BR')}
        </p>
      )}
      <Button size="sm" variant="outline" onClick={save} loading={saving} className="mt-2">
        Salvar observação
      </Button>
    </div>
  );
}

interface InterviewInfo {
  date?: string;
  time?: string;
  location?: string;
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, value),
    template
  );
}

function whatsappLink(
  phone: string,
  name: string,
  tenantName: string,
  templates: TenantSettings | null,
  interview?: InterviewInfo
): string {
  const digits = phone.replace(/\D/g, '');
  const fullNumber = digits.length <= 11 ? `55${digits}` : digits;

  const message =
    interview?.date && interview?.time && templates
      ? fillTemplate(templates.whatsappInterviewMessage, {
          nome: name,
          empresa: tenantName,
          data: new Date(`${interview.date}T00:00:00`).toLocaleDateString('pt-BR'),
          horario: interview.time,
          local: interview.location || 'a combinar',
        })
      : templates
        ? fillTemplate(templates.whatsappGenericMessage, { nome: name, empresa: tenantName })
        : `Olá, ${name}. Somos da equipe de RH da ${tenantName}. Analisamos sua pré-candidatura e gostaríamos de conversar sobre a próxima etapa do nosso processo seletivo.`;

  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

export function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { admin, user, tenantId } = useAuth();
  const jobs = useTenantJobs(tenantId);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [tenantName, setTenantName] = useState('');
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  const [recruiterNote, setRecruiterNote] = useState('');
  const [recruiterRating, setRecruiterRating] = useState(0);
  const [responsibleName, setResponsibleName] = useState('');
  const [savingEvaluation, setSavingEvaluation] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [behavioralRecord, setBehavioralRecord] = useState<BehavioralProfileRecord | null>(null);
  const [behavioralNotes, setBehavioralNotes] = useState<InterviewerNote[]>([]);
  const [behavioralScreeningSettings, setBehavioralScreeningSettings] = useState<BehavioralScreeningSettings | null>(
    null
  );

  const actorName = admin?.name ?? user?.email ?? 'administrador';
  // "Perfil comportamental" e observações do entrevistador são restritos a
  // owner/admin/rh — viewer e usuários de outro tenant nunca chegam a ver
  // isto (as Firestore Rules já negam a leitura da subcoleção para eles;
  // este gate na UI evita até tentar buscar).
  const canViewBehavioral = !!admin && WRITE_ROLES.includes(admin.role);

  const reloadBehavioralNotes = async () => {
    if (!tenantId || !id) return;
    setBehavioralNotes(await listInterviewerNotes(tenantId, id));
  };

  const load = async () => {
    if (!id || !tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const [c, h, tenant, settings] = await Promise.all([
        getCandidate(tenantId, id),
        getStatusHistory(tenantId, id),
        getTenant(tenantId),
        getTenantSettings(tenantId),
      ]);
      if (!c) {
        setError('Candidato não encontrado.');
        return;
      }
      setCandidate(c);
      setHistory(h);
      setTenantName(tenant?.name ?? '');
      setTenantSettings(settings);
      setRecruiterNote(c.evaluation?.recruiterNote ?? '');
      setRecruiterRating(c.evaluation?.recruiterRating ?? 0);
      setResponsibleName(c.evaluation?.responsibleName ?? '');
      setInterviewDate(c.evaluation?.interviewDate ?? '');
      setInterviewTime(c.evaluation?.interviewTime ?? '');
      setInterviewLocation(c.evaluation?.interviewLocation ?? '');
      setInterviewNotes(c.evaluation?.interviewNotes ?? '');

      if (admin && WRITE_ROLES.includes(admin.role)) {
        const [record, notes, screeningSettings] = await Promise.all([
          getBehavioralProfile(tenantId, id),
          listInterviewerNotes(tenantId, id),
          getBehavioralScreeningSettings(tenantId),
        ]);
        setBehavioralRecord(record);
        setBehavioralNotes(notes);
        setBehavioralScreeningSettings(screeningSettings);
      }
    } catch {
      setError('Não foi possível carregar os dados deste candidato.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tenantId]);

  if (loading) return <Spinner label="Carregando ficha do candidato…" />;
  if (error || !candidate || !tenantId) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
        <Link to="/app/candidatos" className="text-sm font-medium text-brand-blue-700 hover:underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const changeStatus = async (status: Candidate['status'], note?: string) => {
    setSavingStatus(true);
    try {
      await updateCandidateStatus(tenantId, candidate.id, status, actorName, {
        note,
        changedByUid: user?.uid,
        previousStatus: candidate.status,
      });
      await logAuditEvent({
        tenantId,
        actorUid: user?.uid ?? '',
        actorName,
        action: 'status_changed',
        targetType: 'candidate',
        targetId: candidate.id,
        details: { from: candidate.status, to: status, note: note ?? '' },
      });
      await load();
    } finally {
      setSavingStatus(false);
    }
  };

  const toggleFavorite = async () => {
    await updateCandidateEvaluation(
      tenantId,
      candidate.id,
      { ...candidate.evaluation, isFavorite: !candidate.evaluation?.isFavorite },
      actorName
    );
    await load();
  };

  const saveEvaluation = async () => {
    setSavingEvaluation(true);
    try {
      await updateCandidateEvaluation(
        tenantId,
        candidate.id,
        {
          recruiterNote,
          recruiterRating,
          responsibleName,
          interviewDate,
          interviewTime,
          interviewLocation,
          interviewNotes,
          isFavorite: candidate.evaluation?.isFavorite ?? false,
        },
        actorName
      );
      await logAuditEvent({
        tenantId,
        actorUid: user?.uid ?? '',
        actorName,
        action: 'evaluation_updated',
        targetType: 'candidate',
        targetId: candidate.id,
      });
      await load();
    } finally {
      setSavingEvaluation(false);
    }
  };

  const scheduleInterview = async () => {
    await updateCandidateEvaluation(
      tenantId,
      candidate.id,
      {
        ...candidate.evaluation,
        interviewDate,
        interviewTime,
        interviewLocation,
        interviewNotes,
        responsibleName: responsibleName || actorName,
        isFavorite: candidate.evaluation?.isFavorite ?? false,
      },
      actorName
    );
    await changeStatus(
      'entrevista_agendada',
      `Entrevista agendada para ${interviewDate} às ${interviewTime}${interviewLocation ? ` em ${interviewLocation}` : ''}.`
    );
    setInterviewModalOpen(false);
  };

  const handleDeleteCandidate = async () => {
    setDeleting(true);
    try {
      await logAuditEvent({
        tenantId,
        actorUid: user?.uid ?? '',
        actorName,
        action: 'candidate_deleted',
        targetType: 'candidate',
        targetId: candidate.id,
        details: { name: candidate.personal.fullName, protocol: candidate.protocol },
      });
      await deleteCandidateData(tenantId, candidate.id);
      navigate('/app/candidatos', { replace: true });
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const behavioralAnswers: { key: BehavioralQuestionKey; title: string; content: ReactNode }[] = [];
  if (behavioralRecord?.profile.threeWords) {
    const tw = behavioralRecord.profile.threeWords;
    behavioralAnswers.push({
      key: 'threeWords',
      title: BEHAVIORAL_QUESTION_LABELS.threeWords,
      content: `${tw.word1}, ${tw.word2}, ${tw.word3}`,
    });
  }
  if (behavioralRecord?.profile.emotionalBalance) {
    const eb = behavioralRecord.profile.emotionalBalance;
    behavioralAnswers.push({
      key: 'emotionalBalance',
      title: BEHAVIORAL_QUESTION_LABELS.emotionalBalance,
      content: (
        <>
          <p>Nota: {eb.score}/5</p>
          <p className="mt-1 whitespace-pre-line">{eb.context}</p>
        </>
      ),
    });
  }
  if (behavioralRecord?.profile.lifeWheel) {
    const lw = behavioralRecord.profile.lifeWheel;
    behavioralAnswers.push({
      key: 'lifeWheel',
      title: BEHAVIORAL_QUESTION_LABELS.lifeWheel,
      content: (
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {LIFE_WHEEL_KEYS.map((k) => (
            <li key={k}>
              {LIFE_WHEEL_LABELS[k]}: {lw[k]}/10
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (behavioralRecord?.profile.workAnimal?.answer) {
    behavioralAnswers.push({
      key: 'workAnimal',
      title: BEHAVIORAL_QUESTION_LABELS.workAnimal,
      content: behavioralRecord.profile.workAnimal.answer,
    });
  }
  if (behavioralRecord?.profile.constructiveFeedback) {
    behavioralAnswers.push({
      key: 'constructiveFeedback',
      title: BEHAVIORAL_QUESTION_LABELS.constructiveFeedback,
      content: behavioralRecord.profile.constructiveFeedback,
    });
  }
  if (behavioralRecord?.profile.conflictManagement) {
    behavioralAnswers.push({
      key: 'conflictManagement',
      title: BEHAVIORAL_QUESTION_LABELS.conflictManagement,
      content: behavioralRecord.profile.conflictManagement,
    });
  }
  if (behavioralRecord?.profile.emotionalControl) {
    behavioralAnswers.push({
      key: 'emotionalControl',
      title: BEHAVIORAL_QUESTION_LABELS.emotionalControl,
      content: behavioralRecord.profile.emotionalControl,
    });
  }
  const generalInterviewerNote = behavioralNotes.find((n) => !n.questionKey);

  return (
    <div className="flex flex-col gap-6 print:gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => navigate('/app/candidatos')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-brand-blue-700"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex flex-wrap gap-2">
          <a
            href={whatsappLink(candidate.contact.whatsapp, candidate.personal.fullName, tenantName, tenantSettings, {
              date: candidate.evaluation?.interviewDate,
              time: candidate.evaluation?.interviewTime,
              location: candidate.evaluation?.interviewLocation,
            })}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary">
              <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
            </Button>
          </a>
          <Button variant="outline" onClick={() => changeStatus('pre_selecionado')} loading={savingStatus}>
            Pré-selecionar
          </Button>
          <Button variant="outline" onClick={() => setInterviewModalOpen(true)}>
            <CalendarClock className="h-4 w-4" /> Agendar entrevista
          </Button>
          <Button variant="outline" onClick={() => changeStatus('banco_talentos')} loading={savingStatus}>
            <Users className="h-4 w-4" /> Banco de talentos
          </Button>
          <Button onClick={() => changeStatus('aprovado')} loading={savingStatus}>
            <CheckCircle className="h-4 w-4" /> Aprovar
          </Button>
          <Button variant="danger" onClick={() => changeStatus('nao_selecionado')} loading={savingStatus}>
            <UserX className="h-4 w-4" /> Não selecionar
          </Button>
          {candidate.resume && (
            <a href={candidate.resume.fileUrl} target="_blank" rel="noreferrer">
              <Button variant="outline">
                <Download className="h-4 w-4" /> Baixar currículo
              </Button>
            </a>
          )}
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimir ficha
          </Button>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4" /> Excluir dados (LGPD)
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-800">{candidate.personal.fullName}</h1>
              <button onClick={toggleFavorite} aria-label="Marcar como favorito" className="print:hidden">
                <Star
                  className={`h-5 w-5 ${candidate.evaluation?.isFavorite ? 'fill-brand-yellow-400 text-brand-yellow-500' : 'text-neutral-300'}`}
                />
              </button>
            </div>
            <p className="text-sm text-neutral-500">
              Protocolo {candidate.protocol} · Recebido em{' '}
              {new Date(candidate.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="flex items-center gap-1 text-2xl font-bold text-brand-green-700">
                <Award className="h-5 w-5" /> {candidate.score}
              </p>
              <p className="text-xs text-neutral-400">Pontuação</p>
            </div>
            <StatusBadge status={candidate.status} />
          </div>
        </CardBody>
      </Card>

      <DetailSection title="Dados pessoais">
        <InfoField label="Nome completo" value={candidate.personal.fullName} />
        <InfoField label="Data de nascimento" value={candidate.personal.birthDate} />
        <InfoField label="CPF" value={candidate.personal.cpf} />
        <InfoField label="Cidade" value={candidate.personal.city} />
        <InfoField label="Bairro" value={candidate.personal.neighborhood} />
        <InfoField label="Endereço resumido" value={candidate.personal.addressSummary} />
        <InfoField label="Fácil acesso ao trabalho" value={candidate.personal.hasEasyAccess} />
        <InfoFieldFull label="Necessidade de acessibilidade" value={candidate.personal.accessibilityNeeds} />
      </DetailSection>

      <DetailSection title="Contato">
        <InfoField label="WhatsApp" value={candidate.contact.whatsapp} />
        <InfoField label="Telefone alternativo" value={candidate.contact.alternatePhone} />
        <InfoField label="E-mail" value={candidate.contact.email} />
        <InfoField label="Melhor forma de contato" value={candidate.contact.contactPreference} />
      </DetailSection>

      <DetailSection title="Área de interesse">
        <InfoFieldFull
          label="Áreas selecionadas"
          value={candidate.interest.areas.map((a) => jobAreaLabel(jobs, a)).join(', ')}
        />
        <InfoField label="Área de maior interesse" value={jobAreaLabel(jobs, candidate.interest.mainAreaOfInterest)} />
        <InfoField label="Aceita outra função" value={candidate.interest.acceptsOtherRole} />
        <InfoField label="Buscando primeiro emprego" value={candidate.interest.isFirstJob} />
      </DetailSection>

      <DetailSection title="Disponibilidade">
        <InfoField
          label="Períodos"
          value={[
            candidate.availability.morning && 'Manhã',
            candidate.availability.afternoon && 'Tarde',
            candidate.availability.night && 'Noite',
            candidate.availability.fullTime && 'Integral',
          ]
            .filter(Boolean)
            .join(', ')}
        />
        <InfoField
          label="Fins de semana e feriados"
          value={[
            candidate.availability.saturdays && 'Sábados',
            candidate.availability.sundays && 'Domingos',
            candidate.availability.holidays && 'Feriados',
            candidate.availability.shiftWork && 'Escala',
          ]
            .filter(Boolean)
            .join(', ')}
        />
        <InfoField label="Pode iniciar imediatamente" value={candidate.availability.canStartImmediately} />
        <InfoField label="Data estimada para início" value={candidate.availability.estimatedStartDate} />
        <InfoField label="Disponível para horas extras" value={candidate.availability.availableForOvertime} />
      </DetailSection>

      <DetailSection title="Experiência profissional">
        <InfoField label="Já trabalhou antes" value={candidate.experience.hasWorkedBefore} />
        <InfoField label="Área com mais experiência" value={candidate.experience.mostExperiencedArea} />
        {candidate.experience.hasWorkedBefore === 'sim' && (
          <>
            <InfoField label="Já trabalhou em supermercado" value={candidate.experience.workedInSupermarket} />
            <InfoField label="Já trabalhou em comércio" value={candidate.experience.workedInRetail} />
            <InfoField label="Atendimento ao público" value={candidate.experience.hasCustomerServiceExperience} />
            <InfoField label="Operador de caixa" value={candidate.experience.hasCashierExperience} />
            <InfoField label="Reposição" value={candidate.experience.hasRestockingExperience} />
            <InfoField label="Estoque" value={candidate.experience.hasStockExperience} />
            <InfoField label="Açougue" value={candidate.experience.hasButcherExperience} />
            <InfoField label="Padaria" value={candidate.experience.hasBakeryExperience} />
            <InfoField label="Liderança" value={candidate.experience.hasLeadershipExperience} />
          </>
        )}
      </DetailSection>

      {candidate.experience.experiences.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Histórico de experiências</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {candidate.experience.experiences.map((exp, index) => (
              <div key={exp.id} className="rounded-lg border border-neutral-200 p-4">
                <p className="font-semibold text-neutral-800">
                  {index + 1}. {exp.role} — {exp.company}
                </p>
                <p className="text-xs text-neutral-500">
                  {exp.startDate} até {exp.isCurrentJob ? 'atual' : exp.endDate}
                </p>
                <p className="mt-2 text-sm text-neutral-700">{exp.activities}</p>
                {exp.leavingReason && (
                  <p className="mt-1 text-sm text-neutral-500">Motivo da saída: {exp.leavingReason}</p>
                )}
                {exp.referenceName && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Referência: {exp.referenceName} {exp.referencePhone && `— ${exp.referencePhone}`}{' '}
                    {exp.allowContactReference ? '(contato autorizado)' : '(contato não autorizado)'}
                  </p>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <DetailSection title="Escolaridade e cursos">
        <InfoField
          label="Escolaridade"
          value={EDUCATION_LEVELS.find((l) => l.id === candidate.education.educationLevel)?.label}
        />
        <InfoField label="Instituição" value={candidate.education.institution} />
        <InfoField label="Curso técnico" value={candidate.education.technicalCourse} />
        <InfoFieldFull label="Cursos profissionalizantes" value={candidate.education.professionalCourses} />
        <InfoFieldFull label="Certificações" value={candidate.education.certifications} />
        <InfoField
          label="Habilidades"
          value={[
            candidate.education.basicComputerSkills && 'Informática básica',
            candidate.education.officePackage && 'Pacote Office',
            candidate.education.posSystemsExperience && 'Sistemas de caixa',
          ]
            .filter(Boolean)
            .join(', ')}
        />
        <InfoFieldFull label="Outras habilidades" value={candidate.education.otherSkills} />
      </DetailSection>

      <DetailSection title="Perfil profissional">
        <InfoFieldFull label="Por que trabalhar aqui" value={candidate.profile.whyWorkHere} />
        <InfoFieldFull label="Principais qualidades" value={candidate.profile.mainQualities} />
        <InfoFieldFull label="Reação a orientações/correções" value={candidate.profile.reactionToFeedback} />
        <InfoFieldFull label="Situação em que ajudou um colega" value={candidate.profile.helpingColleagueStory} />
        <InfoFieldFull label="O que é um bom atendimento" value={candidate.profile.goodServiceMeaning} />
        <InfoFieldFull label="Como agiria com cliente insatisfeito" value={candidate.profile.dissatisfiedCustomerAction} />
        <InfoFieldFull label="Expectativas futuras" value={candidate.profile.futureExpectations} />
      </DetailSection>

      {canViewBehavioral && (
        <Card className="print:hidden">
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Perfil comportamental</h2>
            <p className="mt-1 text-xs text-neutral-500">
              As respostas abaixo foram fornecidas pelo candidato e devem ser utilizadas somente como apoio à
              entrevista. Não constituem diagnóstico psicológico.
            </p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {behavioralAnswers.length === 0 ? (
              <p className="text-sm text-neutral-500">Perfil comportamental não preenchido.</p>
            ) : (
              <>
                <p className="text-xs text-neutral-400">
                  Preenchido em {behavioralRecord && new Date(behavioralRecord.createdAt).toLocaleString('pt-BR')}
                </p>
                {behavioralAnswers.map(({ key, title, content }) => (
                  <div key={key} className="border-t border-neutral-100 pt-4 first:border-t-0 first:pt-0">
                    <p className="text-sm font-semibold text-neutral-800">{title}</p>
                    <div className="mt-1 text-sm text-neutral-700">{content}</div>
                    {tenantId && candidate && (
                      <BehavioralNoteField
                        tenantId={tenantId}
                        candidateId={candidate.id}
                        questionKey={key}
                        maxLength={3000}
                        existingNote={behavioralNotes.find((n) => n.questionKey === key)}
                        evaluatorId={user?.uid ?? ''}
                        evaluatorName={actorName}
                        onSaved={reloadBehavioralNotes}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {behavioralScreeningSettings?.interviewerNotesEnabled && tenantId && candidate && (
              <div className="border-t border-neutral-200 pt-4">
                <h3 className="text-sm font-bold text-neutral-800">Observações do entrevistador</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Área privada, visível apenas para owner, admin e rh — não aparece para o candidato nem é incluída
                  na exportação CSV padrão.
                </p>
                <BehavioralNoteField
                  tenantId={tenantId}
                  candidateId={candidate.id}
                  maxLength={3000}
                  existingNote={generalInterviewerNote}
                  evaluatorId={user?.uid ?? ''}
                  evaluatorName={actorName}
                  onSaved={reloadBehavioralNotes}
                />
                {behavioralNotes.filter((n) => !n.questionKey).length > 1 && (
                  <details className="mt-2 text-xs text-neutral-500">
                    <summary className="cursor-pointer font-medium">
                      Ver histórico ({behavioralNotes.filter((n) => !n.questionKey).length} observações)
                    </summary>
                    <ul className="mt-2 flex flex-col gap-2">
                      {behavioralNotes
                        .filter((n) => !n.questionKey)
                        .map((n) => (
                          <li key={n.id} className="rounded border border-neutral-200 p-2">
                            <p className="whitespace-pre-line">{n.interviewerNotes}</p>
                            <p className="mt-1 text-neutral-400">
                              {n.evaluatorName} · {new Date(n.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </li>
                        ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Card className="print:hidden">
        <CardHeader>
          <h2 className="font-bold text-neutral-800">Avaliação do recrutador</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <FormField label="Nota do recrutador (0 a 5)" htmlFor="rating">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRecruiterRating(n)}>
                  <Star
                    className={`h-6 w-6 ${n <= recruiterRating ? 'fill-brand-yellow-400 text-brand-yellow-500' : 'text-neutral-300'}`}
                  />
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Observações internas" htmlFor="recruiterNote">
            <Textarea
              id="recruiterNote"
              value={recruiterNote}
              onChange={(e) => setRecruiterNote(e.target.value)}
              rows={4}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Responsável pela análise" htmlFor="responsibleName">
              <Input id="responsibleName" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} />
            </FormField>
            <FormField label="Data da entrevista" htmlFor="interviewDate">
              <Input id="interviewDate" type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
            </FormField>
            <FormField label="Horário da entrevista" htmlFor="interviewTime">
              <Input id="interviewTime" type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} />
            </FormField>
            <FormField label="Local da entrevista" htmlFor="interviewLocation">
              <Input
                id="interviewLocation"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                placeholder="Ex.: Loja Centro, sala de RH"
              />
            </FormField>
          </div>
          <FormField label="Observações da entrevista" htmlFor="interviewNotes">
            <Textarea
              id="interviewNotes"
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              rows={3}
            />
          </FormField>
          <Button onClick={saveEvaluation} loading={savingEvaluation} className="self-start">
            Salvar avaliação
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-neutral-800">Histórico de status</h2>
        </CardHeader>
        <CardBody>
          <ol className="flex flex-col gap-4 border-l-2 border-neutral-200 pl-4">
            {history.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-blue-500" />
                <p className="text-sm font-semibold text-neutral-800">{STATUS_LABELS[entry.status]}</p>
                <p className="text-xs text-neutral-400">
                  {new Date(entry.changedAt).toLocaleString('pt-BR')} · {entry.changedBy}
                  {entry.previousStatus && ` · anterior: ${STATUS_LABELS[entry.previousStatus]}`}
                </p>
                {entry.note && <p className="mt-0.5 text-sm text-neutral-600">{entry.note}</p>}
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      <Modal
        open={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        title="Agendar entrevista"
        footer={
          <>
            <Button variant="outline" onClick={() => setInterviewModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={scheduleInterview} disabled={!interviewDate || !interviewTime}>
              Confirmar agendamento
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Data" htmlFor="modalInterviewDate" required>
            <Input
              id="modalInterviewDate"
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
            />
          </FormField>
          <FormField label="Horário" htmlFor="modalInterviewTime" required>
            <Input
              id="modalInterviewTime"
              type="time"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
            />
          </FormField>
          <FormField label="Local" htmlFor="modalInterviewLocation">
            <Input
              id="modalInterviewLocation"
              value={interviewLocation}
              onChange={(e) => setInterviewLocation(e.target.value)}
              placeholder="Ex.: Loja Centro, sala de RH"
            />
          </FormField>
          <FormField label="Responsável pela análise" htmlFor="modalResponsible">
            <Input
              id="modalResponsible"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              placeholder={actorName}
            />
          </FormField>
          <FormField label="Observações" htmlFor="modalInterviewNotes">
            <Textarea
              id="modalInterviewNotes"
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              rows={3}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Excluir dados do candidato"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteCandidate} loading={deleting}>
              Excluir permanentemente
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Esta ação é <strong>irreversível</strong> e removerá permanentemente todos os dados e o
          currículo de <strong>{candidate.personal.fullName}</strong>, conforme solicitação do
          titular, em conformidade com a LGPD.
        </p>
      </Modal>
    </div>
  );
}
