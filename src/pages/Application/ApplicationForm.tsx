import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { FormProvider, useCandidateForm, TOTAL_STEPS } from '@/context/FormContext';
import { useTenant } from '@/context/TenantContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { checkRecentDuplicate, submitCandidate } from '@/lib/candidatesApi';
import { getScoringSettings } from '@/lib/settingsApi';
import { jobAreaLabel } from '@/lib/tenantApi';
import { validateStep, type Errors } from './validation';
import { Step1Personal } from './steps/Step1Personal';
import { Step2Contact } from './steps/Step2Contact';
import { Step3Interest } from './steps/Step3Interest';
import { Step4Availability } from './steps/Step4Availability';
import { Step5Experience } from './steps/Step5Experience';
import { Step6Education } from './steps/Step6Education';
import { Step7Profile } from './steps/Step7Profile';
import { Step8Resume } from './steps/Step8Resume';
import { Step9Consent } from './steps/Step9Consent';

const STEP_LABELS = [
  'Dados pessoais',
  'Contato',
  'Área de interesse',
  'Disponibilidade',
  'Experiência',
  'Escolaridade',
  'Perfil profissional',
  'Currículo',
  'Consentimento',
];

function ApplicationFormInner() {
  const navigate = useNavigate();
  const { tenant, jobs } = useTenant();
  const { data, currentStep, nextStep, prevStep, resumeFile, resetForm } = useCandidateForm();
  const [errors, setErrors] = useState<Errors>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = () => {
    const stepErrors = validateStep(currentStep, data, resumeFile);
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
    const stepErrors = validateStep(9, data, resumeFile);
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Personal errors={errors} />;
      case 2:
        return <Step2Contact errors={errors} />;
      case 3:
        return <Step3Interest errors={errors} />;
      case 4:
        return <Step4Availability errors={errors} />;
      case 5:
        return <Step5Experience errors={errors} />;
      case 6:
        return <Step6Education errors={errors} />;
      case 7:
        return <Step7Profile errors={errors} />;
      case 8:
        return <Step8Resume errors={errors} />;
      case 9:
        return <Step9Consent errors={errors} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS;

  return (
    <div className="container-page max-w-2xl py-10">
      <div id="form-errors-anchor" />
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} stepLabel={STEP_LABELS[currentStep - 1]} />

      <div className="mt-8 rounded-xl2 border border-neutral-200 bg-white p-5 shadow-card sm:p-8">
        {renderStep()}
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
