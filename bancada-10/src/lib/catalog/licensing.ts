import type { LicensingStatus } from '@/lib/types'

/**
 * Textos de transparência sobre licenciamento. Nunca alterar para
 * apresentar um produto não licenciado como oficial — ver instrução de
 * negócio na página de produto.
 */
export const LICENSING_INFO: Record<LicensingStatus, { label: string; description: string }> = {
  oficial_licenciada: {
    label: 'Produto oficial licenciado',
    description: 'Produzido sob licença oficial do clube/seleção/liga detentora dos direitos.',
  },
  versao_torcedor_licenciada: {
    label: 'Versão torcedor — licenciada',
    description: 'Modelagem torcedor (fan fit), produzida sob licença oficial. Tecido e corte diferentes da versão jogador.',
  },
  versao_jogador_licenciada: {
    label: 'Versão jogador — licenciada',
    description: 'Modelagem usada em campo pelo elenco profissional (player version), produzida sob licença oficial.',
  },
  retro_licenciada: {
    label: 'Retrô — licenciada',
    description: 'Releitura de um modelo histórico, produzida sob licença oficial do clube/seleção.',
  },
  alternativa_licenciada: {
    label: 'Versão alternativa — licenciada',
    description: 'Edição especial/alternativa, produzida sob licença oficial.',
  },
  inspirada_nao_licenciada: {
    label: 'Peça autoral — não licenciada por nenhum clube',
    description:
      'Design autoral da Bancada 10, sem vínculo, licenciamento ou associação com qualquer clube, seleção ou liga.',
  },
}
