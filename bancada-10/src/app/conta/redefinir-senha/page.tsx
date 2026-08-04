'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
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

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setError('Supabase não configurado neste ambiente.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/conta'), 1500)
  }

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl uppercase tracking-tightest">Nova senha</h1>
        <p className="mt-1 text-sm text-ink-muted">Defina sua nova senha de acesso.</p>

        {success ? (
          <p className="mt-6 text-sm font-medium text-ink">Senha atualizada! Redirecionando…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Nova senha"
              type="password"
              required
              hint="Mínimo de 8 caracteres."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p role="alert" className="text-xs font-medium text-bancada-red">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar nova senha'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
