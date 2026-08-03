import { createContext, useContext, useState, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { emptyCandidateFormData, type CandidateFormData } from '@/types/candidate';

interface FormContextValue {
  data: CandidateFormData;
  updateSection: <K extends keyof CandidateFormData>(section: K, value: CandidateFormData[K]) => void;
  currentStep: number;
  /**
   * Sem limite superior fixo aqui de propósito — o número de etapas varia
   * por tenant (a etapa "Perfil comportamental" só existe quando a triagem
   * está ativa), então quem chama decide o teto real (ver ApplicationForm.tsx).
   */
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

interface FormProviderProps {
  tenantSlug: string;
  children: ReactNode;
}

export function FormProvider({ tenantSlug, children }: FormProviderProps) {
  const [data, setData] = useLocalStorage<CandidateFormData>(
    `${tenantSlug}:pre-candidatura:rascunho`,
    emptyCandidateFormData
  );
  const [currentStep, setCurrentStep] = useLocalStorage<number>(`${tenantSlug}:pre-candidatura:etapa`, 1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const updateSection: FormContextValue['updateSection'] = (section, value) => {
    setData((prev) => ({ ...prev, [section]: value }));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(step, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  const resetForm = () => {
    setData(emptyCandidateFormData);
    setCurrentStep(1);
    setResumeFile(null);
  };

  return (
    <FormContext.Provider
      value={{ data, updateSection, currentStep, goToStep, nextStep, prevStep, resetForm, resumeFile, setResumeFile }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useCandidateForm(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useCandidateForm deve ser usado dentro de um FormProvider');
  return ctx;
}
