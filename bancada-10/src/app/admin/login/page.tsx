'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Logo } from '@/components/ui/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/auth-context'

export default function AdminLoginPage() {
  const { signInWithPassword, isSupabaseConfigured } = useAuth()
  const router = useRouter()
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
    router.push('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded bg-white p-8">
        <Logo />
        <h1 className="mt-4 font-display text-xl uppercase tracking-tightest">Painel administrativo</h1>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded border border-ink/15 bg-bancada-off p-3 text-xs text-ink-muted">
            Configure o Supabase para ativar o login administrativo.
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
      </div>
    </div>
  )
}
