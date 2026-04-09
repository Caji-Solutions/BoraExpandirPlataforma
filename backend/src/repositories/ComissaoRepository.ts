import { supabase } from '../config/SupabaseClient'

class ComissaoRepository {
  private isMissingColumnError(error: any, columnName: string) {
    const column = String(columnName || '').toLowerCase()
    const code = String(error?.code || '').toLowerCase()
    const message = String(error?.message || '').toLowerCase()
    const details = String(error?.details || '').toLowerCase()
    const hint = String(error?.hint || '').toLowerCase()

    return code === '42703' || message.includes(column) || details.includes(column) || hint.includes(column)
  }

  // Janela movel de 30 dias a partir de agora.
  // Ignora mes/ano para que vendas aprovadas nos ultimos 30 dias sempre sejam contadas,
  // independente de cruzar a virada de mes.
  private getRollingWindow() {
    const fim = new Date()
    const inicio = new Date(fim)
    inicio.setDate(fim.getDate() - 30)
    return { inicio: inicio.toISOString(), fim: fim.toISOString() }
  }

  async getVendasMes(usuarioId: string, _mes: number, _ano: number) {
    const { inicio, fim } = this.getRollingWindow()
    const janelaPagamento = `and(pagamento_verificado_em.gte.${inicio},pagamento_verificado_em.lte.${fim})`
    const janelaAgendamento = `and(pagamento_verificado_em.is.null,data_hora.gte.${inicio},data_hora.lte.${fim})`

    console.error(`[ComissaoFix] getVendasMes - janela 30 dias: ${inicio} ate ${fim}`)

    // Buscar vendas por data real de aprovacao do pagamento.
    // Fallback legada: quando nao houver pagamento_verificado_em, usa data_hora.
    let agendamentos: any[] | null = null
    let errAg: any = null

    const queryPrincipalAgendamentos = await supabase
      .from('agendamentos')
      .select('id, produto_id, produto_nome, pagamento_status, valor, data_hora, pagamento_verificado_em')
      .eq('usuario_id', usuarioId)
      .in('pagamento_status', ['aprovado', 'confirmado'])
      .or(`${janelaPagamento},${janelaAgendamento}`)

    agendamentos = queryPrincipalAgendamentos.data
    errAg = queryPrincipalAgendamentos.error

    if (errAg && this.isMissingColumnError(errAg, 'pagamento_verificado_em')) {
      const fallback = await supabase
        .from('agendamentos')
        .select('id, produto_id, produto_nome, pagamento_status, valor, data_hora')
        .eq('usuario_id', usuarioId)
        .in('pagamento_status', ['aprovado', 'confirmado'])
        .gte('data_hora', inicio)
        .lte('data_hora', fim)

      agendamentos = fallback.data
      errAg = fallback.error
    }

    if (errAg) {
      console.error('[ComissaoRepository] Erro ao buscar agendamentos:', errAg)
      throw errAg
    }

    console.error(`[ComissaoFix] getVendasMes - agendamentos encontrados: ${(agendamentos || []).length}`)
    return agendamentos || []
  }

  async getContratosAssinados(usuarioId: string, _mes: number, _ano: number) {
    const { inicio, fim } = this.getRollingWindow()
    const janelaPagamento = `and(pagamento_verificado_em.gte.${inicio},pagamento_verificado_em.lte.${fim})`
    const janelaCriacaoLegado = `and(pagamento_verificado_em.is.null,criado_em.gte.${inicio},criado_em.lte.${fim})`

    console.error(`[ComissaoFix] getContratosAssinados - janela 30 dias: ${inicio} ate ${fim}`)

    // Buscar contratos vendidos (assinatura e pagamento aprovados).
    // Data de referencia: pagamento_verificado_em; fallback para criado_em em registros legados.
    let contratos: any[] | null = null
    let error: any = null

    const queryPrincipalContratos = await supabase
      .from('contratos_servicos')
      .select(`
        id, cliente_id, servico_id, servico_valor, assinatura_status, pagamento_status,
        status_contrato, membros_count, criado_em, pagamento_verificado_em,
        servico:catalogo_servicos(id, nome, tipo, nao_agendavel)
      `)
      .eq('usuario_id', usuarioId)
      .eq('assinatura_status', 'aprovado')
      .in('pagamento_status', ['aprovado', 'confirmado'])
      .neq('status_contrato', 'INVALIDO')
      .neq('status_contrato', 'CANCELADO')
      .or(`${janelaPagamento},${janelaCriacaoLegado}`)

    contratos = queryPrincipalContratos.data
    error = queryPrincipalContratos.error

    if (error && this.isMissingColumnError(error, 'pagamento_verificado_em')) {
      const fallback = await supabase
        .from('contratos_servicos')
        .select(`
          id, cliente_id, servico_id, servico_valor, assinatura_status, pagamento_status,
          status_contrato, membros_count, criado_em,
          servico:catalogo_servicos(id, nome, tipo, nao_agendavel)
        `)
        .eq('usuario_id', usuarioId)
        .eq('assinatura_status', 'aprovado')
        .in('pagamento_status', ['aprovado', 'confirmado'])
        .neq('status_contrato', 'INVALIDO')
        .neq('status_contrato', 'CANCELADO')
        .gte('criado_em', inicio)
        .lte('criado_em', fim)

      contratos = fallback.data
      error = fallback.error
    }

    if (error) {
      console.error('[ComissaoRepository] Erro ao buscar contratos:', error)
      throw error
    }

    console.error(`[ComissaoFix] getContratosAssinados - contratos encontrados: ${(contratos || []).length}`)
    return contratos || []
  }

  async getSubordinados(headId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, cargo')
      .eq('supervisor_id', headId)

    if (error) {
      console.error('[ComissaoRepository] Erro ao buscar subordinados:', error)
      throw error
    }

    return data || []
  }

  async getVendasEquipe(subordinadoIds: string[], _mes: number, _ano: number) {
    if (subordinadoIds.length === 0) return []

    const { inicio, fim } = this.getRollingWindow()
    const janelaPagamento = `and(pagamento_verificado_em.gte.${inicio},pagamento_verificado_em.lte.${fim})`
    const janelaAgendamento = `and(pagamento_verificado_em.is.null,data_hora.gte.${inicio},data_hora.lte.${fim})`

    let data: any[] | null = null
    let error: any = null

    const queryPrincipalEquipe = await supabase
      .from('agendamentos')
      .select('id, usuario_id, produto_nome, pagamento_status, valor, data_hora, pagamento_verificado_em')
      .in('usuario_id', subordinadoIds)
      .in('pagamento_status', ['aprovado', 'confirmado'])
      .or(`${janelaPagamento},${janelaAgendamento}`)

    data = queryPrincipalEquipe.data
    error = queryPrincipalEquipe.error

    if (error && this.isMissingColumnError(error, 'pagamento_verificado_em')) {
      const fallback = await supabase
        .from('agendamentos')
        .select('id, usuario_id, produto_nome, pagamento_status, valor, data_hora')
        .in('usuario_id', subordinadoIds)
        .in('pagamento_status', ['aprovado', 'confirmado'])
        .gte('data_hora', inicio)
        .lte('data_hora', fim)

      data = fallback.data
      error = fallback.error
    }

    if (error) {
      console.error('[ComissaoRepository] Erro ao buscar vendas da equipe:', error)
      throw error
    }

    return data || []
  }

  async saveComissao(comissao: {
    usuario_id: string
    mes: number
    ano: number
    tipo: string
    total_vendas: number
    total_faturado_eur: number
    meta_atingida: number | null
    valor_comissao_eur: number
    valor_comissao_brl: number
    taxa_cambio: number
    status?: string
  }) {
    const { data, error } = await supabase
      .from('comissoes')
      .upsert({
        ...comissao,
        calculado_em: new Date().toISOString(),
        status: comissao.status || 'estimado'
      }, { onConflict: 'usuario_id,mes,ano,tipo' })
      .select()
      .single()

    if (error) {
      console.error('[ComissaoRepository] Erro ao salvar comissao:', error)
      throw error
    }

    return data
  }

  async getComissoesByUsuario(usuarioId: string, ano?: number) {
    let query = supabase
      .from('comissoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })

    if (ano) {
      query = query.eq('ano', ano)
    }

    const { data, error } = await query

    if (error) {
      console.error('[ComissaoRepository] Erro ao buscar comissoes:', error)
      throw error
    }

    return data || []
  }

  async getComissoesRelatorio(mes: number, ano: number) {
    const { data, error } = await supabase
      .from('comissoes')
      .select(`
        *,
        usuario:profiles(id, full_name, email, cargo)
      `)
      .eq('mes', mes)
      .eq('ano', ano)
      .order('valor_comissao_eur', { ascending: false })

    if (error) {
      console.error('[ComissaoRepository] Erro ao buscar relatorio de comissoes:', error)
      throw error
    }

    return data || []
  }

  async getMembrosContrato(contratoId: string) {
    const { data, error } = await supabase
      .from('contratos_servicos')
      .select('membros_count, valor_por_membro')
      .eq('id', contratoId)
      .single()

    if (error) {
      console.error('[ComissaoRepository] Erro ao buscar membros do contrato:', error)
      return { membros_count: 1, valor_por_membro: 0 }
    }

    return data || { membros_count: 1, valor_por_membro: 0 }
  }

  async fecharComissoesMensais(mes: number, ano: number) {
    const { error } = await supabase
      .from('comissoes')
      .update({ status: 'fechado' })
      .eq('status', 'estimado')
      .eq('mes', mes)
      .eq('ano', ano)

    if (error) {
      console.error('[ComissaoRepository] Erro ao fechar comissoes:', error)
      throw error
    }
    
    return true
  }
}

export default new ComissaoRepository()
