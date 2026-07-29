import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getTenant, getTenantJobAreas, getTenantSettings } from '@/lib/tenantApi';
import { isTenantOperational, type Tenant, type TenantSettings } from '@/types/tenant';
import type { TenantJobArea } from '@/types/tenant';
import { Spinner } from '@/components/ui/Spinner';

interface TenantContextValue {
  tenant: Tenant;
  settings: TenantSettings;
  jobs: TenantJobArea[];
  reload: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

/**
 * Resolve o tenant pelo slug da URL ("/{slug}/...") e disponibiliza a marca
 * (nome, cores, logo), as configurações públicas e as áreas de interesse
 * para toda a árvore de páginas públicas daquele cliente. Usado como
 * elemento de rota — ver App.tsx.
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [jobs, setJobs] = useState<TenantJobArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    try {
      const tenantData = await getTenant(slug);
      if (!tenantData) {
        setNotFound(true);
        return;
      }
      const [settingsData, jobsData] = await Promise.all([
        getTenantSettings(slug),
        getTenantJobAreas(slug),
      ]);
      setTenant(tenantData);
      setSettings(settingsData);
      setJobs(jobsData);
    } catch (err) {
      // Qualquer erro aqui (inclusive "permission-denied" do Firestore, não
      // só um tenant genuinamente inexistente) leva o visitante para a
      // mesma tela de "não encontrado" — de propósito, para não vazar quais
      // slugs existem. Mas o console SEMPRE recebe o erro real: se as
      // Firestore Rules do projeto não estiverem publicadas (ex.: alguém
      // editou firestore.rules mas esqueceu de rodar
      // "firebase deploy --only firestore:rules"), o sintoma no navegador é
      // idêntico a um 404 — sem este log, esse cenário é praticamente
      // impossível de diagnosticar a distância.
      console.error(`[TenantProvider] Falha ao carregar o tenant "${slug}":`, err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Carregando…" />
      </div>
    );
  }

  if (notFound || !tenant || !settings) {
    return <Navigate to="/nao-encontrado" replace />;
  }

  if (!tenant.active) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="text-xl font-bold text-neutral-800">Portal indisponível</h1>
        <p className="max-w-sm text-sm text-neutral-500">
          Este portal de candidaturas está temporariamente indisponível. Tente novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenant, settings, jobs, reload: load }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  return ctx;
}

/** Indica se o tenant está com a assinatura em dia (usado para avisos, não bloqueia o formulário público). */
export function useTenantOperational(): boolean {
  const { tenant } = useTenant();
  return isTenantOperational(tenant);
}
