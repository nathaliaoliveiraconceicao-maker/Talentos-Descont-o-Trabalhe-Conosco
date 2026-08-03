import { ShieldCheck } from 'lucide-react';
import { useCandidateForm } from '@/context/FormContext';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import {
  BEHAVIORAL_PROFILE_POLICY_VERSION,
  LIFE_WHEEL_KEYS,
  LIFE_WHEEL_LABELS,
  type BehavioralScreeningSettings,
  type BehavioralProfile,
  type LifeWheelAnswer,
} from '@/types/behavioralProfile';
import type { Errors } from '../validation';
import {
  BEHAVIORAL_TEXT_MAX_LENGTH,
  EMOTIONAL_BALANCE_CONTEXT_MAX_LENGTH,
  THREE_WORDS_MAX_LENGTH,
  WORK_ANIMAL_MAX_LENGTH,
} from '../validation';
import { StepShell } from './StepShell';

const EMOTIONAL_BALANCE_OPTIONS = [
  { value: '1', label: '1 — Muito difícil' },
  { value: '2', label: '2 — Difícil' },
  { value: '3', label: '3 — Regular' },
  { value: '4', label: '4 — Bom' },
  { value: '5', label: '5 — Muito bom' },
];

const LIFE_WHEEL_OPTIONS = Array.from({ length: 11 }, (_, n) => ({ value: String(n), label: String(n) }));

function sanitizeWord(raw: string): string {
  return raw
    .replace(/[0-9]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, THREE_WORDS_MAX_LENGTH);
}

export function StepBehavioral({ errors, settings }: { errors: Errors; settings: BehavioralScreeningSettings }) {
  const { data, updateSection } = useCandidateForm();
  const bp = data.behavioralProfile ?? {};
  const consent = data.behavioralProfileConsent;

  const setProfile = (patch: Partial<BehavioralProfile>) => {
    updateSection('behavioralProfile', { ...bp, ...patch });
  };

  const setConsent = (accepted: boolean) => {
    updateSection(
      'behavioralProfileConsent',
      accepted
        ? { accepted: true, acceptedAt: new Date().toISOString(), policyVersion: BEHAVIORAL_PROFILE_POLICY_VERSION }
        : { accepted: false, acceptedAt: '', policyVersion: BEHAVIORAL_PROFILE_POLICY_VERSION }
    );
  };

  const setThreeWord = (key: 'word1' | 'word2' | 'word3', value: string) => {
    const threeWords = { word1: '', word2: '', word3: '', ...bp.threeWords, [key]: sanitizeWord(value) };
    setProfile({ threeWords });
  };

  const setLifeWheelValue = (key: keyof LifeWheelAnswer, value: number) => {
    const base: LifeWheelAnswer = {
      personalFamilyLife: 0,
      physicalHealth: 0,
      emotionalHealth: 0,
      previousWorkEnvironment: 0,
      interpersonalRelationships: 0,
      professionalMotivation: 0,
      ...bp.lifeWheel,
      [key]: value,
    };
    setProfile({ lifeWheel: base });
  };

  const showFirstJobHint = data.interest.isFirstJob === 'sim';

  return (
    <StepShell
      title="Perfil comportamental"
      description="Queremos conhecer um pouco melhor a sua forma de lidar com situações do dia a dia profissional. Não existem respostas certas ou erradas. Responda com sinceridade."
    >
      <div className="flex items-start gap-3 rounded-xl2 border border-brand-lilac-200 bg-brand-lilac-50 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-lilac-700" aria-hidden="true" />
        <p className="text-sm text-brand-lilac-900">
          Estas perguntas serão utilizadas apenas como apoio ao processo seletivo. Elas não constituem avaliação
          psicológica, diagnóstico de saúde ou decisão automática sobre a candidatura.
        </p>
      </div>

      <Checkbox
        id="behavioralProfileConsent"
        label="Declaro que estou respondendo voluntariamente às perguntas de perfil comportamental e estou ciente de que as respostas serão utilizadas somente como apoio ao processo seletivo."
        checked={consent?.accepted ?? false}
        onChange={(e) => setConsent(e.target.checked)}
      />
      {errors['behavioralProfileConsent'] && (
        <p className="text-xs font-medium text-red-600">{errors['behavioralProfileConsent']}</p>
      )}

      {settings.threeWords.enabled && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-neutral-800">Como você se sente hoje?</h3>
            <p className="mt-1 text-xs text-neutral-500">Cite três palavras que definem como você se sente hoje.</p>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-3">
            <FormField
              label="Palavra 1"
              htmlFor="word1"
              required={settings.threeWords.required}
              error={errors['behavioralProfile.threeWords.word1']}
            >
              <Input
                id="word1"
                maxLength={THREE_WORDS_MAX_LENGTH}
                value={bp.threeWords?.word1 ?? ''}
                onChange={(e) => setThreeWord('word1', e.target.value)}
              />
            </FormField>
            <FormField
              label="Palavra 2"
              htmlFor="word2"
              required={settings.threeWords.required}
              error={errors['behavioralProfile.threeWords.word2']}
            >
              <Input
                id="word2"
                maxLength={THREE_WORDS_MAX_LENGTH}
                value={bp.threeWords?.word2 ?? ''}
                onChange={(e) => setThreeWord('word2', e.target.value)}
              />
            </FormField>
            <FormField
              label="Palavra 3"
              htmlFor="word3"
              required={settings.threeWords.required}
              error={errors['behavioralProfile.threeWords.word3']}
            >
              <Input
                id="word3"
                maxLength={THREE_WORDS_MAX_LENGTH}
                value={bp.threeWords?.word3 ?? ''}
                onChange={(e) => setThreeWord('word3', e.target.value)}
              />
            </FormField>
          </CardBody>
        </Card>
      )}

      {settings.emotionalBalance.enabled && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-neutral-800">Como você avalia seu momento atual?</h3>
            <p className="mt-1 text-xs text-neutral-500">
              De 1 a 5, como você avaliaria seu equilíbrio emocional nos últimos sete dias?
            </p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <FormField
              label="Nota"
              required={settings.emotionalBalance.required}
              error={errors['behavioralProfile.emotionalBalance.score']}
            >
              <RadioGroup
                name="emotionalBalanceScore"
                options={EMOTIONAL_BALANCE_OPTIONS}
                value={bp.emotionalBalance?.score ? String(bp.emotionalBalance.score) : ''}
                onChange={(value) => setProfile({ emotionalBalance: { context: '', ...bp.emotionalBalance, score: Number(value) } })}
                hasError={!!errors['behavioralProfile.emotionalBalance.score']}
              />
            </FormField>
            <FormField
              label="O que tem contribuído para essa nota?"
              htmlFor="emotionalBalanceContext"
              required={settings.emotionalBalance.required}
              error={errors['behavioralProfile.emotionalBalance.context']}
            >
              <Textarea
                id="emotionalBalanceContext"
                maxLength={EMOTIONAL_BALANCE_CONTEXT_MAX_LENGTH}
                showCount
                value={bp.emotionalBalance?.context ?? ''}
                onChange={(e) => setProfile({ emotionalBalance: { score: 0, ...bp.emotionalBalance, context: e.target.value } })}
              />
            </FormField>
            <p className="text-xs text-neutral-400">Esta resposta não representa diagnóstico ou avaliação clínica.</p>
          </CardBody>
        </Card>
      )}

      {settings.lifeWheel.enabled && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-neutral-800">Avaliação do momento atual</h3>
            <p className="mt-1 text-xs text-neutral-500">
              0 — Muito insatisfeito &nbsp;·&nbsp; 10 — Muito satisfeito
            </p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {LIFE_WHEEL_KEYS.map((key) => (
              <FormField
                key={key}
                label={LIFE_WHEEL_LABELS[key]}
                required={settings.lifeWheel.required}
                error={errors[`behavioralProfile.lifeWheel.${key}`]}
              >
                <RadioGroup
                  name={`lifeWheel-${key}`}
                  options={LIFE_WHEEL_OPTIONS}
                  value={bp.lifeWheel?.[key] != null ? String(bp.lifeWheel[key]) : ''}
                  onChange={(value) => setLifeWheelValue(key, Number(value))}
                  hasError={!!errors[`behavioralProfile.lifeWheel.${key}`]}
                />
              </FormField>
            ))}
          </CardBody>
        </Card>
      )}

      {settings.workAnimal.enabled && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-neutral-800">Quem sou eu no trabalho?</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Escolha um animal que represente você no ambiente de trabalho e explique por quê. Não existem respostas
              certas ou erradas. Utilize a comparação para explicar características do seu jeito de trabalhar.
            </p>
          </CardHeader>
          <CardBody>
            <FormField
              label="Sua resposta"
              htmlFor="workAnimal"
              required={settings.workAnimal.required}
              error={errors['behavioralProfile.workAnimal']}
            >
              <Textarea
                id="workAnimal"
                maxLength={WORK_ANIMAL_MAX_LENGTH}
                showCount
                value={bp.workAnimal?.answer ?? ''}
                onChange={(e) => setProfile({ workAnimal: { answer: e.target.value } })}
              />
            </FormField>
          </CardBody>
        </Card>
      )}

      {settings.constructiveFeedback.enabled && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-neutral-800">Recebimento de feedback</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Fale sobre um momento em que recebeu uma crítica construtiva no trabalho. Como reagiu e o que fez a
              partir daí?
            </p>
            {showFirstJobHint && (
              <p className="mt-1 text-xs text-neutral-500">
                Caso ainda não tenha experiência profissional, você pode contar uma situação da escola, curso,
                projeto, trabalho voluntário ou convivência em grupo.
              </p>
            )}
          </CardHeader>
          <CardBody>
            <FormField
              label="Sua resposta"
              htmlFor="constructiveFeedback"
              required={settings.constructiveFeedback.required}
              error={errors['behavioralProfile.constructiveFeedback']}
            >
              <Textarea
                id="constructiveFeedback"
                maxLength={BEHAVIORAL_TEXT_MAX_LENGTH}
                showCount
                value={bp.constructiveFeedback ?? ''}
                onChange={(e) => setProfile({ constructiveFeedback: e.target.value })}
              />
            </FormField>
          </CardBody>
        </Card>
      )}

      {settings.conflictManagement.enabled && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-neutral-800">Gestão de conflitos</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Você já enfrentou algum conflito com um colega ou líder? Como lidou com a situação?
            </p>
            {showFirstJobHint && (
              <p className="mt-1 text-xs text-neutral-500">
                Caso ainda não tenha trabalhado, você pode relatar uma situação em grupo, na escola, em curso, projeto
                ou trabalho voluntário.
              </p>
            )}
          </CardHeader>
          <CardBody>
            <FormField
              label="Sua resposta"
              htmlFor="conflictManagement"
              required={settings.conflictManagement.required}
              error={errors['behavioralProfile.conflictManagement']}
            >
              <Textarea
                id="conflictManagement"
                maxLength={BEHAVIORAL_TEXT_MAX_LENGTH}
                showCount
                value={bp.conflictManagement ?? ''}
                onChange={(e) => setProfile({ conflictManagement: e.target.value })}
              />
            </FormField>
          </CardBody>
        </Card>
      )}

      {settings.emotionalControl.enabled && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-neutral-800">Controle emocional</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Descreva uma ocasião em que precisou controlar suas emoções para manter um ambiente produtivo.
            </p>
          </CardHeader>
          <CardBody>
            <FormField
              label="Sua resposta"
              htmlFor="emotionalControl"
              required={settings.emotionalControl.required}
              error={errors['behavioralProfile.emotionalControl']}
            >
              <Textarea
                id="emotionalControl"
                maxLength={BEHAVIORAL_TEXT_MAX_LENGTH}
                showCount
                value={bp.emotionalControl ?? ''}
                onChange={(e) => setProfile({ emotionalControl: e.target.value })}
              />
            </FormField>
          </CardBody>
        </Card>
      )}
    </StepShell>
  );
}
