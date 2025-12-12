export interface TraducaoItem {
  id: string
  documentoNome: string
  clienteNome: string
  parIdiomas: {
    origem: string
    destino: string
  }
  prazoSLA: string // ISO datetime
  status: 'pendente' | 'em_progresso' | 'entregue' | 'atrasado'
  created_at: string
  updated_at: string
}

export interface SLAOverview {
  entregarHoje: number
  noPrazo: number
  atrasados: number
}
