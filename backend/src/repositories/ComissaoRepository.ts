import { supabase } from '../config/SupabaseClient'

class ComissaoRepository {

  async getVendasMes(usuarioId: string, mes: number, ano: number) {
    const inicioMes = new Date(Date.UTC(ano, mes - 1, 1)).toISOString()
    const fimMes = new Date(Date.UTC(ano, mes, 1)).toISOString()

    // Buscar agendamentos (Consultoria/Diversos) com pagamento aprovado ou confirmado
    const { data: agendamentos, error: errAg } = await supabase
      .from('agendamentos')
      .select('id, produto_id, produto_nome, pagamento_status, valor, data_hora')
      .eq('usuario_id', usuarioId)
      .in('pagamento_status', ['aprovado', 'confirmado'])
      .gte('data_hora', inicioMes)
      .lt('data_hora', fimMes)

    if (errAg) {
      console.error('[ComissaoRepository] Erro ao buscar agendamentos:', errAg)
      throw errAg
    }

    return agendamentos || []
  }

  async getContratosAssinados(usuarioId: string, mes: number, ano: number) {
    const inicioMes = new Date(Date.UTC(ano, mes - 1, 1)).toISOString()
    const fimMes = new Date(Date.UTC(ano, mes, 1)).toISOString()

    // Buscar contratos de assessoria assinados e validos
    const { data: contratos, error } = await supabase
      .from('contratos_servicos')
      .select(`
        id, cliente_id, servico_id, valor_total, assinatura_status,
        status_contrato, membros_count, criado_em,
        servico:catalogo_servicos(id, nome, tipo)
      `)
      .eq('usuario_id', usuarioId)
      .eq('assinatura_status', 'aprovado')
      .neq('status_contrato', 'INVALIDO')
      .neq('status_contrato', 'CANCELADO')
      .gte('criado_em', inicioMes)
      .lt('criado_em', fimMes)

    if (error) {
      console.error('[ComissaoRepository] Erro ao buscar contratos:', error)
      throw error
    }

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

  async getVendasEquipe(subordinadoIds: string[], mes: number, ano: number) {
    if (subordinadoIds.length === 0) return []

    const inicioMes = new Date(Date.UTC(ano, mes - 1, 1)).toISOString()
    const fimMes = new Date(Date.UTC(ano, mes, 1)).toISOString()

    const { data, error } = await supabase
      .from('agendamentos')
      .select('id, usuario_id, produto_nome, pagamento_status, valor, data_hora')
      .in('usuario_id', subordinadoIds)
      .in('pagamento_status', ['aprovado', 'confirmado'])
      .gte('data_hora', inicioMes)
      .lt('data_hora', fimMes)

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
