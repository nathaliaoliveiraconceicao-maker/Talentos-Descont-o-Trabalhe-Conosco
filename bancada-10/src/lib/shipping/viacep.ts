export interface ViaCepResult {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

/**
 * Busca endereço por CEP via ViaCEP (serviço público gratuito, sem chave de
 * API). Usado só para preencher o formulário automaticamente — falhas são
 * silenciosas e o cliente sempre pode preencher manualmente.
 */
export async function lookupCep(cep: string): Promise<ViaCepResult | null> {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    if (!response.ok) return null
    const data = (await response.json()) as ViaCepResult
    if (data.erro) return null
    return data
  } catch {
    return null
  }
}
