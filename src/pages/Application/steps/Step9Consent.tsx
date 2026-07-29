import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useCandidateForm } from '@/context/FormContext';
import { useTenant } from '@/context/TenantContext';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Errors } from '../validation';
import { StepShell } from './StepShell';

export function Step9Consent({ errors }: { errors: Errors }) {
  const { tenant } = useTenant();
  const { data, updateSection } = useCandidateForm();
  const { consent } = data;

  const set = <K extends keyof typeof consent>(key: K, value: (typeof consent)[K]) => {
    updateSection('consent', { ...consent, [key]: value });
  };

  return (
    <StepShell title="Consentimento" description="Última etapa antes de enviar sua pré-candidatura.">
      <div
        className="flex items-start gap-3 rounded-xl2 border p-4"
        style={{ borderColor: `${tenant.primaryColor}55`, backgroundColor: `${tenant.primaryColor}0d` }}
      >
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: tenant.primaryColor }} aria-hidden="true" />
        <p className="text-sm" style={{ color: tenant.primaryColor }}>
          Seus dados não serão vendidos nem utilizados para fins de publicidade. As informações são
          usadas exclusivamente pela equipe de recrutamento da {tenant.name}. Saiba mais na{' '}
          <Link to={`/${tenant.slug}/politica-de-privacidade`} target="_blank" className="font-semibold underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Checkbox
          id="confirmsTruthfulness"
          label="Confirmo que as informações fornecidas são verdadeiras."
          checked={consent.confirmsTruthfulness}
          onChange={(e) => set('confirmsTruthfulness', e.target.checked)}
        />
        {errors['consent.confirmsTruthfulness'] && (
          <p className="text-xs font-medium text-red-600">{errors['consent.confirmsTruthfulness']}</p>
        )}

        <Checkbox
          id="authorizesDataProcessing"
          label={`Autorizo o tratamento dos meus dados exclusivamente para processos de recrutamento, seleção e formação de banco de talentos da ${tenant.name}.`}
          checked={consent.authorizesDataProcessing}
          onChange={(e) => set('authorizesDataProcessing', e.target.checked)}
        />
        {errors['consent.authorizesDataProcessing'] && (
          <p className="text-xs font-medium text-red-600">{errors['consent.authorizesDataProcessing']}</p>
        )}
      </div>
    </StepShell>
  );
}
