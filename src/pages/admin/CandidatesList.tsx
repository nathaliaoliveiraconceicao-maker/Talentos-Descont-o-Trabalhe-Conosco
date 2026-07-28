import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, Filter, Search, X } from 'lucide-react';
import { useCandidates } from '@/hooks/useCandidates';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { JOB_AREAS } from '@/data/jobAreas';
import { STATUS_LABELS, STATUS_ORDER } from '@/types/candidate';

type SortOption = 'recent' | 'score' | 'name' | 'experience';

export function CandidatesList() {
  const { candidates, loading, error } = useCandidates();

  const [name, setName] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [area, setArea] = useState('');
  const [availability, setAvailability] = useState('');
  const [firstJob, setFirstJob] = useState('');
  const [supermarketExp, setSupermarketExp] = useState('');
  const [minScore, setMinScore] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = candidates.filter((c) => {
      if (name && !c.personal.fullName.toLowerCase().includes(name.toLowerCase())) return false;
      if (dateFilter && !c.createdAt.startsWith(dateFilter)) return false;
      if (neighborhood && !c.personal.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())) {
        return false;
      }
      if (area && c.interest.mainAreaOfInterest !== area) return false;
      if (availability && !c.availability[availability as keyof typeof c.availability]) return false;
      if (firstJob && c.interest.isFirstJob !== firstJob) return false;
      if (supermarketExp && c.experience.workedInSupermarket !== supermarketExp) return false;
      if (minScore && c.score < Number(minScore)) return false;
      if (status && c.status !== status) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'name':
          return a.personal.fullName.localeCompare(b.personal.fullName);
        case 'experience':
          return (b.experience.hasWorkedBefore === 'sim' ? 1 : 0) - (a.experience.hasWorkedBefore === 'sim' ? 1 : 0);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }, [candidates, name, dateFilter, neighborhood, area, availability, firstJob, supermarketExp, minScore, status, sortBy]);

  const clearFilters = () => {
    setName('');
    setDateFilter('');
    setNeighborhood('');
    setArea('');
    setAvailability('');
    setFirstJob('');
    setSupermarketExp('');
    setMinScore('');
    setStatus('');
  };

  if (loading) return <Spinner label="Carregando candidatos…" />;
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Candidatos</h1>
          <p className="text-sm text-neutral-500">{filtered.length} de {candidates.length} candidatos</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="w-52">
            <option value="recent">Mais recentes</option>
            <option value="score">Maior pontuação</option>
            <option value="name">Nome</option>
            <option value="experience">Com experiência primeiro</option>
          </Select>
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="h-4 w-4" /> Filtros
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input placeholder="Buscar por nome" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
            </div>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            <Input placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
            <Select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Todas as áreas</option>
              {JOB_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </Select>
            <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="">Qualquer disponibilidade</option>
              <option value="morning">Manhã</option>
              <option value="afternoon">Tarde</option>
              <option value="night">Noite</option>
              <option value="fullTime">Integral</option>
              <option value="saturdays">Sábados</option>
              <option value="sundays">Domingos</option>
            </Select>
            <Select value={firstJob} onChange={(e) => setFirstJob(e.target.value)}>
              <option value="">Primeiro emprego (todos)</option>
              <option value="sim">Buscando primeiro emprego</option>
              <option value="nao">Já teve experiência</option>
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
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            <Button variant="ghost" onClick={clearFilters} className="self-start">
              <X className="h-4 w-4" /> Limpar filtros
            </Button>
          </CardBody>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Bairro</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Experiência</th>
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
                    {c.experience.hasWorkedBefore === 'sim' ? 'Com experiência' : 'Sem experiência'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-green-700">{c.score}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/candidatos/${c.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-neutral-400">
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
