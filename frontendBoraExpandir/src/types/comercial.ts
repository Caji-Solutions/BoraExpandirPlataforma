export interface Cliente {
  id: string
  client_id?: string
  nome: string
  email: string
  telefone: string
  whatsapp?: string
  documento: string
  endereco?: string
  status?: string
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
  cliente?: Partial<Cliente>
  titulo: string
  descricao: string
  valor: number
  status: 'rascunho' | 'aguardando_assinatura' | 'assinado' | 'cancelado' | 'formularios' | 'aguardando_consultoria' | 'clientes_c2' | 'aguardando_assessoria' | 'assessoria_andamento' | 'assessoria_finalizada'
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
  assinado_por: string // nome do signatÃ¡rio
  tipo: 'cliente' | 'empresa'
  ip_assinatura: string
  data_assinatura: string
  hash_documento: string
}

export interface Lead {
  id: string
  nome: string
  email?: string | null
  telefone: string
  empresa?: string
  status: 'pendente' | 'contatado' | 'qualificado' | 'convertido' | 'perdido'
  origem_ia?: boolean
  created_at: string
  updated_at: string
}

export interface LeadFormData {
  nome: string
  email?: string | null
  telefone: string
  empresa?: string
  origem_ia?: boolean
}

export interface Agendamento {
  id: string
  data: string
  hora: string
  cliente: Cliente
  cliente_id?: string
  duracao_minutos: number
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'aguardando_verificacao'
  cliente_is_user?: boolean
  observacoes?: string
  comprovante_url?: string | null
  pagamento_status?: 'pendente' | 'em_analise' | 'aprovado' | 'recusado' | null
  pagamento_nota_recusa?: string | null
  conflito_horario?: boolean
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

export type ContratoAssinaturaStatus = 'pendente' | 'em_analise' | 'aprovado' | 'recusado'
export type ContratoPagamentoStatus = 'pendente' | 'em_analise' | 'aprovado' | 'recusado'

export interface ContratoDraftErroGeracao {
  ativo: boolean
  etapa?: number
  mensagem?: string
  ocorrido_em?: string
}

export interface ContratoServico {
  id: string
  cliente_id: string
  usuario_id?: string | null
  servico_id?: string | null
  servico_nome?: string | null
  servico_valor?: number | null
  cliente_nome?: string | null
  cliente_email?: string | null
  cliente_telefone?: string | null
  assinatura_status: ContratoAssinaturaStatus
  assinatura_recusa_nota?: string | null
  contrato_assinado_url?: string | null
  pagamento_status: ContratoPagamentoStatus
  pagamento_comprovante_url?: string | null
  pagamento_nota_recusa?: string | null
  pagamento_comprovante_upload_em?: string | null
  contrato_gerado_url?: string | null
  is_draft?: boolean
  etapa_fluxo?: number
  draft_dados?: Record<string, any> & {
    __erroGeracao?: ContratoDraftErroGeracao
  }
  criado_em?: string
  atualizado_em?: string
  cliente?: Partial<Cliente>
  servico?: {
    id: string
    nome?: string
    valor?: number
    tipo?: string
  }
}
