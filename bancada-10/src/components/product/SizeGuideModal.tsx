'use client'

import { Ruler } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'

const adultTable = [
  { size: 'P', chest: '96–100', length: '68' },
  { size: 'M', chest: '101–105', length: '70' },
  { size: 'G', chest: '106–110', length: '72' },
  { size: 'GG', chest: '111–115', length: '74' },
  { size: '2G', chest: '116–120', length: '76' },
]

const femaleTable = [
  { size: 'P', chest: '84–88', length: '58' },
  { size: 'M', chest: '89–93', length: '60' },
  { size: 'G', chest: '94–98', length: '62' },
  { size: 'GG', chest: '99–103', length: '64' },
]

const kidsTable = [
  { size: '4', age: '3–4 anos', chest: '56–58', length: '40' },
  { size: '6', age: '5–6 anos', chest: '59–61', length: '43' },
  { size: '8', age: '7–8 anos', chest: '62–66', length: '46' },
  { size: '10', age: '9–10 anos', chest: '67–71', length: '49' },
  { size: '12', age: '11–12 anos', chest: '72–76', length: '52' },
  { size: '14', age: '13–14 anos', chest: '77–81', length: '55' },
]

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-muted">
            {headers.map((h) => (
              <th key={h} className="py-2 pr-4 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-ink/5">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SizeGuideModal({ line, version }: { line: string; version: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-ink underline underline-offset-2 hover:text-bancada-red"
      >
        <Ruler size={14} /> Guia de medidas
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Guia de medidas">
        <p className="mb-4 text-xs text-ink-muted">
          Medidas em centímetros. Esta é a tabela padrão da Bancada 10 — pequenas variações podem ocorrer entre
          fornecedores. Tabela sugerida para este produto:{' '}
          <strong>{line === 'infantil' ? 'Infantil' : line === 'feminino' ? 'Feminina' : 'Adulto'}</strong>
          {version === 'jogador' ? ' (versão jogador — corte mais justo)' : ' (versão torcedor)'}.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">Adulto (torcedor)</h3>
            <Table headers={['Tamanho', 'Peitoral (cm)', 'Comprimento (cm)']} rows={adultTable.map((r) => [r.size, r.chest, r.length])} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">Feminina</h3>
            <Table headers={['Tamanho', 'Busto (cm)', 'Comprimento (cm)']} rows={femaleTable.map((r) => [r.size, r.chest, r.length])} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">Infantil</h3>
            <Table
              headers={['Tamanho', 'Idade aprox.', 'Peitoral (cm)', 'Comprimento (cm)']}
              rows={kidsTable.map((r) => [r.size, r.age, r.chest, r.length])}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">Versão jogador × versão torcedor</h3>
            <p className="text-sm text-ink-muted">
              A versão jogador (player version) tem corte mais justo ao corpo, seguindo a modelagem usada em campo. A
              versão torcedor (fan fit) tem caimento mais confortável e levemente mais larga. Se estiver entre dois
              tamanhos na versão jogador, considere subir um tamanho.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">Como medir uma camisa que você já tem</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">
              <li>
                <strong>Peitoral:</strong> com a camisa estendida e abotoada/fechada, meça de uma axila à outra e
                multiplique por 2.
              </li>
              <li>
                <strong>Comprimento:</strong> meça do ponto mais alto do ombro (junto à gola) até a barra inferior.
              </li>
              <li>Compare os valores encontrados com a tabela acima para identificar o tamanho mais próximo.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  )
}
