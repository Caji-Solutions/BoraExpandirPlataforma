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
  stage?: 'formularios' | 'aguardando_consultoria' | 'clientes_c2' | 'aguardando_assessoria' | 'assessoria_andamento' | 'assessoria_finalizada' | 'cancelado'
  previsao_chegada?: string
  foto_perfil?: string
}
