'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface Testimonial {
  id: string
  customer_name: string
  rating: number
  comment: string
  approved: boolean
  is_demo: boolean
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null)

  async function load() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    const { data } = await supabase
      .from('testimonials')
      .select('id, customer_name, rating, comment, approved, is_demo')
      .order('created_at', { ascending: false })
    setTestimonials(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleApproved(testimonial: Testimonial) {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('testimonials').update({ approved: !testimonial.approved }).eq('id', testimonial.id)
    load()
  }

  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Depoimentos</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Só depoimentos <strong>aprovados</strong> aparecem no site. A home ainda exibe os depoimentos demonstrativos
        de <code>src/lib/data/testimonials.ts</code> (marcados como exemplo) até a seção ser migrada para consumir
        esta tabela.
      </p>

      <div className="mt-6 space-y-3">
        {testimonials === null ? (
          <p className="text-sm text-ink-muted">Carregando…</p>
        ) : testimonials.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhum depoimento cadastrado ainda.</p>
        ) : (
          testimonials.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-4 rounded border border-ink/10 bg-white p-4">
              <div>
                <p className="font-medium text-ink">
                  {t.customer_name} — {t.rating}★ {t.is_demo && <span className="text-xs text-ink-muted">(demo)</span>}
                </p>
                <p className="text-sm text-ink-muted">{t.comment}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toggleApproved(t)}>
                {t.approved ? 'Remover aprovação' : 'Aprovar'}
              </Button>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  )
}
