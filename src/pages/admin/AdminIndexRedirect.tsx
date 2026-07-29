import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

/** "/admin" apenas encaminha para o login ou para o dashboard, conforme o estado de autenticação. */
export function AdminIndexRedirect() {
  const { isAuthorized, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verificando acesso…" />
      </div>
    );
  }

  return <Navigate to={isAuthorized ? '/admin/dashboard' : '/admin/login'} replace />;
}
