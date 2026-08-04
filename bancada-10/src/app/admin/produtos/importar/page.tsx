'use client'

import { useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/Button'
import { parseCsv } from '@/lib/utils/csv'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const TEMPLATE_HEADER =
  'slug,name,short_description,price,compare_at_price,season,club,league,competition_kind,line,version,sleeve,kind,color,licensing,pix_discount_percent,max_installments,personalization_available,category_slugs'

const TEMPLATE_EXAMPLE =
  'camisa-exemplo-i-2025,Camisa Exemplo I 2025,Manto titular 2025,249.90,299.90,2025,Exemplo FC,Brasileirão Série A,clube_brasileiro,adulto,torcedor,manga_curta,atual,Vermelho,versao_torcedor_licenciada,8,10,true,times-brasileiros'

function downloadTemplate() {
  const blob = new Blob([`${TEMPLATE_HEADER}\n${TEMPLATE_EXAMPLE}\n`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bancada10-modelo-produtos.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function ImportProductsPage() {
  const [log, setLog] = useState<string[]>([])
  const [importing, setImporting] = useState(false)

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    setImporting(true)
    setLog([])
    const text = await file.text()
    const rows = parseCsv(text)
    const messages: string[] = [`${rows.length} linha(s) encontrada(s).`]

    for (const row of rows) {
      if (!row.slug || !row.name || !row.price) {
        messages.push(`Ignorada: linha sem slug/name/price (${JSON.stringify(row)}).`)
        continue
      }

      const { error } = await supabase.from('products').upsert(
        {
          slug: row.slug,
          name: row.name,
          short_description: row.short_description ?? '',
          price: Number(row.price),
          compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
          season: row.season ?? '',
          club: row.club || null,
          league: row.league || null,
          competition_kind: row.competition_kind || 'clube_brasileiro',
          line: row.line || 'adulto',
          version: row.version || 'torcedor',
          sleeve: row.sleeve || 'manga_curta',
          kind: row.kind || 'atual',
          color: row.color || '',
          licensing: row.licensing || 'versao_torcedor_licenciada',
          pix_discount_percent: row.pix_discount_percent ? Number(row.pix_discount_percent) : 0,
          max_installments: row.max_installments ? Number(row.max_installments) : 1,
          personalization_available: row.personalization_available === 'true',
          category_slugs: row.category_slugs ? row.category_slugs.split('|') : [],
        },
        { onConflict: 'slug' }
      )

      messages.push(error ? `Erro em "${row.slug}": ${error.message}` : `OK: ${row.slug}`)
    }

    setLog(messages)
    setImporting(false)
  }

  return (
    <AdminShell>
      <h1 className="font-display text-xl uppercase tracking-tightest">Importar produtos por CSV</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Envie um arquivo CSV com as colunas abaixo. Produtos existentes (mesmo <code>slug</code>) são atualizados;
        novos são criados. Imagens e variações de tamanho ainda precisam ser cadastradas separadamente após a
        importação (tabelas <code>product_images</code> e <code>product_variants</code>).
      </p>

      <Button variant="outline" size="sm" className="mt-4" onClick={downloadTemplate}>
        Baixar modelo CSV
      </Button>

      <div className="mt-6 max-w-md">
        <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="csv-file">
          Arquivo CSV
        </label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFile}
          disabled={importing}
          className="block w-full text-sm"
        />
      </div>

      {log.length > 0 && (
        <div className="mt-6 max-h-80 max-w-2xl overflow-y-auto rounded border border-ink/10 bg-white p-4 text-xs">
          {log.map((line, i) => (
            <p key={i} className={line.startsWith('Erro') ? 'text-bancada-red' : 'text-ink-muted'}>
              {line}
            </p>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
