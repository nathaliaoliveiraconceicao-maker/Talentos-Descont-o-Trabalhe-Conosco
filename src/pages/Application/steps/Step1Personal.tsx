import { useCandidateForm } from '@/context/FormContext';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { maskCpf } from '@/lib/masks';
import type { Errors } from '../validation';
import { StepShell } from './StepShell';
import { EASY_ACCESS_OPTIONS } from './options';

export function Step1Personal({ errors }: { errors: Errors }) {
  const { data, updateSection } = useCandidateForm();
  const { personal } = data;

  const set = <K extends keyof typeof personal>(key: K, value: (typeof personal)[K]) => {
    updateSection('personal', { ...personal, [key]: value });
  };

  return (
    <StepShell
      title="Dados pessoais"
      description="Vamos começar com algumas informações básicas sobre você."
    >
      <FormField label="Nome completo" htmlFor="fullName" required error={errors['personal.fullName']}>
        <Input
          id="fullName"
          value={personal.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          hasError={!!errors['personal.fullName']}
          autoComplete="name"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Data de nascimento" htmlFor="birthDate" required error={errors['personal.birthDate']}>
          <Input
            id="birthDate"
            type="date"
            value={personal.birthDate}
            onChange={(e) => set('birthDate', e.target.value)}
            hasError={!!errors['personal.birthDate']}
          />
        </FormField>

        <FormField label="CPF" htmlFor="cpf" error={errors['personal.cpf']} hint="Preenchimento não obrigatório nesta etapa.">
          <Input
            id="cpf"
            value={personal.cpf ?? ''}
            onChange={(e) => set('cpf', maskCpf(e.target.value))}
            hasError={!!errors['personal.cpf']}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Cidade" htmlFor="city" required error={errors['personal.city']}>
          <Input
            id="city"
            value={personal.city}
            onChange={(e) => set('city', e.target.value)}
            hasError={!!errors['personal.city']}
            autoComplete="address-level2"
          />
        </FormField>

        <FormField label="Bairro" htmlFor="neighborhood" required error={errors['personal.neighborhood']}>
          <Input
            id="neighborhood"
            value={personal.neighborhood}
            onChange={(e) => set('neighborhood', e.target.value)}
            hasError={!!errors['personal.neighborhood']}
          />
        </FormField>
      </div>

      <FormField label="Endereço resumido" htmlFor="addressSummary">
        <Input
          id="addressSummary"
          value={personal.addressSummary ?? ''}
          onChange={(e) => set('addressSummary', e.target.value)}
          placeholder="Ex.: Rua das Flores, próximo ao mercado central"
        />
      </FormField>

      <FormField label="Possui fácil acesso ao local de trabalho?" required error={errors['personal.hasEasyAccess']}>
        <RadioGroup
          name="hasEasyAccess"
          options={EASY_ACCESS_OPTIONS}
          value={personal.hasEasyAccess}
          onChange={(value) => set('hasEasyAccess', value as typeof personal.hasEasyAccess)}
          hasError={!!errors['personal.hasEasyAccess']}
        />
      </FormField>

      <FormField
        label="Possui alguma necessidade de acessibilidade para participar do processo seletivo?"
        htmlFor="accessibilityNeeds"
      >
        <Textarea
          id="accessibilityNeeds"
          value={personal.accessibilityNeeds ?? ''}
          onChange={(e) => set('accessibilityNeeds', e.target.value)}
          rows={3}
          placeholder="Se preferir, descreva aqui para que possamos adaptar o processo."
        />
      </FormField>
    </StepShell>
  );
}
