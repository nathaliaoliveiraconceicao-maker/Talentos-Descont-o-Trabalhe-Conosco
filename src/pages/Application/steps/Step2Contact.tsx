import { useCandidateForm } from '@/context/FormContext';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { RadioGroup } from '@/components/ui/RadioGroup';
import type { Errors } from '../validation';
import { StepShell } from './StepShell';
import { CONTACT_PREFERENCE_OPTIONS } from './options';

export function Step2Contact({ errors }: { errors: Errors }) {
  const { data, updateSection } = useCandidateForm();
  const { contact } = data;

  const set = <K extends keyof typeof contact>(key: K, value: (typeof contact)[K]) => {
    updateSection('contact', { ...contact, [key]: value });
  };

  return (
    <StepShell title="Contato" description="Como podemos falar com você sobre o processo seletivo?">
      <FormField label="WhatsApp (com DDD)" htmlFor="whatsapp" required error={errors['contact.whatsapp']}>
        <PhoneInput
          id="whatsapp"
          value={contact.whatsapp}
          onChange={(value) => set('whatsapp', value)}
          hasError={!!errors['contact.whatsapp']}
          placeholder="(11) 91234-5678"
        />
      </FormField>

      <FormField label="Telefone alternativo" htmlFor="alternatePhone" error={errors['contact.alternatePhone']}>
        <PhoneInput
          id="alternatePhone"
          value={contact.alternatePhone ?? ''}
          onChange={(value) => set('alternatePhone', value)}
          hasError={!!errors['contact.alternatePhone']}
          placeholder="(11) 3456-7890"
        />
      </FormField>

      <FormField label="E-mail" htmlFor="email" required error={errors['contact.email']}>
        <Input
          id="email"
          type="email"
          value={contact.email}
          onChange={(e) => set('email', e.target.value)}
          hasError={!!errors['contact.email']}
          autoComplete="email"
          placeholder="voce@exemplo.com"
        />
      </FormField>

      <FormField
        label="Qual a melhor forma de contato?"
        required
        error={errors['contact.contactPreference']}
      >
        <RadioGroup
          name="contactPreference"
          options={CONTACT_PREFERENCE_OPTIONS}
          value={contact.contactPreference}
          onChange={(value) => set('contactPreference', value as typeof contact.contactPreference)}
          hasError={!!errors['contact.contactPreference']}
        />
      </FormField>
    </StepShell>
  );
}
