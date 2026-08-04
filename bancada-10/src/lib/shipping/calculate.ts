export interface ShippingOption {
  id: string
  carrier: string
  service: string
  price: number
  estimatedBusinessDays: number
}

export interface ShippingQuoteInput {
  zipCode: string
  subtotal: number
}

/**
 * Contrato de cálculo de frete. Hoje devolve uma estimativa local simples,
 * sem chamar nenhum serviço externo — serve para a UI (carrinho, PDP e
 * checkout) funcionar de ponta a ponta antes da transportadora ser definida.
 *
 * Para integrar de verdade (Melhor Envio, Correios, API do fornecedor):
 * 1. Preencher SHIPPING_PROVIDER / SHIPPING_API_KEY / SHIPPING_ORIGIN_ZIP_CODE em .env.
 * 2. Substituir o corpo desta função por uma chamada real à API escolhida,
 *    mantendo a mesma assinatura (input/output) para não quebrar quem já a usa.
 */
export async function calculateShipping({ zipCode, subtotal }: ShippingQuoteInput): Promise<ShippingOption[]> {
  const cleanZip = zipCode.replace(/\D/g, '')
  if (cleanZip.length !== 8) {
    throw new Error('CEP inválido. Informe um CEP com 8 dígitos.')
  }

  const isFreeEligible = subtotal >= 399

  const standard: ShippingOption = {
    id: 'standard',
    carrier: 'Transportadora parceira',
    service: 'Envio padrão',
    price: isFreeEligible ? 0 : 24.9,
    estimatedBusinessDays: 7,
  }

  const express: ShippingOption = {
    id: 'express',
    carrier: 'Transportadora parceira',
    service: 'Envio expresso',
    price: 39.9,
    estimatedBusinessDays: 3,
  }

  return [standard, express]
}
