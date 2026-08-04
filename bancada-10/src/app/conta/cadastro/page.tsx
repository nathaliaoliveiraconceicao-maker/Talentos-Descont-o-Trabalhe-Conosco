'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Input, Checkbox } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/auth-context'

export default function SignupPage() {
  const { signUp, isSupabaseConfigured } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (!consent) {
      setError('É necessário aceitar a Política de Privacidade para criar a conta.')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, name)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <h1 className="font-display text-2xl uppercase tracking-tightest">Confira seu e-mail</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Enviamos um link de confirmação para {email}. Confirme para ativar sua conta e fazer login.
        </p>
      </div>
    )
  }

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl uppercase tracking-tightest">Criar conta</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Prefere comprar sem cadastro? Você pode{' '}
          <Link href="/checkout" className="underline">
            finalizar como visitante
          </Link>{' '}
          e criar a conta depois.
        </p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded border border-ink/15 bg-bancada-off p-3 text-xs text-ink-muted">
            Cadastro ainda não disponível — configure o Supabase para ativar.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Nome completo" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Senha"
            type="password"
            required
            hint="Mínimo de 8 caracteres."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Checkbox
            id="signup-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            label={
              <>
                Li e aceito a{' '}
                <Link href="/institucional/privacidade" className="underline" target="_blank">
                  Política de Privacidade
                </Link>
                .
              </>
            }
          />
          {error && (
            <p role="alert" className="text-xs font-medium text-bancada-red">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-ink-muted">
          Já tem conta?{' '}
          <Link href="/conta/login" className="underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
