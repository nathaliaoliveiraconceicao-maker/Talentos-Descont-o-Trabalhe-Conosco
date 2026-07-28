import { useCandidateForm } from '@/context/FormContext';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { EDUCATION_LEVELS } from '@/data/educationLevels';
import type { EducationLevel } from '@/types/candidate';
import type { Errors } from '../validation';
import { StepShell } from './StepShell';

export function Step6Education({ errors }: { errors: Errors }) {
  const { data, updateSection } = useCandidateForm();
  const { education } = data;

  const set = <K extends keyof typeof education>(key: K, value: (typeof education)[K]) => {
    updateSection('education', { ...education, [key]: value });
  };

  return (
    <StepShell title="Escolaridade e cursos" description="Nos conte sobre sua formação e qualificações.">
      <FormField label="Escolaridade" htmlFor="educationLevel" required error={errors['education.educationLevel']}>
        <Select
          id="educationLevel"
          value={education.educationLevel}
          onChange={(e) => set('educationLevel', e.target.value as EducationLevel)}
          hasError={!!errors['education.educationLevel']}
        >
          <option value="">Selecione</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level.id} value={level.id}>
              {level.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Instituição de ensino" htmlFor="institution">
        <Input
          id="institution"
          value={education.institution ?? ''}
          onChange={(e) => set('institution', e.target.value)}
        />
      </FormField>

      <FormField label="Curso técnico" htmlFor="technicalCourse">
        <Input
          id="technicalCourse"
          value={education.technicalCourse ?? ''}
          onChange={(e) => set('technicalCourse', e.target.value)}
        />
      </FormField>

      <FormField label="Cursos profissionalizantes" htmlFor="professionalCourses">
        <Textarea
          id="professionalCourses"
          value={education.professionalCourses ?? ''}
          onChange={(e) => set('professionalCourses', e.target.value)}
          rows={3}
        />
      </FormField>

      <FormField label="Certificações" htmlFor="certifications">
        <Textarea
          id="certifications"
          value={education.certifications ?? ''}
          onChange={(e) => set('certifications', e.target.value)}
          rows={3}
        />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-3">
        <Checkbox
          id="basicComputerSkills"
          label="Informática básica"
          checked={education.basicComputerSkills}
          onChange={(e) => set('basicComputerSkills', e.target.checked)}
        />
        <Checkbox
          id="officePackage"
          label="Pacote Office"
          checked={education.officePackage}
          onChange={(e) => set('officePackage', e.target.checked)}
        />
        <Checkbox
          id="posSystemsExperience"
          label="Sistemas de caixa ou frente de loja"
          checked={education.posSystemsExperience}
          onChange={(e) => set('posSystemsExperience', e.target.checked)}
        />
      </div>

      <FormField label="Outras habilidades" htmlFor="otherSkills">
        <Textarea
          id="otherSkills"
          value={education.otherSkills ?? ''}
          onChange={(e) => set('otherSkills', e.target.value)}
          rows={3}
        />
      </FormField>
    </StepShell>
  );
}
