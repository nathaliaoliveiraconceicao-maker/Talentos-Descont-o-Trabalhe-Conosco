'use client'

import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { FilterPanel, type FilterFacets } from '@/components/catalog/FilterPanel'

export function FilterDrawerTrigger({ facets }: { facets: FilterFacets }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded border border-ink/20 px-3 py-2 text-sm font-medium text-ink lg:hidden"
      >
        <SlidersHorizontal size={16} /> Filtros
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} side="left" title="Filtrar produtos">
        <div className="p-4">
          <FilterPanel facets={facets} onApplied={() => setOpen(false)} />
        </div>
      </Drawer>
    </>
  )
}
