import { useEffect, useState } from 'react';
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
import {
  deleteCandidateData,
  getCandidate,
  getStatusHistory,
  updateCandidateEvaluation,
  updateCandidateStatus,
} from '@/lib/candidatesApi';
import type { Candidate, StatusHistoryEntry } from '@/types/candidate';
import { STATUS_LABELS } from '@/types/candidate';
import { jobAreaLabel } from '@/data/jobAreas';
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

interface InterviewInfo {
  date?: string;
  time?: string;
  location?: string;
}

function whatsappLink(phone: string, name: string, interview?: InterviewInfo): string {
  const digits = phone.replace(/\D/g, '');
  const fullNumber = digits.length <= 11 ? `55${digits}` : digits;
  const message =
    interview?.date && interview?.time
      ? `Olá, ${name}. Somos do setor de RH do Supermercado Descontão. Analisamos sua pré-candidatura e gostaríamos de convidar você para uma entrevista no dia ${new Date(
          `${interview.date}T00:00:00`
        ).toLocaleDateString('pt-BR')}, às ${interview.time}${
          interview.location ? `, em ${interview.location}` : ''
        }. Por favor, confirme o recebimento desta mensagem.`
      : `Olá, ${name}. Somos da equipe do Supermercado Descontão. Analisamos sua pré-candidatura e gostaríamos de conversar sobre a próxima etapa do nosso processo seletivo.`;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

export function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { admin, user } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
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

  const actorName = admin?.name ?? user?.email ?? 'administrador';

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [c, h] = await Promise.all([getCandidate(id), getStatusHistory(id)]);
      if (!c) {
        setError('Candidato não encontrado.');
        return;
      }
      setCandidate(c);
      setHistory(h);
      setRecruiterNote(c.evaluation?.recruiterNote ?? '');
      setRecruiterRating(c.evaluation?.recruiterRating ?? 0);
      setResponsibleName(c.evaluation?.responsibleName ?? '');
      setInterviewDate(c.evaluation?.interviewDate ?? '');
      setInterviewTime(c.evaluation?.interviewTime ?? '');
      setInterviewLocation(c.evaluation?.interviewLocation ?? '');
      setInterviewNotes(c.evaluation?.interviewNotes ?? '');
    } catch {
      setError('Não foi possível carregar os dados deste candidato.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Spinner label="Carregando ficha do candidato…" />;
  if (error || !candidate) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
        <Link to="/admin/candidatos" className="text-sm font-medium text-brand-blue-700 hover:underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const changeStatus = async (status: Candidate['status'], note?: string) => {
    setSavingStatus(true);
    try {
      await updateCandidateStatus(candidate.id, status, actorName, {
        note,
        changedByUid: user?.uid,
        previousStatus: candidate.status,
      });
      await load();
    } finally {
      setSavingStatus(false);
    }
  };

  const toggleFavorite = async () => {
    await updateCandidateEvaluation(
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
      await load();
    } finally {
      setSavingEvaluation(false);
    }
  };

  const scheduleInterview = async () => {
    await updateCandidateEvaluation(
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
      await deleteCandidateData(candidate.id);
      navigate('/admin/candidatos', { replace: true });
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 print:gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => navigate('/admin/candidatos')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-brand-blue-700"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex flex-wrap gap-2">
          <a
            href={whatsappLink(candidate.contact.whatsapp, candidate.personal.fullName, {
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
          value={candidate.interest.areas.map(jobAreaLabel).join(', ')}
        />
        <InfoField label="Área de maior interesse" value={jobAreaLabel(candidate.interest.mainAreaOfInterest)} />
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
        <InfoFieldFull label="Por que trabalhar no Descontão" value={candidate.profile.whyWorkHere} />
        <InfoFieldFull label="Principais qualidades" value={candidate.profile.mainQualities} />
        <InfoFieldFull label="Reação a orientações/correções" value={candidate.profile.reactionToFeedback} />
        <InfoFieldFull label="Situação em que ajudou um colega" value={candidate.profile.helpingColleagueStory} />
        <InfoFieldFull label="O que é um bom atendimento" value={candidate.profile.goodServiceMeaning} />
        <InfoFieldFull label="Como agiria com cliente insatisfeito" value={candidate.profile.dissatisfiedCustomerAction} />
        <InfoFieldFull label="Expectativas futuras" value={candidate.profile.futureExpectations} />
      </DetailSection>

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
