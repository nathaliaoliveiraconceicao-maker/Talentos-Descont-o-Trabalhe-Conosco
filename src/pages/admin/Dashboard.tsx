import { Link } from 'react-router-dom';
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
import {
  AlertCircle,
  Award,
  CalendarCheck,
  CalendarRange,
  ClipboardList,
  Inbox,
  LineChart,
  Sparkles,
  TrendingUp,
  UserX,
  Users,
  UserSearch,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCandidates } from '@/hooks/useCandidates';
import { useTenantJobs } from '@/hooks/useTenantJobs';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import {
  candidatesByArea,
  candidatesByAvailability,
  candidatesByExperience,
  candidatesByNeighborhood,
  countByStatus,
  countLastNDays,
  countThisMonth,
} from '@/lib/dashboardStats';

const BLUE_SHADES = ['#146c94', '#1f84b0', '#3aa0c9', '#62b9db', '#9ad4eb', '#cdeaf5'];
const PIE_COLORS = ['#146c94', '#d32f2b'];

export function Dashboard() {
  const { tenantId } = useAuth();
  const { candidates, loading, error } = useCandidates(tenantId ?? undefined);
  const jobs = useTenantJobs(tenantId);

  if (loading) return <Spinner label="Carregando dados do painel…" />;
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>
    );
  }

  const status = countByStatus(candidates);
  const last7Days = countLastNDays(candidates, 7);
  const thisMonth = countThisMonth(candidates);
  const byArea = candidatesByArea(candidates, jobs);
  const byNeighborhood = candidatesByNeighborhood(candidates);
  const byExperience = candidatesByExperience(candidates);
  const byAvailability = candidatesByAvailability(candidates);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
          <p className="text-sm text-neutral-500">Visão geral das candidaturas recebidas.</p>
        </div>
        <Link to="/app/relatorios">
          <Button variant="outline">
            <LineChart className="h-4 w-4" /> Ver relatórios completos
          </Button>
        </Link>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="rounded-full bg-neutral-100 p-4 text-neutral-400">
              <Inbox className="h-8 w-8" />
            </span>
            <h2 className="text-lg font-bold text-neutral-700">Nenhum candidato recebido ainda</h2>
            <p className="max-w-sm text-sm text-neutral-500">
              Assim que candidatos preencherem o formulário de pré-candidatura, os dados e gráficos
              aparecerão aqui automaticamente.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total de candidatos" value={status.total} icon={Users} accent="blue" />
            <StatCard label="Novas candidaturas" value={status.nova_candidatura} icon={Sparkles} accent="yellow" />
            <StatCard label="Em análise" value={status.em_analise} icon={UserSearch} accent="neutral" />
            <StatCard label="Pré-selecionados" value={status.pre_selecionado} icon={ClipboardList} accent="blue" />
            <StatCard label="Entrevistas agendadas" value={status.entrevista_agendada} icon={CalendarCheck} accent="yellow" />
            <StatCard label="Aprovados" value={status.aprovado} icon={Award} accent="blue" />
            <StatCard label="Banco de talentos" value={status.banco_talentos} icon={Users} accent="neutral" />
            <StatCard label="Não selecionados" value={status.nao_selecionado} icon={UserX} accent="red" />
            <StatCard label="Últimos 7 dias" value={last7Days} icon={TrendingUp} accent="blue" />
            <StatCard label="No mês atual" value={thisMonth} icon={CalendarRange} accent="blue" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="font-bold text-neutral-800">Candidatos por função de interesse</h2>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byNeighborhood}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#d32f2b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-bold text-neutral-800">Com ou sem experiência</h2>
              </CardHeader>
              <CardBody className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byExperience} dataKey="value" nameKey="name" outerRadius={90} label>
                      {byExperience.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-bold text-neutral-800">Candidatos por disponibilidade</h2>
              </CardHeader>
              <CardBody className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byAvailability}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#146c94" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>
        </>
      )}

      <div className="flex items-start gap-2 rounded-xl2 border border-brand-yellow-300 bg-brand-yellow-50 p-4 text-sm text-brand-yellow-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          A pontuação exibida no sistema é apenas um apoio à triagem. A decisão final sobre cada
          candidato deve sempre ser tomada por um recrutador humano.
        </p>
      </div>
    </div>
  );
}
