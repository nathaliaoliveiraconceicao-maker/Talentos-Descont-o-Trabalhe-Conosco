'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string | null
  placement: string
  active: boolean
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[] | null>(null)
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', placement: 'home_hero' })

  async function load() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    const { data } = await supabase.from('banners').select('id, title, image_url, link_url, placement, active').order('sort_order')
    setBanners(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('banners').insert({
      title: form.title,
      image_url: form.imageUrl,
      image_alt: form.title,
      link_url: form.linkUrl || null,
      placement: form.placement,
    })
    setForm({ title: '', imageUrl: '', linkUrl: '', placement: 'home_hero' })
    load()
  }

  async function toggleActive(banner: Banner) {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('banners').update({ active: !banner.active }).eq('id', banner.id)
    load()
  }

  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Banners</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        Cadastro de banners para campanhas. A home hoje usa uma imagem fixa em código (
        <code>src/components/home/Hero.tsx</code>) — conectar este cadastro à renderização é o próximo passo ao
        migrar a home para dados dinâmicos.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 rounded border border-ink/10 bg-white p-4 sm:grid-cols-4">
        <Input label="Título" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <Input label="URL da imagem" required value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} className="sm:col-span-2" />
        <Input label="Link (opcional)" value={form.linkUrl} onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))} />
        <div className="col-span-full">
          <Button type="submit">Adicionar banner</Button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {banners?.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded border border-ink/10 bg-white p-4">
            <div>
              <p className="font-medium text-ink">{b.title}</p>
              <p className="text-xs text-ink-muted">{b.placement}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toggleActive(b)}>
              {b.active ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
