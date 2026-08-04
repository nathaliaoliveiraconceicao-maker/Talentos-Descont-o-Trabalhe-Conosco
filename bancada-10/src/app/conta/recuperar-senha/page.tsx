'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/auth-context'

export default function ForgotPasswordPage() {
  const { sendPasswordReset, isSupabaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    await sendPasswordReset(email)
    setLoading(false)
    // Mensagem sempre neutra, para não confirmar/negar se o e-mail existe.
    setSubmitted(true)
  }

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-2xl uppercase tracking-tightest">Recuperar senha</h1>

        {submitted ? (
          <p className="mt-4 text-sm text-ink-muted">
            Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-muted">Informe seu e-mail para receber o link de redefinição.</p>
            {!isSupabaseConfigured && (
              <p className="mt-4 rounded border border-ink/15 bg-bancada-off p-3 text-left text-xs text-ink-muted">
                Recuperação de senha ainda não disponível — configure o Supabase para ativar.
              </p>
            )}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              <Input label="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando…' : 'Enviar link'}
              </Button>
            </form>
          </>
        )}

        <p className="mt-4 text-xs text-ink-muted">
          <Link href="/conta/login" className="underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
