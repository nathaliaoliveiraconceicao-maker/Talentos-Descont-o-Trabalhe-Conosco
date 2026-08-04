import { ShieldCheck } from 'lucide-react'
import type { LicensingStatus } from '@/lib/types'
import { LICENSING_INFO } from '@/lib/catalog/licensing'

export function LicensingInfo({ licensing }: { licensing: LicensingStatus }) {
  const info = LICENSING_INFO[licensing]
  return (
    <div className="flex gap-3 rounded border border-ink/10 bg-bancada-off/60 p-4">
      <ShieldCheck size={20} className="mt-0.5 shrink-0 text-ink" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-ink">{info.label}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{info.description}</p>
      </div>
    </div>
  )
}
