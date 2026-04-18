export type Nivel = 'C1' | 'C2' | 'HEAD'

export interface FuncionarioMetricas {
  id: string
  nome: string
  nivel: Nivel
  leadsCriados: number
  consultoriasAgendadas: number
  consultoriasRealizadas: number
  taxaComparecimento: number
  taxaConversaoLeadConsultoria: number
  assessoriasIniciadas: number | null
  assessoriasFechadas: number | null
  taxaConversaoConsultoriaAssessoria: number | null
  ticketMedio: number | null
  faturamentoGerado: number | null
  comissaoAcumulada: number
  ranking: number
}

export interface KpisTime {
  totalLeads: number
  consultoriasAgendadas: number
  consultoriasRealizadas: number
  taxaComparecimento: number
  assessoriasFechadas: number
  ticketMedio: number
  faturamentoTotal: number
  comissaoTimeTotal: number
}

export interface TeamMetricsResponse {
  periodo: { start: string; end: string }
  kpisTime: KpisTime
  funcionarios: FuncionarioMetricas[]
}

export interface FuncionarioDetailsResponse {
  funcionario: { id: string; nome: string; nivel: Nivel; email: string }
  periodo: { start: string; end: string }
  detalhamento: {
    leadsPorDia: Array<{ data: string; qtd: number }>
    consultoriasPorStatus: Record<string, number>
    assessoriasPorStatus: Record<string, number>
  }
  leads: Array<{ id: string; nome: string; telefone: string; status: string; data_criacao: string }>
  consultorias: Array<{ id: string; cliente_nome: string; data_agendamento: string; status: string; valor: number | null }>
  assessorias: Array<{ id: string; cliente_nome: string; valor: number; status: string; data_inicio: string; data_fechamento: string | null }>
}

export type PeriodPreset = 'hoje' | 'semana' | 'mes' | 'ano' | 'custom'

export interface PeriodValue {
  preset: PeriodPreset
  start: string
  end: string
}
