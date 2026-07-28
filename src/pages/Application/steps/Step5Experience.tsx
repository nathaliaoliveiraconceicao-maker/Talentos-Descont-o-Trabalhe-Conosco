import { Plus, Trash2 } from 'lucide-react';
import { useCandidateForm } from '@/context/FormContext';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { PhoneInput } from '@/components/ui/PhoneInput';
import type { WorkExperience } from '@/types/candidate';
import type { Errors } from '../validation';
import { StepShell } from './StepShell';
import { YES_NO_OPTIONS } from './options';

const MAX_EXPERIENCES = 5;

function newExperience(): WorkExperience {
  return {
    id: crypto.randomUUID(),
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    isCurrentJob: false,
    activities: '',
    leavingReason: '',
    referenceName: '',
    referencePhone: '',
    allowContactReference: false,
  };
}

export function Step5Experience({ errors }: { errors: Errors }) {
  const { data, updateSection } = useCandidateForm();
  const { experience } = data;

  const set = <K extends keyof typeof experience>(key: K, value: (typeof experience)[K]) => {
    updateSection('experience', { ...experience, [key]: value });
  };

  const updateExperience = (id: string, patch: Partial<WorkExperience>) => {
    set(
      'experiences',
      experience.experiences.map((exp) => (exp.id === id ? { ...exp, ...patch } : exp))
    );
  };

  const addExperience = () => {
    if (experience.experiences.length >= MAX_EXPERIENCES) return;
    set('experiences', [...experience.experiences, newExperience()]);
  };

  const removeExperience = (id: string) => {
    set('experiences', experience.experiences.filter((exp) => exp.id !== id));
  };

  const booleanQuestions: { key: keyof typeof experience; label: string }[] = [
    { key: 'workedInSupermarket', label: 'Já trabalhou em supermercado?' },
    { key: 'workedInRetail', label: 'Já trabalhou em comércio?' },
    { key: 'hasCustomerServiceExperience', label: 'Possui experiência com atendimento ao público?' },
    { key: 'hasCashierExperience', label: 'Possui experiência como operador de caixa?' },
    { key: 'hasRestockingExperience', label: 'Possui experiência com reposição?' },
    { key: 'hasStockExperience', label: 'Possui experiência em estoque?' },
    { key: 'hasButcherExperience', label: 'Possui experiência em açougue?' },
    { key: 'hasBakeryExperience', label: 'Possui experiência em padaria?' },
    { key: 'hasLeadershipExperience', label: 'Possui experiência em liderança?' },
  ];

  return (
    <StepShell title="Experiência profissional" description="Conte um pouco sobre sua trajetória.">
      <FormField label="Você já trabalhou anteriormente?" required error={errors['experience.hasWorkedBefore']}>
        <RadioGroup
          name="hasWorkedBefore"
          options={[
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não, estou buscando minha primeira oportunidade' },
          ]}
          value={experience.hasWorkedBefore}
          onChange={(value) => set('hasWorkedBefore', value as typeof experience.hasWorkedBefore)}
          hasError={!!errors['experience.hasWorkedBefore']}
        />
      </FormField>

      {experience.hasWorkedBefore === 'sim' && (
        <>
          <div className="flex flex-col gap-4">
            {errors['experience.experiences'] && (
              <p className="text-xs font-medium text-red-600">{errors['experience.experiences']}</p>
            )}
            {experience.experiences.map((exp, index) => (
              <Card key={exp.id} className="border-neutral-200">
                <CardBody className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-neutral-800">Experiência {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remover
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Nome da empresa"
                      htmlFor={`company-${exp.id}`}
                      required
                      error={errors[`experience.exp.${exp.id}.company`]}
                    >
                      <Input
                        id={`company-${exp.id}`}
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        hasError={!!errors[`experience.exp.${exp.id}.company`]}
                      />
                    </FormField>
                    <FormField
                      label="Cargo ou função"
                      htmlFor={`role-${exp.id}`}
                      required
                      error={errors[`experience.exp.${exp.id}.role`]}
                    >
                      <Input
                        id={`role-${exp.id}`}
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                        hasError={!!errors[`experience.exp.${exp.id}.role`]}
                      />
                    </FormField>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Data de entrada"
                      htmlFor={`startDate-${exp.id}`}
                      required
                      error={errors[`experience.exp.${exp.id}.startDate`]}
                    >
                      <Input
                        id={`startDate-${exp.id}`}
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                        hasError={!!errors[`experience.exp.${exp.id}.startDate`]}
                      />
                    </FormField>
                    <FormField
                      label="Data de saída"
                      htmlFor={`endDate-${exp.id}`}
                      required={!exp.isCurrentJob}
                      error={errors[`experience.exp.${exp.id}.endDate`]}
                    >
                      <Input
                        id={`endDate-${exp.id}`}
                        type="date"
                        value={exp.endDate}
                        disabled={exp.isCurrentJob}
                        onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                        hasError={!!errors[`experience.exp.${exp.id}.endDate`]}
                      />
                    </FormField>
                  </div>

                  <Checkbox
                    id={`current-${exp.id}`}
                    label="Este é meu emprego atual"
                    checked={exp.isCurrentJob}
                    onChange={(e) =>
                      updateExperience(exp.id, { isCurrentJob: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })
                    }
                  />

                  <FormField
                    label="Principais atividades"
                    htmlFor={`activities-${exp.id}`}
                    required
                    error={errors[`experience.exp.${exp.id}.activities`]}
                  >
                    <Textarea
                      id={`activities-${exp.id}`}
                      value={exp.activities}
                      onChange={(e) => updateExperience(exp.id, { activities: e.target.value })}
                      hasError={!!errors[`experience.exp.${exp.id}.activities`]}
                      maxLength={400}
                      showCount
                    />
                  </FormField>

                  <FormField label="Motivo da saída" htmlFor={`leavingReason-${exp.id}`}>
                    <Input
                      id={`leavingReason-${exp.id}`}
                      value={exp.leavingReason}
                      onChange={(e) => updateExperience(exp.id, { leavingReason: e.target.value })}
                    />
                  </FormField>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Nome de referência profissional" htmlFor={`refName-${exp.id}`}>
                      <Input
                        id={`refName-${exp.id}`}
                        value={exp.referenceName ?? ''}
                        onChange={(e) => updateExperience(exp.id, { referenceName: e.target.value })}
                      />
                    </FormField>
                    <FormField label="Telefone de referência" htmlFor={`refPhone-${exp.id}`}>
                      <PhoneInput
                        id={`refPhone-${exp.id}`}
                        value={exp.referencePhone ?? ''}
                        onChange={(value) => updateExperience(exp.id, { referencePhone: value })}
                      />
                    </FormField>
                  </div>

                  <Checkbox
                    id={`allowContact-${exp.id}`}
                    label="Autorizo entrar em contato com essa referência"
                    checked={exp.allowContactReference}
                    onChange={(e) => updateExperience(exp.id, { allowContactReference: e.target.checked })}
                  />
                </CardBody>
              </Card>
            ))}
          </div>

          {experience.experiences.length < MAX_EXPERIENCES && (
            <Button type="button" variant="outline" onClick={addExperience} className="self-start">
              <Plus className="h-4 w-4" /> Adicionar experiência
            </Button>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {booleanQuestions.map((q) => (
              <FormField key={q.key} label={q.label} required error={errors[`experience.${q.key}`]}>
                <RadioGroup
                  name={q.key}
                  options={YES_NO_OPTIONS}
                  value={experience[q.key] as string}
                  onChange={(value) => set(q.key, value as never)}
                  hasError={!!errors[`experience.${q.key}`]}
                />
              </FormField>
            ))}
          </div>

          <FormField label="Em qual área possui mais experiência?" htmlFor="mostExperiencedArea">
            <Input
              id="mostExperiencedArea"
              value={experience.mostExperiencedArea ?? ''}
              onChange={(e) => set('mostExperiencedArea', e.target.value)}
            />
          </FormField>
        </>
      )}
    </StepShell>
  );
}
