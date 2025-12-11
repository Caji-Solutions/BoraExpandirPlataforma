export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  whatsapp?: string
  documento: string
  endereco?: string
  created_at: string
  updated_at: string
}

export interface ClienteFormData {
  nome: string
  email: string
  telefone: string
  whatsapp?: string
  documento: string
  endereco?: string
}

export interface Contrato {
  id: string
  cliente_id: string
  cliente?: Cliente
  titulo: string
  descricao: string
  valor: number
  status: 'rascunho' | 'aguardando_assinatura' | 'assinado' | 'cancelado'
  template_tipo: 'servico' | 'consultoria' | 'assessoria' | 'outro'
  conteudo_html: string
  assinatura_cliente?: AssinaturaDigital
  assinatura_empresa?: AssinaturaDigital
  created_at: string
  updated_at: string
}

export interface ContratoFormData {
  cliente_id: string
  titulo: string
  descricao: string
  valor: number
  template_tipo: 'servico' | 'consultoria' | 'assessoria' | 'outro'
  conteudo_html: string
}

export interface LinkPagamento {
  id: string
  contrato_id: string
  contrato?: Contrato
  valor: number
  descricao: string
  link: string
  status: 'ativo' | 'pago' | 'expirado' | 'cancelado'
  expira_em?: string
  pago_em?: string
  created_at: string
}

export interface LinkPagamentoFormData {
  contrato_id: string
  valor: number
  descricao: string
  expira_em?: string
}

export interface Requerimento {
  id: string
  comercial_usuario_id: string
  tipo: 'aprovacao_contrato' | 'ajuste_valor' | 'cancelamento' | 'outro'
  titulo: string
  descricao: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  resposta_admin?: string
  created_at: string
  updated_at: string
}

export interface RequerimentoFormData {
  tipo: 'aprovacao_contrato' | 'ajuste_valor' | 'cancelamento' | 'outro'
  titulo: string
  descricao: string
}

export interface AssinaturaDigital {
  id: string
  contrato_id: string
  assinado_por: string // nome do signatário
  tipo: 'cliente' | 'empresa'
  ip_assinatura: string
  data_assinatura: string
  hash_documento: string
}

export interface Lead {
  id: string
  nome: string
  email: string
  telefone: string
  empresa?: string
  status: 'pendente' | 'contatado' | 'qualificado' | 'convertido' | 'perdido'
  created_at: string
  updated_at: string
}

export interface LeadFormData {
  nome: string
  email: string
  telefone: string
  empresa?: string
}

export interface Agendamento {
  id: string
  cliente_id: string
  cliente?: Cliente
  data: string
  hora: string
  duracao_minutos: number
  produto: string
  status: 'agendado' | 'realizado' | 'cancelado'
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface AgendamentoFormData {
  cliente_id: string
  data: string
  hora: string
  duracao_minutos: number
  produto: string
  observacoes?: string
}
