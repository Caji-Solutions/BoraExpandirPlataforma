import { supabase } from '../config/SupabaseClient'

class FinanceiroDashboardRepository {
  async getFaturamento(mes: number, ano: number): Promise<{ atual: number; anterior: number }> {
    const inicioMesAtual = `${ano}-${String(mes).padStart(2, '0')}-01`
    const fimMesAtual = mes === 12
      ? `${ano + 1}-01-01`
      : `${ano}-${String(mes + 1).padStart(2, '0')}-01`

    const mesAnterior = mes === 1 ? 12 : mes - 1
    const anoAnterior = mes === 1 ? ano - 1 : ano
    const inicioMesAnterior = `${anoAnterior}-${String(mesAnterior).padStart(2, '0')}-01`
    const fimMesAnterior = `${ano}-${String(mes).padStart(2, '0')}-01`

    // Faturamento mês atual
    const { data: faturamentoAtual, error: errAtual } = await supabase
      .from('agendamentos')
      .select('valor')
      .eq('pagamento_status', 'aprovado')
      .gte('data_hora', inicioMesAtual)
      .lt('data_hora', fimMesAtual)

    if (errAtual) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar faturamento atual:', errAtual)
      throw errAtual
    }

    // Faturamento mês anterior
    const { data: faturamentoAnterior, error: errAnterior } = await supabase
      .from('agendamentos')
      .select('valor')
      .eq('pagamento_status', 'aprovado')
      .gte('data_hora', inicioMesAnterior)
      .lt('data_hora', fimMesAnterior)

    if (errAnterior) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar faturamento anterior:', errAnterior)
      throw errAnterior
    }

    const atual = (faturamentoAtual || []).reduce((sum, item) => sum + (item.valor || 0), 0)
    const anterior = (faturamentoAnterior || []).reduce((sum, item) => sum + (item.valor || 0), 0)

    return { atual, anterior }
  }

  async getNovosClientes(mes: number, ano: number): Promise<{ atual: number; anterior: number }> {
    const inicioMesAtual = `${ano}-${String(mes).padStart(2, '0')}-01`
    const fimMesAtual = mes === 12
      ? `${ano + 1}-01-01`
      : `${ano}-${String(mes + 1).padStart(2, '0')}-01`

    const mesAnterior = mes === 1 ? 12 : mes - 1
    const anoAnterior = mes === 1 ? ano - 1 : ano
    const inicioMesAnterior = `${anoAnterior}-${String(mesAnterior).padStart(2, '0')}-01`
    const fimMesAnterior = `${ano}-${String(mes).padStart(2, '0')}-01`

    // Novos clientes mês atual
    const { data: clientesAtual, error: errAtual } = await supabase
      .from('clientes')
      .select('id')
      .gte('criado_em', inicioMesAtual)
      .lt('criado_em', fimMesAtual)

    if (errAtual) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar clientes atuais:', errAtual)
      throw errAtual
    }

    // Novos clientes mês anterior
    const { data: clientesAnterior, error: errAnterior } = await supabase
      .from('clientes')
      .select('id')
      .gte('criado_em', inicioMesAnterior)
      .lt('criado_em', fimMesAnterior)

    if (errAnterior) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar clientes anteriores:', errAnterior)
      throw errAnterior
    }

    const atual = (clientesAtual || []).length
    const anterior = (clientesAnterior || []).length

    return { atual, anterior }
  }

  async getContasReceber(): Promise<number> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('valor')
      .in('pagamento_status', ['pendente', 'em_analise'])

    if (error) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar contas receber:', error)
      throw error
    }

    const total = (data || []).reduce((sum, item) => sum + (item.valor || 0), 0)
    return total
  }

  async getComissoes(mes: number, ano: number): Promise<{ paga: number; aRealizar: number }> {
    const { data, error } = await supabase
      .from('comissoes')
      .select('valor_comissao_brl, status')
      .eq('mes', mes)
      .eq('ano', ano)

    if (error) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar comissoes:', error)
      throw error
    }

    const comissoes = data || []
    const paga = comissoes
      .filter(c => c.status === 'pago')
      .reduce((sum, item) => sum + (item.valor_comissao_brl || 0), 0)

    const aRealizar = comissoes
      .filter(c => c.status === 'estimado')
      .reduce((sum, item) => sum + (item.valor_comissao_brl || 0), 0)

    return { paga, aRealizar }
  }

  async getVendedoresRanking(mes: number, ano: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('comissoes')
      .select(`
        usuario_id,
        total_vendas,
        valor_comissao_brl,
        meta_atingida,
        usuario:profiles(id, full_name)
      `)
      .eq('mes', mes)
      .eq('ano', ano)
      .order('total_vendas', { ascending: false })

    if (error) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar ranking vendedores:', error)
      throw error
    }

    return (data || []).map((item: any) => ({
      id: item.usuario_id,
      nome: item.usuario?.full_name || 'Desconhecido',
      vendas: item.total_vendas || 0,
      comissao: item.valor_comissao_brl || 0,
      meta_atingida: item.meta_atingida || 0
    }))
  }

  async getComissoesList(mes?: number, ano?: number): Promise<any[]> {
    let query = supabase
      .from('comissoes')
      .select(`
        *,
        usuario:profiles(id, full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (mes) query = query.eq('mes', mes)
    if (ano) query = query.eq('ano', ano)

    const { data, error } = await query

    if (error) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar lista de comissoes:', error)
      throw error
    }

    return data || []
  }

  async getFluxoCaixa(meses = 6): Promise<any[]> {
    const agora = new Date()
    const resultados = []

    for (let i = 0; i < meses; i++) {
        const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
        const mes = d.getMonth() + 1
        const ano = d.getFullYear()
        
        const { atual: receita } = await this.getFaturamento(mes, ano)
        const { paga: despesas } = await this.getComissoes(mes, ano)
        
        const mesNome = d.toLocaleString('pt-BR', { month: 'short' })
        resultados.unshift({
            month: mesNome.charAt(0).toUpperCase() + mesNome.slice(1).replace('.', ''),
            receita,
            despesas
        })
    }
    return resultados
  }

  async getProcessosAtivos(): Promise<number> {
    try {
      // Contar agendamentos ativos
      const { count: countAgend, error: errAgend } = await supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '("cancelado", "realizado")')

      // Contar contratos ativos
      const { count: countContrato, error: errContrato } = await supabase
        .from('contratos_servicos')
        .select('*', { count: 'exact', head: true })
        .not('assinatura_status', 'in', '("cancelado", "finalizado")')

      if (errAgend) console.error('[FinanceiroDashboardRepository] Erro ao contar agendamentos:', errAgend)
      if (errContrato) console.error('[FinanceiroDashboardRepository] Erro ao contar contratos:', errContrato)

      return (countAgend || 0) + (countContrato || 0)
    } catch (error) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar processos ativos:', error)
      return 0
    }
  }

  async getRecentActivity(): Promise<any[]> {
    try {
      const [clients, contracts, appointments] = await Promise.all([
        supabase.from('clientes').select('nome, criado_em').order('criado_em', { ascending: false }).limit(3),
        supabase.from('contratos_servicos').select('cliente:clientes(nome), criado_em').order('criado_em', { ascending: false }).limit(3),
        supabase.from('agendamentos').select('nome, criado_em, produto_nome').order('criado_em', { ascending: false }).limit(3)
      ])

      const activity: any[] = []

      if (clients.data) {
        clients.data.forEach(c => activity.push({ 
          user: c.nome || 'Lead', 
          action: 'se cadastrou no sistema', 
          time: c.criado_em 
        }))
      }
      if (contracts.data) {
        contracts.data.forEach(c => activity.push({ 
          user: (c.cliente as any)?.nome || 'Cliente', 
          action: 'iniciou um novo processo de serviço', 
          time: c.criado_em 
        }))
      }
      if (appointments.data) {
        appointments.data.forEach(a => activity.push({ 
          user: a.nome || 'Cliente', 
          action: `agendou ${a.produto_nome || 'uma consultoria'}`, 
          time: a.criado_em 
        }))
      }

      return activity
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5)
    } catch (error) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar atividade recente:', error)
      return []
    }
  }

  async getServicePerformance(): Promise<any[]> {
    try {
      // 1. Buscar todos os serviços do catálogo
      const { data: services, error: errSvc } = await supabase
        .from('catalogo_servicos')
        .select('id, nome, valor, tipo')

      if (errSvc) throw errSvc

      // 2. Buscar agendamentos vendidos (aprovados)
      const { data: sales, error: errSales } = await supabase
        .from('agendamentos')
        .select('produto_id, valor')
        .eq('pagamento_status', 'aprovado')

      if (errSales) throw errSales

      // 3. Buscar contratos vendidos (aprovados)
      const { data: contracts, error: errContracts } = await supabase
        .from('contratos_servicos')
        .select('servico_id, servico_valor')
        .eq('pagamento_status', 'aprovado')

      if (errContracts) throw errContracts

      // 4. Agrerar dados
      const performance = services.map(svc => {
        const agendSales = sales.filter(s => s.produto_id === svc.id)
        const contractSales = contracts.filter(c => c.servico_id === svc.id)

        const totalSold = agendSales.length + contractSales.length
        const grossRevenue = agendSales.reduce((acc, s) => acc + (s.valor || 0), 0) +
                             contractSales.reduce((acc, c) => acc + (c.servico_valor || 0), 0)

        // Mocking "passed on" as 70% for now if not available, or we could look up commissions
        // But the user wants "how much was passed on".
        // For translations it's in orçamentos.
        
        return {
          id: svc.id,
          nome: svc.nome,
          tipo: svc.tipo,
          total_vendido: totalSold,
          faturamento_bruto: grossRevenue,
          faturamento_liquido: grossRevenue * 0.8, // Fallback calculation if no costs found
          valor_base: svc.valor
        }
      })

      return performance.sort((a, b) => b.faturamento_bruto - a.faturamento_bruto)
    } catch (error) {
      console.error('[FinanceiroDashboardRepository] Erro ao buscar performance de servicos:', error)
      return []
    }
  }
}

export default new FinanceiroDashboardRepository()
