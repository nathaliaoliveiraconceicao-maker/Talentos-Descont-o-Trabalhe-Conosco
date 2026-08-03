import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { FormProvider, useCandidateForm } from '@/context/FormContext';
import { useTenant } from '@/context/TenantContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { checkRecentDuplicate, submitCandidate } from '@/lib/candidatesApi';
import { getScoringSettings } from '@/lib/settingsApi';
import { jobAreaLabel } from '@/lib/tenantApi';
import { isBehavioralScreeningVisible, resolveBehavioralScreeningSettings } from '@/types/behavioralProfile';
import {
  validateAvailability,
  validateBehavioral,
  validateConsent,
  validateContact,
  validateEducation,
  validateExperience,
  validateInterest,
  validatePersonal,
  validateProfile,
  validateResume,
  type Errors,
} from './validation';
import { Step1Personal } from './steps/Step1Personal';
import { Step2Contact } from './steps/Step2Contact';
import { Step3Interest } from './steps/Step3Interest';
import { Step4Availability } from './steps/Step4Availability';
import { Step5Experience } from './steps/Step5Experience';
import { Step6Education } from './steps/Step6Education';
import { Step7Profile } from './steps/Step7Profile';
import { Step8Resume } from './steps/Step8Resume';
import { Step9Consent } from './steps/Step9Consent';
import { StepBehavioral } from './steps/StepBehavioral';

interface StepDescriptor {
  label: string;
  render: (errors: Errors) => JSX.Element;
  validate: (errors: { data: Parameters<typeof validatePersonal>[0]; resumeFile: File | null }) => Errors;
}

function ApplicationFormInner() {
  const navigate = useNavigate();
  const { tenant, jobs, behavioralScreeningSettings } = useTenant();
  const { data, currentStep, goToStep, nextStep, prevStep, resumeFile, resetForm } = useCandidateForm();
  const [errors, setErrors] = useState<Errors>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // A vaga de maior interesse (já escolhida na etapa 3) pode substituir
  // inteiramente a configuração geral da empresa para a triagem
  // comportamental — ver TenantJobArea.behavioralScreeningSettings.
  const jobOverride = jobs.find((j) => j.id === data.interest.mainAreaOfInterest)?.behavioralScreeningSettings;
  const resolvedBehavioralSettings = resolveBehavioralScreeningSettings(behavioralScreeningSettings, jobOverride);
  const behavioralStepVisible = isBehavioralScreeningVisible(resolvedBehavioralSettings);

  const steps: StepDescriptor[] = useMemo(() => {
    const base: StepDescriptor[] = [
      { label: 'Dados pessoais', render: (e) => <Step1Personal errors={e} />, validate: ({ data }) => validatePersonal(data) },
      { label: 'Contato', render: (e) => <Step2Contact errors={e} />, validate: ({ data }) => validateContact(data) },
      { label: 'Área de interesse', render: (e) => <Step3Interest errors={e} />, validate: ({ data }) => validateInterest(data) },
      { label: 'Disponibilidade', render: (e) => <Step4Availability errors={e} />, validate: ({ data }) => validateAvailability(data) },
      { label: 'Experiência', render: (e) => <Step5Experience errors={e} />, validate: ({ data }) => validateExperience(data) },
      { label: 'Escolaridade', render: (e) => <Step6Education errors={e} />, validate: ({ data }) => validateEducation(data) },
      { label: 'Perfil profissional', render: (e) => <Step7Profile errors={e} />, validate: ({ data }) => validateProfile(data) },
      { label: 'Currículo', render: (e) => <Step8Resume errors={e} />, validate: ({ resumeFile }) => validateResume(resumeFile) },
    ];
    if (behavioralStepVisible) {
      base.push({
        label: 'Perfil comportamental',
        render: (e) => <StepBehavioral errors={e} settings={resolvedBehavioralSettings} />,
        validate: ({ data }) => validateBehavioral(data, resolvedBehavioralSettings),
      });
    }
    base.push({ label: 'Consentimento', render: (e) => <Step9Consent errors={e} />, validate: ({ data }) => validateConsent(data) });
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [behavioralStepVisible]);

  const totalSteps = steps.length;

  // Se a configuração mudar (ou uma etapa antiga persistida no localStorage
  // ficar acima do total atual), garante que o passo exibido nunca aponte
  // para fora dos limites.
  useEffect(() => {
    if (currentStep > totalSteps) goToStep(totalSteps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSteps]);

  const activeStepIndex = Math.min(currentStep, totalSteps) - 1;
  const activeStep = steps[activeStepIndex];

  const handleNext = () => {
    const stepErrors = activeStep.validate({ data, resumeFile });
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      nextStep();
    } else {
      document.getElementById('form-errors-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrors({});
    prevStep();
  };

  const handleReviewSubmit = async () => {
    const stepErrors = activeStep.validate({ data, resumeFile });
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    setSubmitError(null);
    try {
      const isDuplicate = await checkRecentDuplicate(tenant.tenantId, data.contact.email, data.contact.whatsapp);
      setDuplicateWarning(isDuplicate);
    } catch {
      setDuplicateWarning(false);
    }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const scoring = await getScoringSettings(tenant.tenantId);
      const { protocol } = await submitCandidate(tenant.tenantId, data, resumeFile, scoring.weights);
      resetForm();
      navigate(`/${tenant.slug}/candidatura/confirmacao`, { state: { protocol } });
    } catch (err) {
      console.error(err);
      setSubmitError('Não foi possível enviar sua candidatura agora. Verifique sua conexão e tente novamente.');
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="container-page max-w-2xl py-10">
      <div id="form-errors-anchor" />
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} stepLabel={steps[activeStepIndex]?.label} />

      <div className="mt-8 rounded-xl2 border border-neutral-200 bg-white p-5 shadow-card sm:p-8">
        {activeStep.render(errors)}
      </div>

      {submitError && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>

        {isLastStep ? (
          <Button type="button" onClick={handleReviewSubmit}>
            <Send className="h-4 w-4" /> Enviar candidatura
          </Button>
        ) : (
          <Button type="button" onClick={handleNext}>
            Avançar <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Modal
        open={showConfirm}
        onClose={() => !submitting && setShowConfirm(false)}
        title="Confirmar envio da candidatura"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={submitting}>
              Revisar
            </Button>
            <Button onClick={handleConfirmSubmit} loading={submitting}>
              Confirmar e enviar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 text-sm text-neutral-600">
          {duplicateWarning && (
            <div className="flex items-start gap-2 rounded-lg bg-brand-yellow-50 p-3 text-brand-yellow-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Identificamos uma candidatura recente com o mesmo e-mail ou WhatsApp. Você pode
                confirmar mesmo assim, mas evite enviar diversas candidaturas seguidas.
              </p>
            </div>
          )}
          <p>
            Confira se seus dados estão corretos antes de enviar. Após o envio, você receberá um
            número de protocolo para acompanhamento.
          </p>
          <ul className="list-inside list-disc space-y-1 text-neutral-700">
            <li>
              <strong>Nome:</strong> {data.personal.fullName || '—'}
            </li>
            <li>
              <strong>WhatsApp:</strong> {data.contact.whatsapp || '—'}
            </li>
            <li>
              <strong>E-mail:</strong> {data.contact.email || '—'}
            </li>
            <li>
              <strong>Área de maior interesse:</strong>{' '}
              {data.interest.mainAreaOfInterest ? jobAreaLabel(jobs, data.interest.mainAreaOfInterest) : '—'}
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}

export function ApplicationForm() {
  const { tenant } = useTenant();
  return (
    <FormProvider tenantSlug={tenant.slug}>
      <ApplicationFormInner />
    </FormProvider>
  );
}
