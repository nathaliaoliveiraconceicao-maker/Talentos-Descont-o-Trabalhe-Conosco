'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Minus, Plus, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@/lib/types'
import { PriceBlock } from '@/components/ui/Price'
import { Rating } from '@/components/ui/Rating'
import { Button } from '@/components/ui/Button'
import { Checkbox, Input } from '@/components/ui/Input'
import { SizeGuideModal } from '@/components/product/SizeGuideModal'
import { LicensingInfo } from '@/components/product/LicensingInfo'
import { ShippingEstimator } from '@/components/product/ShippingEstimator'
import { useCart } from '@/lib/cart/cart-context'
import { useFavorites } from '@/lib/favorites/favorites-context'
import { trackEvent } from '@/lib/analytics/events'
import { siteConfig, whatsappLink } from '@/lib/site-config'
import { cx } from '@/lib/utils/format'

const VERSION_LABEL: Record<string, string> = { torcedor: 'Torcedor', jogador: 'Jogador' }

export function ProductPurchasePanel({
  product,
  versionSiblings,
}: {
  product: Product
  versionSiblings: Product[]
}) {
  const router = useRouter()
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const [wantsPersonalization, setWantsPersonalization] = useState(false)
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [personalizationErrors, setPersonalizationErrors] = useState<{ name?: string; number?: string }>({})
  const [quantity, setQuantity] = useState(1)

  const favorite = isFavorite(product.id)
  const finalPrice = product.price + (wantsPersonalization ? product.personalizationPriceAddOn ?? 0 : 0)

  function validate(): boolean {
    let ok = true
    setSizeError(null)
    setPersonalizationErrors({})

    if (!selectedSize) {
      setSizeError('Escolha um tamanho antes de continuar.')
      ok = false
    }

    if (wantsPersonalization) {
      const errors: { name?: string; number?: string } = {}
      if (!name.trim()) errors.name = 'Informe o nome para personalização.'
      else if (name.trim().length > 12) errors.name = 'Use no máximo 12 caracteres.'

      if (!number.trim()) errors.number = 'Informe o número.'
      else if (!/^\d{1,2}$/.test(number.trim())) errors.number = 'Use um número de 1 a 2 dígitos (0 a 99).'

      if (Object.keys(errors).length > 0) {
        setPersonalizationErrors(errors)
        ok = false
      }
    }

    return ok
  }

  function buildCartItem() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url ?? '',
      size: selectedSize as string,
      price: finalPrice,
      ...(wantsPersonalization ? { personalization: { name: name.trim().toUpperCase(), number: number.trim() } } : {}),
    }
  }

  function handleAddToCart() {
    if (!validate()) return
    addItem(buildCartItem(), quantity)
    trackEvent('view_item', { item_id: product.id, item_name: product.name })
  }

  function handleBuyNow() {
    if (!validate()) return
    addItem(buildCartItem(), quantity)
    router.push('/checkout')
  }

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : `${siteConfig.url}/produto/${product.slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url })
      } catch {
        // usuário cancelou o compartilhamento — nada a fazer
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      window.alert('Link copiado!')
    }
  }

  const whatsappMessage = `Olá! Estou vendo a camisa ${product.name} no site da ${siteConfig.name} e gostaria de tirar uma dúvida.`

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {product.club || product.league || 'Bancada 10'}
        </p>
        <h1 className="font-display text-2xl uppercase leading-tight sm:text-3xl">{product.name}</h1>
        <div className="mt-2">
          <Rating value={product.rating} count={product.reviewsCount} />
        </div>
      </div>

      <PriceBlock
        price={finalPrice}
        compareAtPrice={product.compareAtPrice}
        pixDiscountPercent={product.pixDiscountPercent}
        maxInstallments={product.maxInstallments}
        size="lg"
      />

      <LicensingInfo licensing={product.licensing} />

      {versionSiblings.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">Versão</p>
          <div className="flex gap-2">
            <span className="rounded border border-ink bg-ink px-3 py-1.5 text-xs font-semibold text-white">
              {VERSION_LABEL[product.version]}
            </span>
            {versionSiblings.map((sibling) => (
              <Link
                key={sibling.id}
                href={`/produto/${sibling.slug}`}
                className="rounded border border-ink/20 px-3 py-1.5 text-xs font-semibold text-ink hover:border-ink"
              >
                {VERSION_LABEL[sibling.version]}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">
            Tamanho <span className="text-bancada-red">*</span>
          </p>
          <SizeGuideModal line={product.line} version={product.version} />
        </div>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stock === 0}
              onClick={() => {
                setSelectedSize(v.size)
                setSizeError(null)
              }}
              className={cx(
                'h-10 min-w-10 rounded border px-3 text-sm font-semibold',
                v.stock === 0 && 'cursor-not-allowed opacity-30 line-through',
                selectedSize === v.size ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink'
              )}
            >
              {v.size}
            </button>
          ))}
        </div>
        {sizeError && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-bancada-red">
            {sizeError}
          </p>
        )}
      </div>

      {product.personalizationAvailable && (
        <div className="rounded border border-ink/10 p-4">
          <Checkbox
            id="personalize"
            checked={wantsPersonalization}
            onChange={(e) => setWantsPersonalization(e.target.checked)}
            label={
              <>
                Quero personalizar com nome e número{' '}
                {product.personalizationPriceAddOn && (
                  <span className="text-ink-muted">(+{product.personalizationPriceAddOn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</span>
                )}
              </>
            }
          />
          {wantsPersonalization && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                label="Nome"
                maxLength={12}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={personalizationErrors.name}
                placeholder="Ex.: SILVA"
              />
              <Input
                label="Número"
                inputMode="numeric"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                error={personalizationErrors.number}
                placeholder="Ex.: 10"
              />
            </div>
          )}
          <p className="mt-2 text-xs text-ink-muted">
            Produtos personalizados podem ter regras específicas de troca — ver{' '}
            <Link href="/institucional/personalizacao" className="underline">
              Política de Personalização
            </Link>
            , respeitando o Código de Defesa do Consumidor.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded border border-ink/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="p-3 text-ink hover:text-bancada-red"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-sm" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Aumentar quantidade"
            className="p-3 text-ink hover:text-bancada-red"
          >
            <Plus size={16} />
          </button>
        </div>

        <Button variant="outline" size="lg" className="px-3" onClick={() => toggleFavorite(product.id)} aria-pressed={favorite}>
          <Heart size={18} className={favorite ? 'fill-bancada-red text-bancada-red' : ''} />
        </Button>
        <Button variant="outline" size="lg" className="px-3" onClick={handleShare} aria-label="Compartilhar produto">
          <Share2 size={18} />
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" variant="secondary" className="flex-1" onClick={handleAddToCart}>
          Adicionar ao carrinho
        </Button>
        <Button size="lg" className="flex-1" onClick={handleBuyNow}>
          Comprar agora
        </Button>
      </div>

      <a
        href={whatsappLink(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('whatsapp_click', { context: 'product', product_id: product.id })}
        className="flex items-center justify-center gap-2 text-sm font-medium text-ink hover:text-bancada-red"
      >
        <MessageCircle size={16} /> Dúvidas sobre este produto? Fale conosco no WhatsApp
      </a>

      <ShippingEstimator subtotal={finalPrice * quantity} />

      <p className="text-xs text-ink-muted">
        Prazo de processamento e envio detalhados na aba &ldquo;Descrição&rdquo; abaixo e em{' '}
        <Link href="/institucional/prazos-envio" className="underline">
          Prazos de Envio
        </Link>
        . Trocas conforme a{' '}
        <Link href="/institucional/trocas-devolucoes" className="underline">
          Política de Trocas e Devoluções
        </Link>
        .
      </p>
    </div>
  )
}
