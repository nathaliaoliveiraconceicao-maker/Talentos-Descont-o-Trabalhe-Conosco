import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

/** Protege as rotas do painel do cliente (/app/*): exige um usuário de tenant ativo. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthorized, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verificando acesso…" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/app/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

/** Protege as rotas do painel da plataforma (/superadmin/*): exige um superadmin ativo. */
export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { isSuperAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verificando acesso…" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/superadmin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
