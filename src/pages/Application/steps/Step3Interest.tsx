import { useCandidateForm } from '@/context/FormContext';
import { FormField } from '@/components/ui/FormField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { ChipMultiSelect } from '@/components/ui/ChipMultiSelect';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { JOB_AREAS } from '@/data/jobAreas';
import type { JobAreaId } from '@/types/candidate';
import type { Errors } from '../validation';
import { StepShell } from './StepShell';
import { YES_NO_OPTIONS } from './options';

export function Step3Interest({ errors }: { errors: Errors }) {
  const { data, updateSection } = useCandidateForm();
  const { interest } = data;

  const set = <K extends keyof typeof interest>(key: K, value: (typeof interest)[K]) => {
    updateSection('interest', { ...interest, [key]: value });
  };

  const selectedAreaOptions = JOB_AREAS.filter((area) => interest.areas.includes(area.id));

  return (
    <StepShell title="Área de interesse" description="Selecione as áreas em que você gostaria de atuar.">
      <FormField label="Quais áreas têm o seu interesse?" required error={errors['interest.areas']}>
        <ChipMultiSelect
          options={JOB_AREAS.map((a) => ({ value: a.id, label: a.label }))}
          selected={interest.areas}
          onChange={(values) => set('areas', values as JobAreaId[])}
        />
      </FormField>

      {interest.areas.includes('outra') && (
        <FormField label="Descreva a outra área de interesse" htmlFor="otherAreaDescription">
          <Input
            id="otherAreaDescription"
            value={interest.otherAreaDescription ?? ''}
            onChange={(e) => set('otherAreaDescription', e.target.value)}
          />
        </FormField>
      )}

      <FormField
        label="Qual é a área de maior interesse?"
        htmlFor="mainAreaOfInterest"
        required
        error={errors['interest.mainAreaOfInterest']}
      >
        <Select
          id="mainAreaOfInterest"
          value={interest.mainAreaOfInterest}
          onChange={(e) => set('mainAreaOfInterest', e.target.value as JobAreaId)}
          hasError={!!errors['interest.mainAreaOfInterest']}
        >
          <option value="">Selecione</option>
          {(selectedAreaOptions.length ? selectedAreaOptions : JOB_AREAS).map((area) => (
            <option key={area.id} value={area.id}>
              {area.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Aceitaria trabalhar em outra função?" required error={errors['interest.acceptsOtherRole']}>
        <RadioGroup
          name="acceptsOtherRole"
          options={YES_NO_OPTIONS}
          value={interest.acceptsOtherRole}
          onChange={(value) => set('acceptsOtherRole', value as typeof interest.acceptsOtherRole)}
          hasError={!!errors['interest.acceptsOtherRole']}
        />
      </FormField>

      <FormField label="Está buscando o primeiro emprego?" required error={errors['interest.isFirstJob']}>
        <RadioGroup
          name="isFirstJob"
          options={YES_NO_OPTIONS}
          value={interest.isFirstJob}
          onChange={(value) => set('isFirstJob', value as typeof interest.isFirstJob)}
          hasError={!!errors['interest.isFirstJob']}
        />
      </FormField>
    </StepShell>
  );
}
