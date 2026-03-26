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
}

export default new FinanceiroDashboardRepository()
