import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkoutSchema } from '@/lib/validators/checkout'
import { getProductById } from '@/lib/data/products'
import { findCoupon } from '@/lib/data/coupons'
import { calculateShipping } from '@/lib/shipping/calculate'
import { createMercadoPagoPreference } from '@/lib/mercadopago/create-preference'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { generateOrderProtocol } from '@/lib/utils/protocol'

const cartItemInputSchema = z.object({
  productId: z.string(),
  size: z.string(),
  quantity: z.number().int().positive().max(10),
  personalization: z.object({ name: z.string(), number: z.string() }).optional(),
})

const requestSchema = checkoutSchema.extend({
  items: z.array(cartItemInputSchema).min(1, 'Carrinho vazio.'),
  couponCode: z.string().optional(),
  shippingZipCode: z.string(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos.', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { identification, address, paymentMethod, items, couponCode, shippingZipCode } = parsed.data

  // Preço e disponibilidade são recalculados no servidor a partir do
  // catálogo — nunca confiar no preço enviado pelo client.
  let subtotal = 0
  const lineItems: { title: string; quantity: number; unitPrice: number }[] = []

  for (const item of items) {
    const product = getProductById(item.productId)
    if (!product) {
      return NextResponse.json({ error: `Produto ${item.productId} não encontrado.` }, { status: 400 })
    }
    const variant = product.variants.find((v) => v.size === item.size)
    if (!variant) {
      return NextResponse.json({ error: `Tamanho ${item.size} indisponível para ${product.name}.` }, { status: 400 })
    }
    if (variant.stock < item.quantity) {
      return NextResponse.json({ error: `Estoque insuficiente para ${product.name} (tamanho ${item.size}).` }, { status: 409 })
    }

    const unitPrice = product.price + (item.personalization ? product.personalizationPriceAddOn ?? 0 : 0)
    subtotal += unitPrice * item.quantity
    lineItems.push({ title: product.name, quantity: item.quantity, unitPrice })
  }

  let discount = 0
  if (couponCode) {
    const coupon = findCoupon(couponCode)
    if (coupon && (!coupon.minSubtotal || subtotal >= coupon.minSubtotal)) {
      if (coupon.type === 'percent') discount = subtotal * (coupon.value / 100)
      if (coupon.type === 'fixed') discount = Math.min(coupon.value, subtotal)
    }
  }

  const shippingOptions = await calculateShipping({ zipCode: shippingZipCode, subtotal: subtotal - discount })
  const shippingOption = shippingOptions.find((o) => o.id === parsed.data.shippingOptionId)
  if (!shippingOption) {
    return NextResponse.json({ error: 'Opção de entrega inválida.' }, { status: 400 })
  }

  const total = Math.max(subtotal - discount, 0) + shippingOption.price
  const protocol = generateOrderProtocol()

  // Persistência no Supabase — só ocorre se o projeto já estiver configurado
  // (ver .env.example). Sem isso, o pedido segue em modo demonstração.
  const supabaseAdmin = getSupabaseAdminClient()
  if (supabaseAdmin) {
    await supabaseAdmin.from('orders').insert({
      protocol,
      customer_name: identification.name,
      customer_email: identification.email,
      customer_cpf: identification.cpf,
      customer_phone: identification.phone,
      shipping_address: address,
      payment_method: paymentMethod,
      subtotal,
      discount,
      shipping_cost: shippingOption.price,
      total,
      status: 'pagamento_pendente',
      coupon_code: couponCode ?? null,
    })
  }

  let paymentRedirectUrl: string | null = null
  try {
    const preference = await createMercadoPagoPreference({
      orderId: protocol,
      items: lineItems,
      payerEmail: identification.email,
      paymentMethod,
    })
    paymentRedirectUrl = preference?.initPoint ?? null
  } catch (error) {
    // Se o Mercado Pago estiver configurado mas a chamada falhar, o pedido
    // já foi registrado — informamos o erro em vez de travar o checkout.
    return NextResponse.json(
      { error: 'Pedido registrado, mas houve falha ao iniciar o pagamento. Tente novamente ou fale conosco.' },
      { status: 502 }
    )
  }

  return NextResponse.json({
    ok: true,
    protocol,
    total,
    paymentRedirectUrl,
    demo: !paymentRedirectUrl,
  })
}
