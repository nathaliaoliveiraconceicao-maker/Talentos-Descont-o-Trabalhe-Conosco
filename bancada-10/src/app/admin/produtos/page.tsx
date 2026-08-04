'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

interface AdminProduct {
  id: string
  slug: string
  name: string
  price: number
  active: boolean
}

function NewProductForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', slug: '', price: '', season: '', licensing: 'versao_torcedor_licenciada' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    setLoading(true)
    setError(null)
    const { error } = await supabase.from('products').insert({
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      season: form.season,
      licensing: form.licensing,
      competition_kind: 'clube_brasileiro',
    })
    setLoading(false)
    if (error) {
      setError('Não foi possível criar o produto. O slug já existe?')
      return
    }
    setForm({ name: '', slug: '', price: '', season: '', licensing: 'versao_torcedor_licenciada' })
    onCreated()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded border border-ink/10 bg-white p-4 sm:grid-cols-5">
      <Input label="Nome" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      <Input label="Slug (URL)" required value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
      <Input label="Preço" type="number" step="0.01" required value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
      <Input label="Temporada" required value={form.season} onChange={(e) => setForm((p) => ({ ...p, season: e.target.value }))} />
      <Select label="Licenciamento" value={form.licensing} onChange={(e) => setForm((p) => ({ ...p, licensing: e.target.value }))}>
        <option value="versao_torcedor_licenciada">Versão torcedor</option>
        <option value="versao_jogador_licenciada">Versão jogador</option>
        <option value="retro_licenciada">Retrô</option>
        <option value="oficial_licenciada">Oficial</option>
        <option value="alternativa_licenciada">Alternativa</option>
        <option value="inspirada_nao_licenciada">Não licenciada</option>
      </Select>
      {error && <p className="col-span-full text-xs font-medium text-bancada-red">{error}</p>}
      <div className="col-span-full">
        <Button type="submit" disabled={loading}>
          {loading ? 'Criando…' : 'Criar produto'}
        </Button>
      </div>
    </form>
  )
}

function ProductsTable() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null)

  async function load() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    const { data } = await supabase.from('products').select('id, slug, name, price, active').order('created_at', { ascending: false })
    setProducts(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleActive(product: AdminProduct) {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from('products').update({ active: !product.active }).eq('id', product.id)
    load()
  }

  return (
    <div className="mt-6">
      <NewProductForm onCreated={load} />

      <div className="mt-6 overflow-x-auto rounded border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase text-ink-muted">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products === null ? (
              <tr>
                <td className="p-3 text-ink-muted" colSpan={5}>
                  Carregando…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td className="p-3 text-ink-muted" colSpan={5}>
                  Nenhum produto cadastrado ainda no banco. Use o formulário acima ou importe por CSV.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-ink/5">
                  <td className="p-3">{product.name}</td>
                  <td className="p-3 text-ink-muted">{product.slug}</td>
                  <td className="p-3">{formatCurrency(product.price)}</td>
                  <td className="p-3">{product.active ? 'Ativo' : 'Inativo'}</td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(product)} className="text-xs font-medium text-ink underline">
                      {product.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl uppercase tracking-tightest">Produtos</h1>
        <Link href="/admin/produtos/importar">
          <Button variant="outline">
            <Upload size={16} /> Importar CSV
          </Button>
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Enquanto o catálogo real não é importado, a vitrine pública usa os dados demonstrativos de{' '}
        <code>src/lib/data/products.ts</code>. Produtos criados aqui ficam no Supabase, prontos para quando a
        vitrine for migrada para consumir o banco.
      </p>
      <ProductsTable />
    </AdminShell>
  )
}
