import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, Filter, Inbox, Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCandidates } from '@/hooks/useCandidates';
import { useTenantJobs } from '@/hooks/useTenantJobs';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { onlyDigits } from '@/lib/masks';
import { STATUS_LABELS, STATUS_ORDER } from '@/types/candidate';

type SortOption = 'recent' | 'oldest' | 'scoreDesc' | 'scoreAsc' | 'name';

export function CandidatesList() {
  const { tenantId } = useAuth();
  const { candidates, loading, error } = useCandidates(tenantId ?? undefined);
  const JOB_AREAS = useTenantJobs(tenantId);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [area, setArea] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [availability, setAvailability] = useState('');
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [firstJob, setFirstJob] = useState('');
  const [hasExperience, setHasExperience] = useState('');
  const [supermarketExp, setSupermarketExp] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minScore, setMinScore] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const termDigits = onlyDigits(search);

    let list = candidates.filter((c) => {
      if (term) {
        const matches =
          c.personal.fullName.toLowerCase().includes(term) ||
          c.contact.email.toLowerCase().includes(term) ||
          c.personal.neighborhood.toLowerCase().includes(term) ||
          (termDigits.length >= 3 && onlyDigits(c.contact.whatsapp).includes(termDigits));
        if (!matches) return false;
      }
      if (status && c.status !== status) return false;
      if (area && c.interest.mainAreaOfInterest !== area) return false;
      if (neighborhood && !c.personal.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())) {
        return false;
      }
      if (availability && !c.availability[availability as keyof typeof c.availability]) return false;
      if (weekendOnly && !(c.availability.saturdays || c.availability.sundays)) return false;
      if (firstJob && c.interest.isFirstJob !== firstJob) return false;
      if (hasExperience && c.experience.hasWorkedBefore !== hasExperience) return false;
      if (supermarketExp && c.experience.workedInSupermarket !== supermarketExp) return false;
      if (dateFrom && new Date(c.createdAt) < new Date(`${dateFrom}T00:00:00`)) return false;
      if (dateTo && new Date(c.createdAt) > new Date(`${dateTo}T23:59:59`)) return false;
      if (minScore && c.score < Number(minScore)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'scoreDesc':
          return b.score - a.score;
        case 'scoreAsc':
          return a.score - b.score;
        case 'name':
          return a.personal.fullName.localeCompare(b.personal.fullName);
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }, [
    candidates,
    search,
    status,
    area,
    neighborhood,
    availability,
    weekendOnly,
    firstJob,
    hasExperience,
    supermarketExp,
    dateFrom,
    dateTo,
    minScore,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setArea('');
    setNeighborhood('');
    setAvailability('');
    setWeekendOnly(false);
    setFirstJob('');
    setHasExperience('');
    setSupermarketExp('');
    setDateFrom('');
    setDateTo('');
    setMinScore('');
  };

  if (loading) return <Spinner label="Carregando candidatos…" />;
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
          <h2 className="text-lg font-bold text-neutral-700">Nenhum candidato recebido ainda</h2>
          <p className="max-w-sm text-sm text-neutral-500">
            Compartilhe o link do formulário de pré-candidatura para começar a receber candidatos.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Candidatos</h1>
          <p className="text-sm text-neutral-500">{filtered.length} de {candidates.length} candidatos</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Buscar por nome, telefone, e-mail ou bairro"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 pl-9"
            />
          </div>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="w-48">
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="scoreDesc">Maior pontuação</option>
            <option value="scoreAsc">Menor pontuação</option>
            <option value="name">Nome (A-Z)</option>
          </Select>
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="h-4 w-4" /> Filtros
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            <Select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Todas as áreas</option>
              {JOB_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </Select>
            <Input placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
            <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="">Qualquer disponibilidade</option>
              <option value="morning">Manhã</option>
              <option value="afternoon">Tarde</option>
              <option value="night">Noite</option>
              <option value="fullTime">Integral</option>
            </Select>
            <Select value={firstJob} onChange={(e) => setFirstJob(e.target.value)}>
              <option value="">Primeiro emprego (todos)</option>
              <option value="sim">Buscando primeiro emprego</option>
              <option value="nao">Já teve experiência</option>
            </Select>
            <Select value={hasExperience} onChange={(e) => setHasExperience(e.target.value)}>
              <option value="">Experiência profissional (todos)</option>
              <option value="sim">Com experiência profissional</option>
              <option value="nao">Sem experiência profissional</option>
            </Select>
            <Select value={supermarketExp} onChange={(e) => setSupermarketExp(e.target.value)}>
              <option value="">Experiência em supermercado (todos)</option>
              <option value="sim">Com experiência em supermercado</option>
              <option value="nao">Sem experiência em supermercado</option>
            </Select>
            <Input
              type="number"
              min={0}
              placeholder="Pontuação mínima"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-neutral-500">Data da candidatura</span>
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <span className="text-xs text-neutral-400">até</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 self-center rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={weekendOnly}
                onChange={(e) => setWeekendOnly(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-brand-blue-600 focus-visible:ring-2 focus-visible:ring-brand-blue-500"
              />
              Disponível aos finais de semana
            </label>
            <Button variant="ghost" onClick={clearFilters} className="self-start">
              <X className="h-4 w-4" /> Limpar filtros
            </Button>
          </CardBody>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Bairro</th>
                <th className="px-4 py-3">Área principal</th>
                <th className="px-4 py-3">1º emprego</th>
                <th className="px-4 py-3">Exp. supermercado</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Pontuação</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-800">{c.personal.fullName}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.contact.whatsapp}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.personal.neighborhood}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {JOB_AREAS.find((a) => a.id === c.interest.mainAreaOfInterest)?.label ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {c.interest.isFirstJob === 'sim' ? 'Sim' : 'Não'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {c.experience.workedInSupermarket === 'sim' ? 'Sim' : 'Não'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-blue-700">{c.score}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/app/candidatos/${c.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-neutral-400">
                    Nenhum candidato encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
