import { Info } from 'lucide-react';
import { useCandidateForm } from '@/context/FormContext';
import { FileUpload } from '@/components/ui/FileUpload';
import type { Errors } from '../validation';
import { StepShell } from './StepShell';

export function Step8Resume({ errors }: { errors: Errors }) {
  const { resumeFile, setResumeFile } = useCandidateForm();

  return (
    <StepShell
      title="Currículo"
      description="O envio do currículo é opcional — o formulário já reúne suas principais informações profissionais."
    >
      <FileUpload file={resumeFile} onChange={setResumeFile} error={errors['resume']} />
      <div className="flex items-start gap-2 rounded-lg bg-neutral-100 p-3 text-xs text-neutral-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          Caso você atualize a página, será necessário anexar o arquivo novamente. Os demais dados
          preenchidos ficam salvos automaticamente no seu navegador.
        </p>
      </div>
    </StepShell>
  );
}
