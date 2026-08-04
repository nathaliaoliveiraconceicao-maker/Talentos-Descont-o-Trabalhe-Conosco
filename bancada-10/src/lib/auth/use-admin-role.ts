'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function useAdminRole() {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    const supabase = getSupabaseBrowserClient()
    if (!supabase || !user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    supabase
      .from('admin_users')
      .select('active')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data?.active)
        setLoading(false)
      })
  }, [user, authLoading])

  return { isAdmin, loading: authLoading || loading }
}
