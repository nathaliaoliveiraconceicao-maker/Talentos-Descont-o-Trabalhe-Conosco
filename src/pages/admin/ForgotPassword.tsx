import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Card, CardBody } from '@/components/ui/Card';

const NEUTRAL_MESSAGE =
  'Caso exista uma conta vinculada a este e-mail, você receberá as instruções para redefinir sua senha. Verifique também a caixa de spam.';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), { url: `${window.location.origin}/app/login` });
    } catch (err) {
      const code = (err as { code?: string } | null)?.code ?? '';
      // Nunca revelamos se a conta existe: exceto por falhas genuinamente
      // inesperadas (ex.: rede fora do ar), sempre mostramos a mesma
      // mensagem neutra de sucesso.
      if (code !== 'auth/user-not-found' && code !== 'auth/invalid-email') {
        console.error('[ForgotPassword] Falha inesperada ao enviar e-mail de redefinição:', err);
      }
    } finally {
      setSent(true);
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
              <span className="rounded-full bg-brand-blue-100 p-3 text-brand-blue-700">
                <KeyRound className="h-5 w-5" />
              </span>
              <h1 className="text-lg font-bold text-neutral-800">Redefinir senha</h1>
              <p className="text-sm text-neutral-500">
                Informe o e-mail da sua conta para receber o link de redefinição de senha.
              </p>
            </div>

            {sent ? (
              <p className="rounded-lg bg-brand-green-50 p-3 text-center text-sm text-brand-green-800">
                {NEUTRAL_MESSAGE}
              </p>
            ) : (
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
                <Button type="submit" fullWidth loading={submitting}>
                  Enviar link de redefinição
                </Button>
              </form>
            )}

            <Link to="/app/login" className="text-center text-sm font-medium text-brand-blue-700 hover:underline">
              Voltar para o login
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
