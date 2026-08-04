interface PreferenceItem {
  title: string
  quantity: number
  unitPrice: number
}

interface CreatePreferenceInput {
  orderId: string
  items: PreferenceItem[]
  payerEmail: string
  paymentMethod: 'pix' | 'credit_card' | 'boleto'
}

/**
 * Cria uma preferência de pagamento no Mercado Pago.
 *
 * Retorna `null` quando `MERCADO_PAGO_ACCESS_TOKEN` não está configurado —
 * quem chama deve tratar isso como "gateway ainda não configurado" (modo
 * demonstração), nunca como erro fatal do checkout.
 *
 * Documentação: https://www.mercadopago.com.br/developers/pt/reference/preferences/_checkout_preferences/post
 */
export async function createMercadoPagoPreference(input: CreatePreferenceInput): Promise<{ initPoint: string } | null> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) return null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: input.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: 'BRL',
      })),
      payer: { email: input.payerEmail },
      external_reference: input.orderId,
      back_urls: {
        success: `${siteUrl}/pedido-confirmado?protocolo=${input.orderId}`,
        failure: `${siteUrl}/checkout?erro=pagamento`,
        pending: `${siteUrl}/pedido-confirmado?protocolo=${input.orderId}&status=pendente`,
      },
      auto_return: 'approved',
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
    }),
  })

  if (!response.ok) {
    throw new Error(`Falha ao criar preferência no Mercado Pago (status ${response.status}).`)
  }

  const data = (await response.json()) as { init_point?: string; sandbox_init_point?: string }
  const initPoint = data.init_point ?? data.sandbox_init_point
  if (!initPoint) throw new Error('Resposta do Mercado Pago sem init_point.')

  return { initPoint }
}
