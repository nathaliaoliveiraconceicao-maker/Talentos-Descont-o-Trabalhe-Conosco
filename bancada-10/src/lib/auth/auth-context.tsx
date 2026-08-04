'use client'

import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isSupabaseConfigured: boolean
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const NOT_CONFIGURED_MESSAGE =
  'A autenticação ainda não está configurada neste ambiente. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local (ver .env.example).'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  async function signInWithPassword(email: string, password: string) {
    if (!supabase) return { error: NOT_CONFIGURED_MESSAGE }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!supabase) return { error: NOT_CONFIGURED_MESSAGE }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function sendPasswordReset(email: string) {
    if (!supabase) return { error: NOT_CONFIGURED_MESSAGE }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/conta/redefinir-senha`,
    })
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSupabaseConfigured: !!supabase,
        signInWithPassword,
        signUp,
        signOut,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
