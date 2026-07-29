import { useCandidateForm } from '@/context/FormContext';
import { useTenant } from '@/context/TenantContext';
import { FormField } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Textarea';
import type { Errors } from '../validation';
import { PROFILE_MAX_LENGTH } from '../validation';
import { StepShell } from './StepShell';

const QUESTIONS: { key: keyof import('@/types/candidate').ProfileData; label: string }[] = [
  { key: 'whyWorkHere', label: 'Por que você gostaria de trabalhar aqui?' },
  { key: 'mainQualities', label: 'Quais são suas principais qualidades profissionais?' },
  { key: 'reactionToFeedback', label: 'Como você reage ao receber uma orientação ou correção?' },
  { key: 'helpingColleagueStory', label: 'Conte uma situação em que precisou ajudar um colega.' },
  { key: 'goodServiceMeaning', label: 'O que significa um bom atendimento ao cliente para você?' },
  { key: 'dissatisfiedCustomerAction', label: 'Como você agiria caso um cliente estivesse insatisfeito?' },
  { key: 'futureExpectations', label: 'Onde você espera estar profissionalmente nos próximos anos?' },
];

export function Step7Profile({ errors }: { errors: Errors }) {
  const { tenant } = useTenant();
  const { data, updateSection } = useCandidateForm();
  const { profile } = data;

  const set = (key: keyof typeof profile, value: string) => {
    updateSection('profile', { ...profile, [key]: value });
  };

  const questions = QUESTIONS.map((q) =>
    q.key === 'whyWorkHere' ? { ...q, label: `Por que você gostaria de trabalhar na ${tenant.name}?` } : q
  );

  return (
    <StepShell title="Perfil profissional" description="Queremos te conhecer um pouco melhor.">
      {questions.map((q) => (
        <FormField key={q.key} label={q.label} htmlFor={q.key} required error={errors[`profile.${q.key}`]}>
          <Textarea
            id={q.key}
            value={profile[q.key]}
            onChange={(e) => set(q.key, e.target.value)}
            hasError={!!errors[`profile.${q.key}`]}
            maxLength={PROFILE_MAX_LENGTH}
            showCount
            rows={4}
          />
        </FormField>
      ))}
    </StepShell>
  );
}
