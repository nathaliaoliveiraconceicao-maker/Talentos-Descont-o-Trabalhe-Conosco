import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, Download, FileDown, Inbox } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCandidates } from '@/hooks/useCandidates';
import { useTenantJobs } from '@/hooks/useTenantJobs';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import {
  calculateFunnelRates,
  candidatesByArea,
  candidatesByAvailability,
  candidatesByEducation,
  candidatesByExperience,
  candidatesByFirstJob,
  candidatesByNeighborhood,
  candidatesByStatusChart,
  candidatesBySupermarketExperience,
  filterByDateRange,
} from '@/lib/dashboardStats';
import { candidatesToCsvRows, downloadCsv } from '@/lib/csvExport';
import { STATUS_LABELS } from '@/types/candidate';

const BLUE_SHADES = ['#146c94', '#1f84b0', '#3aa0c9', '#62b9db', '#9ad4eb', '#cdeaf5'];
const PIE_COLORS = ['#146c94', '#d32f2b'];

function MiniBarChart({ data, color }: { data: { name: string; value: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={55} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MiniPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={85} label>
          {data.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function Reports() {
  const { tenantId } = useAuth();
  const { candidates, loading, error } = useCandidates(tenantId ?? undefined);
  const jobs = useTenantJobs(tenantId);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(
    () => filterByDateRange(candidates, dateFrom, dateTo),
    [candidates, dateFrom, dateTo]
  );

  if (loading) return <Spinner label="Carregando relatórios…" />;
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="rounded-full bg-neutral-100 p-4 text-neutral-400">
            <Inbox className="h-8 w-8" />
          </span>
          <h2 className="text-lg font-bold text-neutral-700">Ainda não há dados para gerar relatórios</h2>
          <p className="max-w-sm text-sm text-neutral-500">
            Os relatórios serão gerados automaticamente assim que houver candidaturas recebidas.
          </p>
        </CardBody>
      </Card>
    );
  }

  const rates = calculateFunnelRates(filtered);
  const byArea = candidatesByArea(filtered, jobs);
  const byNeighborhood = candidatesByNeighborhood(filtered);
  const byEducation = candidatesByEducation(filtered);
  const byExperience = candidatesByExperience(filtered);
  const byFirstJob = candidatesByFirstJob(filtered);
  const bySupermarketExp = candidatesBySupermarketExperience(filtered);
  const byAvailability = candidatesByAvailability(filtered);
  const byStatus = candidatesByStatusChart(filtered, STATUS_LABELS);

  const exportCsv = (includeRestricted: boolean) => {
    const rows = candidatesToCsvRows(filtered, jobs, includeRestricted);
    const suffix = includeRestricted ? 'completo' : 'padrao';
    downloadCsv(`candidatos-${tenantId}-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Relatórios</h1>
        <p className="text-sm text-neutral-500">Estatísticas e exportação de candidaturas por período.</p>
      </div>

      <Card>
        <CardBody className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-neutral-500">Período — de</span>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-neutral-500">até</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" onClick={() => { setDateFrom(''); setDateTo(''); }}>
              Limpar período
            </Button>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => exportCsv(false)}>
              <Download className="h-4 w-4" /> Exportar CSV (padrão)
            </Button>
            <Button variant="outline" onClick={() => exportCsv(true)}>
              <FileDown className="h-4 w-4" /> Exportar CSV completo
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Candidaturas no período" value={filtered.length} icon={Inbox} accent="blue" />
        <StatCard label="Taxa de pré-seleção" value={`${rates.preSelectedRate}%`} icon={Inbox} accent="yellow" />
        <StatCard label="Taxa de entrevistas" value={`${rates.interviewRate}%`} icon={Inbox} accent="blue" />
        <StatCard label="Taxa de aprovação" value={`${rates.approvalRate}%`} icon={Inbox} accent="red" />
      </div>

      <p className="text-xs text-neutral-400">
        A exportação padrão não inclui observações internas nem avaliações do RH. Use a exportação
        completa apenas quando necessário e com o devido cuidado no manuseio dos dados.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Candidaturas por status</h2>
          </CardHeader>
          <CardBody className="h-72">
            <MiniBarChart data={byStatus} color="#146c94" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Candidatos por área</h2>
          </CardHeader>
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byArea} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {byArea.map((_, index) => (
                    <Cell key={index} fill={BLUE_SHADES[index % BLUE_SHADES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Candidatos por bairro (top 10)</h2>
          </CardHeader>
          <CardBody className="h-72">
            <MiniBarChart data={byNeighborhood} color="#d32f2b" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Candidatos por escolaridade</h2>
          </CardHeader>
          <CardBody className="h-72">
            <MiniBarChart data={byEducation} color="#f9ab0b" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Com ou sem experiência</h2>
          </CardHeader>
          <CardBody className="h-72">
            <MiniPieChart data={byExperience} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Buscando primeiro emprego</h2>
          </CardHeader>
          <CardBody className="h-72">
            <MiniPieChart data={byFirstJob} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Experiência em supermercado</h2>
          </CardHeader>
          <CardBody className="h-72">
            <MiniPieChart data={bySupermarketExp} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-neutral-800">Candidatos por disponibilidade</h2>
          </CardHeader>
          <CardBody className="h-72">
            <MiniBarChart data={byAvailability} color="#146c94" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
