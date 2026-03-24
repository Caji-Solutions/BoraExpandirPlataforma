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

export interface OrcamentoItem {
  id: string
  documentoNome: string
  clienteNome: string
  clienteEmail: string
  clienteTelefone: string
  storagePath: string
  publicUrl?: string
  parIdiomas: {
    origem: string
    destino: string
  }
  numeroPaginas?: number
  numeroPalavras?: number
  prazoDesejado: string
  observacoes?: string
  status: 'pendente' | 'respondido' | 'aprovado' | 'recusado'
  valorOrcamento?: number
  prazoEntrega?: string
  created_at: string
  updated_at: string
  documentoId: string
  processoId?: string
  dependenteId?: string
  dependente?: {
    id: string
    nome_completo: string
    parentesco: string
  }
  traducaoUrl?: string
  traducaoStoragePath?: string
  traducaoNomeOriginal?: string
  rawStatus?: string
}

export interface OrcamentoFormData {
  valorOrcamento: number
  prazoEntrega: string
  observacoes?: string
  documentoId: string
}
