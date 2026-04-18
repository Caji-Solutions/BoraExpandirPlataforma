import { supabase } from '../config/SupabaseClient'
import type {
  FuncionarioDetailsResponse,
  FuncionarioMetricas,
  KpisTime,
  Nivel,
  TeamMetricsResponse,
} from '../types/supervisorMetrics'

// agendamentos.status enum observado no código: 'agendado' | 'confirmado' | 'cancelado' | 'realizado' | 'Conflito'
// (validado em Task 0 do plano 2026-04-18-supervisor-comercial-metricas)

const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:?\d{2})$/

// Defesa em profundidade: valida que o valor foi previamente sanitizado
// antes de concatenar em filtros PostgREST (ver SupervisorMetricsController.parsePeriodo).
function assertISO(label: string, value: string): void {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) {
    throw new Error(`${label} inválido: esperado ISO-8601, recebido "${value}"`)
  }
}

export interface DelegadoBasico {
  id: string
  full_name: string
  email: string
  nivel: Nivel
}

interface ComissaoCacheEntry {
  valor: number
  expiresAt: number
}
const COMISSAO_TTL_MS = 60_000

class SupervisorMetricsService {
  private comissaoCache = new Map<string, ComissaoCacheEntry>()

  private async getComissaoCached(
    funcionarioId: string,
    cargo: string,
    mes: number,
    ano: number
  ): Promise<number> {
    const key = `${funcionarioId}:${cargo}:${mes}:${ano}`
    const now = Date.now()
    const cached = this.comissaoCache.get(key)
    if (cached && cached.expiresAt > now) return cached.valor

    try {
      const ComissaoService = (await import('./ComissaoService')).default
      const r: any = await ComissaoService.calcularComissao(funcionarioId, cargo, mes, ano)
      const valor = Number(r?.comissao_brl || r?.totalComissao || 0)
      this.comissaoCache.set(key, { valor, expiresAt: now + COMISSAO_TTL_MS })
      return valor
    } catch {
      return 0
    }
  }

  async getDelegados(supervisorId: string): Promise<DelegadoBasico[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, nivel, cargo, role')
      .eq('supervisor_id', supervisorId)
      .eq('role', 'comercial')
      .order('full_name', { ascending: true })

    if (error) throw error

    return (data || []).map((d: any) => ({
      id: d.id,
      full_name: d.full_name,
      email: d.email,
      nivel: this.normalizeNivel(d.nivel, d.cargo),
    }))
  }

  async getTeamMetrics(
    supervisorId: string,
    startDate: string,
    endDate: string
  ): Promise<TeamMetricsResponse> {
    assertISO('startDate', startDate)
    assertISO('endDate', endDate)

    const delegados = await this.getDelegados(supervisorId)
    const ids = delegados.map((d) => d.id)

    if (ids.length === 0) {
      return {
        periodo: { start: startDate, end: endDate },
        kpisTime: this.zeroKpis(),
        funcionarios: [],
      }
    }

    const [leadsRes, agendamentosRes, contratosRes] = await Promise.all([
      supabase
        .from('clientes')
        .select('id, criado_por, criado_em')
        .in('criado_por', ids)
        .gte('criado_em', startDate)
        .lte('criado_em', endDate),
      supabase
        .from('agendamentos')
        .select('id, usuario_id, data_hora, status, valor')
        .in('usuario_id', ids)
        .gte('data_hora', startDate)
        .lte('data_hora', endDate),
      // Contratos: considera "dentro do período" se (a) foi pago nele OU (b)
      // ainda não foi pago mas foi criado nele. Contratos sem pagamento são
      // filtrados novamente depois por `isContratoFechado` quando vão para
      // faturamento/assessoriasFechadas — só sobram na contagem de "iniciadas".
      supabase
        .from('contratos_servicos')
        .select(
          'id, usuario_id, servico_valor, assinatura_status, pagamento_status, status_contrato, criado_em, pagamento_verificado_em'
        )
        .in('usuario_id', ids)
        .or(
          `and(pagamento_verificado_em.gte.${startDate},pagamento_verificado_em.lte.${endDate}),` +
            `and(pagamento_verificado_em.is.null,criado_em.gte.${startDate},criado_em.lte.${endDate})`
        ),
    ])

    if (leadsRes.error) throw leadsRes.error
    if (agendamentosRes.error) throw agendamentosRes.error
    if (contratosRes.error) throw contratosRes.error

    const leads = leadsRes.data || []
    const agendamentos = agendamentosRes.data || []
    const contratos = contratosRes.data || []

    // Comissões: ComissaoService usa janela do mês corrente (divergência do
    // período filtrado, aceita por design — UI exibe sublabel "Mês corrente").
    // Cache em memória de 60s mitiga o N+1 quando o supervisor fica na tela.
    const now = new Date()
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()
    const comissoes = await Promise.all(
      delegados.map(async (d) => {
        const cargo = d.nivel === 'HEAD' ? 'HEAD' : d.nivel
        const valor = await this.getComissaoCached(d.id, cargo, mes, ano)
        return { id: d.id, valor }
      })
    )
    const comissaoMap = new Map(comissoes.map((c) => [c.id, c.valor]))

    const funcionarios: FuncionarioMetricas[] = delegados.map((d) => {
      const leadsCriados = leads.filter((l: any) => l.criado_por === d.id).length
      const myAgendamentos = agendamentos.filter((a: any) => a.usuario_id === d.id)
      const consultoriasAgendadas = myAgendamentos.length
      const consultoriasRealizadas = myAgendamentos.filter((a: any) =>
        this.isConsultoriaRealizada(a)
      ).length
      const taxaComparecimento =
        consultoriasAgendadas > 0 ? consultoriasRealizadas / consultoriasAgendadas : 0
      const taxaConversaoLeadConsultoria =
        leadsCriados > 0 ? consultoriasAgendadas / leadsCriados : 0

      const isC2 = d.nivel === 'C2'
      const myContratos = contratos.filter((c: any) => c.usuario_id === d.id)
      const myContratosFechados = myContratos.filter((c: any) => this.isContratoFechado(c))
      // "Iniciadas" = contratos que efetivamente entraram no fluxo no período
      // (exclui cancelados/inválidos — são ruído, não assessoria iniciada).
      const myContratosIniciados = myContratos.filter(
        (c: any) =>
          c.status_contrato !== 'CANCELADO' && c.status_contrato !== 'INVALIDO'
      )
      const assessoriasIniciadas = isC2 ? myContratosIniciados.length : null
      const assessoriasFechadas = isC2 ? myContratosFechados.length : null
      const faturamentoGerado = isC2
        ? myContratosFechados.reduce(
            (sum: number, c: any) => sum + Number(c.servico_valor || 0),
            0
          )
        : null
      const ticketMedio =
        isC2 && assessoriasFechadas! > 0
          ? faturamentoGerado! / assessoriasFechadas!
          : isC2
          ? 0
          : null
      const taxaConversaoConsultoriaAssessoria = isC2
        ? consultoriasRealizadas > 0
          ? assessoriasFechadas! / consultoriasRealizadas
          : 0
        : null

      return {
        id: d.id,
        nome: d.full_name,
        nivel: d.nivel,
        leadsCriados,
        consultoriasAgendadas,
        consultoriasRealizadas,
        taxaComparecimento,
        taxaConversaoLeadConsultoria,
        assessoriasIniciadas,
        assessoriasFechadas,
        taxaConversaoConsultoriaAssessoria,
        ticketMedio,
        faturamentoGerado,
        comissaoAcumulada: comissaoMap.get(d.id) || 0,
        ranking: 0,
      }
    })

    // Ranking por nível: C1 por leadsCriados, C2 por faturamentoGerado
    const c1s = funcionarios
      .filter((f) => f.nivel === 'C1')
      .sort((a, b) => b.leadsCriados - a.leadsCriados)
    c1s.forEach((f, i) => {
      f.ranking = i + 1
    })
    const c2s = funcionarios
      .filter((f) => f.nivel === 'C2')
      .sort((a, b) => (b.faturamentoGerado || 0) - (a.faturamentoGerado || 0))
    c2s.forEach((f, i) => {
      f.ranking = i + 1
    })

    return {
      periodo: { start: startDate, end: endDate },
      kpisTime: this.aggregateKpis(funcionarios),
      funcionarios,
    }
  }

  async getFuncionarioDetalhes(
    funcionarioId: string,
    supervisorId: string,
    startDate: string,
    endDate: string
  ): Promise<FuncionarioDetailsResponse> {
    assertISO('startDate', startDate)
    assertISO('endDate', endDate)

    const delegados = await this.getDelegados(supervisorId)
    const funcionario = delegados.find((d) => d.id === funcionarioId)
    if (!funcionario) {
      const err: any = new Error('Funcionário não pertence à equipe deste supervisor')
      err.status = 403
      throw err
    }

    const [leadsRes, agendamentosRes, contratosRes] = await Promise.all([
      supabase
        .from('clientes')
        .select('id, nome, telefone, status, criado_em, criado_por')
        .eq('criado_por', funcionarioId)
        .gte('criado_em', startDate)
        .lte('criado_em', endDate)
        .order('criado_em', { ascending: false }),
      supabase
        .from('agendamentos')
        .select('id, cliente_id, cliente_nome, data_hora, status, valor, usuario_id')
        .eq('usuario_id', funcionarioId)
        .gte('data_hora', startDate)
        .lte('data_hora', endDate)
        .order('data_hora', { ascending: false }),
      supabase
        .from('contratos_servicos')
        .select(
          'id, cliente_id, cliente_nome, servico_valor, status_contrato, assinatura_status, pagamento_status, criado_em, pagamento_verificado_em, usuario_id'
        )
        .eq('usuario_id', funcionarioId)
        .or(
          `and(pagamento_verificado_em.gte.${startDate},pagamento_verificado_em.lte.${endDate}),` +
            `and(pagamento_verificado_em.is.null,criado_em.gte.${startDate},criado_em.lte.${endDate})`
        )
        .order('criado_em', { ascending: false }),
    ])

    if (leadsRes.error) throw leadsRes.error
    if (agendamentosRes.error) throw agendamentosRes.error
    if (contratosRes.error) throw contratosRes.error

    const leads = leadsRes.data || []
    const agendamentos = agendamentosRes.data || []
    const contratos = contratosRes.data || []

    const leadsPorDia = this.bucketPorDia(leads, 'criado_em')
    const consultoriasPorStatus = this.countBy(agendamentos, 'status')
    const assessoriasPorStatus = this.countBy(
      contratos.map((c: any) => ({
        status: this.isContratoFechado(c) ? 'fechada' : 'em_andamento',
      })),
      'status'
    )

    return {
      funcionario: {
        id: funcionario.id,
        nome: funcionario.full_name,
        nivel: funcionario.nivel,
        email: funcionario.email,
      },
      periodo: { start: startDate, end: endDate },
      detalhamento: {
        leadsPorDia,
        consultoriasPorStatus,
        assessoriasPorStatus,
      },
      leads: leads.map((l: any) => ({
        id: l.id,
        nome: l.nome || '',
        telefone: l.telefone || '',
        status: l.status || '',
        data_criacao: l.criado_em,
      })),
      consultorias: agendamentos.map((a: any) => ({
        id: a.id,
        cliente_nome: a.cliente_nome || '',
        data_agendamento: a.data_hora,
        status: a.status || '',
        valor: a.valor != null ? Number(a.valor) : null,
      })),
      assessorias: contratos.map((c: any) => ({
        id: c.id,
        cliente_nome: c.cliente_nome || '',
        valor: Number(c.servico_valor || 0),
        status: this.isContratoFechado(c) ? 'fechada' : 'em_andamento',
        data_inicio: c.criado_em,
        data_fechamento: c.pagamento_verificado_em || null,
      })),
    }
  }

  private normalizeNivel(rawNivel?: string | null, rawCargo?: string | null): Nivel {
    const v = String(rawNivel || rawCargo || '').toUpperCase()
    if (v.includes('HEAD') || v.includes('SUPERVISOR')) return 'HEAD'
    if (v.includes('C2')) return 'C2'
    return 'C1'
  }

  private isConsultoriaRealizada(a: any): boolean {
    // Só contabiliza "realizado" explícito — evita inflar comparecimento com
    // agendamentos vencidos que ficaram sem atualização de status (no-show não marcado).
    return a.status === 'realizado'
  }

  private isContratoFechado(c: any): boolean {
    return (
      c.assinatura_status === 'aprovado' &&
      ['aprovado', 'confirmado'].includes(c.pagamento_status) &&
      c.status_contrato !== 'INVALIDO' &&
      c.status_contrato !== 'CANCELADO'
    )
  }

  private zeroKpis(): KpisTime {
    return {
      totalLeads: 0,
      consultoriasAgendadas: 0,
      consultoriasRealizadas: 0,
      taxaComparecimento: 0,
      assessoriasFechadas: 0,
      ticketMedio: 0,
      faturamentoTotal: 0,
      comissaoTimeTotal: 0,
    }
  }

  private aggregateKpis(funcs: FuncionarioMetricas[]): KpisTime {
    const totalLeads = funcs.reduce((s, f) => s + f.leadsCriados, 0)
    const consultoriasAgendadas = funcs.reduce((s, f) => s + f.consultoriasAgendadas, 0)
    const consultoriasRealizadas = funcs.reduce((s, f) => s + f.consultoriasRealizadas, 0)
    const assessoriasFechadas = funcs.reduce((s, f) => s + (f.assessoriasFechadas || 0), 0)
    const faturamentoTotal = funcs.reduce((s, f) => s + (f.faturamentoGerado || 0), 0)
    const comissaoTimeTotal = funcs.reduce((s, f) => s + f.comissaoAcumulada, 0)

    return {
      totalLeads,
      consultoriasAgendadas,
      consultoriasRealizadas,
      taxaComparecimento:
        consultoriasAgendadas > 0 ? consultoriasRealizadas / consultoriasAgendadas : 0,
      assessoriasFechadas,
      ticketMedio: assessoriasFechadas > 0 ? faturamentoTotal / assessoriasFechadas : 0,
      faturamentoTotal,
      comissaoTimeTotal,
    }
  }

  private bucketPorDia(
    rows: any[],
    dateField: string
  ): Array<{ data: string; qtd: number }> {
    const map = new Map<string, number>()
    for (const r of rows) {
      const d = r[dateField]
      if (!d) continue
      const key = String(d).slice(0, 10)
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([data, qtd]) => ({ data, qtd }))
      .sort((a, b) => a.data.localeCompare(b.data))
  }

  private countBy(rows: any[], field: string): Record<string, number> {
    const acc: Record<string, number> = {}
    for (const r of rows) {
      const k = String(r[field] || 'desconhecido')
      acc[k] = (acc[k] || 0) + 1
    }
    return acc
  }
}

export default new SupervisorMetricsService()
