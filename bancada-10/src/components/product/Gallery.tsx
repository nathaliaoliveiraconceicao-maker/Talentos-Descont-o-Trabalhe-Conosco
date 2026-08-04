'use client'

import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { cx } from '@/lib/utils/format'

export function Gallery({ images, productName }: { images: { url: string; alt: string }[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const active = images[activeIndex] ?? images[0]

  if (!active) return null

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="group relative block aspect-[4/5] w-full overflow-hidden rounded bg-bancada-off"
        aria-label={`Ampliar imagem: ${active.alt}`}
      >
        <Image src={active.url} alt={active.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100">
          <ZoomIn size={14} /> Ampliar
        </span>
      </button>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.url}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagem ${index + 1} de ${productName}`}
              aria-current={index === activeIndex}
              className={cx(
                'relative h-20 w-16 shrink-0 overflow-hidden rounded border-2',
                index === activeIndex ? 'border-ink' : 'border-transparent'
              )}
            >
              <Image src={image.url} alt={image.alt} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={productName}>
        <div className="relative aspect-square w-full">
          <Image src={active.url} alt={active.alt} fill sizes="90vw" className="object-contain" />
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {images.map((image, index) => (
              <button
                key={image.url}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagem ${index + 1}`}
                className={cx('h-2 w-2 rounded-full', index === activeIndex ? 'bg-ink' : 'bg-ink/20')}
              />
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
