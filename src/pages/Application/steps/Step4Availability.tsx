import { useCandidateForm } from '@/context/FormContext';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Input } from '@/components/ui/Input';
import type { Errors } from '../validation';
import { StepShell } from './StepShell';
import { YES_NO_OPTIONS } from './options';

export function Step4Availability({ errors }: { errors: Errors }) {
  const { data, updateSection } = useCandidateForm();
  const { availability } = data;

  const set = <K extends keyof typeof availability>(key: K, value: (typeof availability)[K]) => {
    updateSection('availability', { ...availability, [key]: value });
  };

  return (
    <StepShell title="Disponibilidade" description="Nos conte quando você pode trabalhar.">
      <FormField label="Períodos e turnos disponíveis" required error={errors['availability.periods']}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox
            id="morning"
            label="Manhã"
            checked={availability.morning}
            onChange={(e) => set('morning', e.target.checked)}
          />
          <Checkbox
            id="afternoon"
            label="Tarde"
            checked={availability.afternoon}
            onChange={(e) => set('afternoon', e.target.checked)}
          />
          <Checkbox
            id="night"
            label="Noite"
            checked={availability.night}
            onChange={(e) => set('night', e.target.checked)}
          />
          <Checkbox
            id="fullTime"
            label="Horário integral"
            checked={availability.fullTime}
            onChange={(e) => set('fullTime', e.target.checked)}
          />
        </div>
      </FormField>

      <FormField label="Disponibilidade adicional">
        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox
            id="saturdays"
            label="Sábados"
            checked={availability.saturdays}
            onChange={(e) => set('saturdays', e.target.checked)}
          />
          <Checkbox
            id="sundays"
            label="Domingos"
            checked={availability.sundays}
            onChange={(e) => set('sundays', e.target.checked)}
          />
          <Checkbox
            id="holidays"
            label="Feriados"
            checked={availability.holidays}
            onChange={(e) => set('holidays', e.target.checked)}
          />
          <Checkbox
            id="shiftWork"
            label="Trabalhar por escala"
            checked={availability.shiftWork}
            onChange={(e) => set('shiftWork', e.target.checked)}
          />
        </div>
      </FormField>

      <FormField
        label="Pode iniciar imediatamente?"
        required
        error={errors['availability.canStartImmediately']}
      >
        <RadioGroup
          name="canStartImmediately"
          options={YES_NO_OPTIONS}
          value={availability.canStartImmediately}
          onChange={(value) => set('canStartImmediately', value as typeof availability.canStartImmediately)}
          hasError={!!errors['availability.canStartImmediately']}
        />
      </FormField>

      {availability.canStartImmediately === 'nao' && (
        <FormField
          label="Informe a data estimada para início"
          htmlFor="estimatedStartDate"
          required
          error={errors['availability.estimatedStartDate']}
        >
          <Input
            id="estimatedStartDate"
            type="date"
            value={availability.estimatedStartDate ?? ''}
            onChange={(e) => set('estimatedStartDate', e.target.value)}
            hasError={!!errors['availability.estimatedStartDate']}
          />
        </FormField>
      )}

      <FormField
        label="Possui disponibilidade para realizar horas extras quando necessário?"
        required
        error={errors['availability.availableForOvertime']}
      >
        <RadioGroup
          name="availableForOvertime"
          options={YES_NO_OPTIONS}
          value={availability.availableForOvertime}
          onChange={(value) => set('availableForOvertime', value as typeof availability.availableForOvertime)}
          hasError={!!errors['availability.availableForOvertime']}
        />
      </FormField>
    </StepShell>
  );
}
