'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/auth-context'

function LoginForm() {
  const { signInWithPassword, isSupabaseConfigured } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signInWithPassword(email, password)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    router.push(searchParams.get('redirect') || '/conta')
  }

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl uppercase tracking-tightest">Entrar</h1>
        <p className="mt-1 text-sm text-ink-muted">Acesse sua conta para ver pedidos, favoritos e endereços.</p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded border border-ink/15 bg-bancada-off p-3 text-xs text-ink-muted">
            Login ainda não disponível — configure o Supabase para ativar o cadastro de clientes.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Senha" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && (
            <p role="alert" className="text-xs font-medium text-bancada-red">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-4 flex justify-between text-xs text-ink-muted">
          <Link href="/conta/recuperar-senha" className="underline">
            Esqueci minha senha
          </Link>
          <Link href="/conta/cadastro" className="underline">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
