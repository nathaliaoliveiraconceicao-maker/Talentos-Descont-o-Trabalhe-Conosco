import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

/** "/superadmin" apenas encaminha para o login ou para o dashboard. */
export function SuperAdminIndexRedirect() {
  const { isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verificando acesso…" />
      </div>
    );
  }

  return <Navigate to={isSuperAdmin ? '/superadmin/dashboard' : '/superadmin/login'} replace />;
}
