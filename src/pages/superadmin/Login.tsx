import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Building2, LogIn, ShieldOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export function SuperAdminLogin() {
  const { user, isSuperAdmin, loading, error, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verificando acesso…" />
      </div>
    );
  }

  if (isSuperAdmin) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/superadmin/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <Card>
            <CardBody className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="rounded-full bg-brand-navy-100 p-3 text-brand-navy-700">
                <ShieldOff className="h-5 w-5" />
              </span>
              <h1 className="text-lg font-bold text-neutral-800">Acesso não autorizado</h1>
              <p className="text-sm text-neutral-500">
                Sua conta ({user.email}) está autenticada, mas não é uma conta de superadmin da
                plataforma.
              </p>
              <Button variant="outline" onClick={logout} className="mt-2">
                Sair e tentar outra conta
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/superadmin/dashboard', { replace: true });
    } catch {
      // O AuthContext já define uma mensagem de erro específica (error, abaixo).
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardBody className="flex flex-col gap-5 py-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="rounded-full bg-brand-navy-100 p-3 text-brand-navy-700">
                <Building2 className="h-5 w-5" />
              </span>
              <h1 className="text-lg font-bold text-neutral-800">Painel da plataforma</h1>
              <p className="text-sm text-neutral-500">Acesso restrito à equipe da plataforma.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField label="E-mail" htmlFor="email" required>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Senha" htmlFor="password" required>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormField>
              {error && (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" fullWidth loading={submitting} variant="accent">
                <LogIn className="h-4 w-4" /> Entrar
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
