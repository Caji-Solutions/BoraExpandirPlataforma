export interface OrcamentoItem {
  id: string
  documentoNome: string
  clienteNome: string
  clienteEmail: string
  clienteTelefone: string
  parIdiomas: {
    origem: string
    destino: string
  }
  numeroPaginas?: number
  numeroPalavras?: number
  prazoDesejado: string
  observacoes?: string
  status: 'pendente' | 'respondido' | 'aceito' | 'recusado'
  valorOrcamento?: number
  prazoEntrega?: string
  created_at: string
  updated_at: string
}

export interface OrcamentoFormData {
  valorOrcamento: number
  prazoEntrega: string
  observacoes?: string
}
