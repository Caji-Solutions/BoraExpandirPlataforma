export type RegisterParceiroDTO = {
  nome: string
  email: string
  telefone?: string
  documento?: string
  [key: string]: unknown
}

export type Parceiro = {
  id: string
  nome: string
  email: string
  telefone?: string
  documento?: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface ClienteDTO {
  nome: string
  email: string
  whatsapp: string
  parceiro_id: string
  status?: 'cadastrado' | 'em_conversa' | 'proposta_enviada' | 'fechado_pago'
}
