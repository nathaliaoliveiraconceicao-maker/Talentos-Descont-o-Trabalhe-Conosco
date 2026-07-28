import { createContext, useContext, useState, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { emptyCandidateFormData, type CandidateFormData } from '@/types/candidate';

const STORAGE_KEY = 'descontao:pre-candidatura:rascunho';
const STEP_STORAGE_KEY = 'descontao:pre-candidatura:etapa';

export const TOTAL_STEPS = 9;

interface FormContextValue {
  data: CandidateFormData;
  updateSection: <K extends keyof CandidateFormData>(section: K, value: CandidateFormData[K]) => void;
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useLocalStorage<CandidateFormData>(STORAGE_KEY, emptyCandidateFormData);
  const [currentStep, setCurrentStep] = useLocalStorage<number>(STEP_STORAGE_KEY, 1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const updateSection: FormContextValue['updateSection'] = (section, value) => {
    setData((prev) => ({ ...prev, [section]: value }));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), TOTAL_STEPS));
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
