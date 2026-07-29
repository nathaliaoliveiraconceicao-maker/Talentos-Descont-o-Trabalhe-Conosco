import { useEffect, useState } from 'react';
import { CheckCircle2, Save, Sparkles } from 'lucide-react';
import { DEFAULT_PLANS, listPlans, savePlan } from '@/lib/plansApi';
import type { Plan } from '@/types/plan';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner } from '@/components/ui/Spinner';

export function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setPlans(await listPlans());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updatePlan = (planId: string, patch: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.planId === planId ? { ...p, ...patch } : p)));
  };

  const handleSave = async (plan: Plan) => {
    setSavingId(plan.planId);
    try {
      await savePlan(plan);
      setSavedMessage(`Plano "${plan.name}" salvo com sucesso.`);
      setTimeout(() => setSavedMessage(null), 4000);
    } finally {
      setSavingId(null);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      await Promise.all(DEFAULT_PLANS.map((p) => savePlan(p)));
      await load();
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <Spinner label="Carregando planos…" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Planos</h1>
          <p className="text-sm text-neutral-500">Limites e recursos disponíveis em cada plano.</p>
        </div>
        {plans.length === 0 && (
          <Button variant="outline" onClick={handleSeedDefaults} loading={seeding}>
            <Sparkles className="h-4 w-4" /> Criar planos padrão
          </Button>
        )}
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-green-50 p-3 text-sm text-brand-green-800">
          <CheckCircle2 className="h-4 w-4" /> {savedMessage}
        </div>
      )}

      {plans.length === 0 && (
        <Card>
          <CardBody className="py-10 text-center text-sm text-neutral-500">
            Nenhum plano cadastrado ainda. Clique em "Criar planos padrão" para começar com sugestões
            (Starter, Pro, Enterprise), ou cadastre um novo diretamente no Firestore em{' '}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5">plans/{'{planId}'}</code>.
          </CardBody>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.planId}>
            <CardHeader>
              <h2 className="font-bold text-neutral-800">{plan.name}</h2>
              <p className="text-xs text-neutral-400">{plan.planId}</p>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Nome" htmlFor={`name-${plan.planId}`}>
                  <Input
                    id={`name-${plan.planId}`}
                    value={plan.name}
                    onChange={(e) => updatePlan(plan.planId, { name: e.target.value })}
                  />
                </FormField>
                <FormField label="Preço (R$)" htmlFor={`price-${plan.planId}`}>
                  <Input
                    id={`price-${plan.planId}`}
                    type="number"
                    min={0}
                    value={plan.price}
                    onChange={(e) => updatePlan(plan.planId, { price: Number(e.target.value) })}
                  />
                </FormField>
                <FormField label="Periodicidade" htmlFor={`period-${plan.planId}`}>
                  <Select
                    id={`period-${plan.planId}`}
                    value={plan.billingPeriod}
                    onChange={(e) => updatePlan(plan.planId, { billingPeriod: e.target.value as Plan['billingPeriod'] })}
                  >
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </Select>
                </FormField>
                <FormField label="Máx. usuários" htmlFor={`maxUsers-${plan.planId}`}>
                  <Input
                    id={`maxUsers-${plan.planId}`}
                    type="number"
                    min={1}
                    value={plan.maxUsers}
                    onChange={(e) => updatePlan(plan.planId, { maxUsers: Number(e.target.value) })}
                  />
                </FormField>
                <FormField label="Máx. filiais" htmlFor={`maxBranches-${plan.planId}`}>
                  <Input
                    id={`maxBranches-${plan.planId}`}
                    type="number"
                    min={1}
                    value={plan.maxBranches}
                    onChange={(e) => updatePlan(plan.planId, { maxBranches: Number(e.target.value) })}
                  />
                </FormField>
                <FormField label="Máx. candidatos/mês" htmlFor={`maxCandidates-${plan.planId}`}>
                  <Input
                    id={`maxCandidates-${plan.planId}`}
                    type="number"
                    min={1}
                    value={plan.maxCandidatesPerMonth}
                    onChange={(e) => updatePlan(plan.planId, { maxCandidatesPerMonth: Number(e.target.value) })}
                  />
                </FormField>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Checkbox
                  id={`reports-${plan.planId}`}
                  label="Relatórios"
                  checked={plan.reportsEnabled}
                  onChange={(e) => updatePlan(plan.planId, { reportsEnabled: e.target.checked })}
                />
                <Checkbox
                  id={`csv-${plan.planId}`}
                  label="Exportação CSV"
                  checked={plan.csvExportEnabled}
                  onChange={(e) => updatePlan(plan.planId, { csvExportEnabled: e.target.checked })}
                />
                <Checkbox
                  id={`scoring-${plan.planId}`}
                  label="Pontuação automática"
                  checked={plan.scoringEnabled}
                  onChange={(e) => updatePlan(plan.planId, { scoringEnabled: e.target.checked })}
                />
                <Checkbox
                  id={`talentBank-${plan.planId}`}
                  label="Banco de talentos"
                  checked={plan.talentBankEnabled}
                  onChange={(e) => updatePlan(plan.planId, { talentBankEnabled: e.target.checked })}
                />
                <Checkbox
                  id={`domain-${plan.planId}`}
                  label="Domínio próprio"
                  checked={plan.customDomainEnabled}
                  onChange={(e) => updatePlan(plan.planId, { customDomainEnabled: e.target.checked })}
                />
                <Checkbox
                  id={`active-${plan.planId}`}
                  label="Plano ativo (disponível para venda)"
                  checked={plan.active}
                  onChange={(e) => updatePlan(plan.planId, { active: e.target.checked })}
                />
              </div>
              <Button onClick={() => handleSave(plan)} loading={savingId === plan.planId} className="self-start">
                <Save className="h-4 w-4" /> Salvar plano
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
