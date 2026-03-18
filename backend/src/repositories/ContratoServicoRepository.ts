import { supabase } from '../config/SupabaseClient'

class ContratoServicoRepository {
  async createContrato(payload: any) {
    const { data, error } = await supabase
      .from('contratos_servicos')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error('[ContratoServicoRepository] Erro ao criar contrato:', error)
      throw error
    }

    return data
  }

  async getContratos(filters?: { clienteId?: string; isDraft?: boolean }) {
    let query = supabase
      .from('contratos_servicos')
      .select(`
        *,
        cliente:clientes(id, nome, email, whatsapp, status, client_id),
        servico:catalogo_servicos(id, nome, valor, tipo)
      `)
      .order('criado_em', { ascending: false })

    if (filters?.clienteId) {
      query = query.eq('cliente_id', filters.clienteId)
    }

    if (filters?.isDraft !== undefined) {
      query = query.eq('is_draft', filters.isDraft)
    }

    const { data, error } = await query

    if (error) {
      console.error('[ContratoServicoRepository] Erro ao buscar contratos:', error)
      throw error
    }

    return data || []
  }

  async getUltimoContratoComDados(clienteId: string, servicoId?: string) {
    let query = supabase
      .from('contratos_servicos')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('criado_em', { ascending: false })
      .limit(1)

    if (servicoId) {
      query = query.eq('servico_id', servicoId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error('[ContratoServicoRepository] Erro ao buscar ultimo contrato com dados:', error)
      throw error
    }

    return data || null
  }

  async getContratoById(id: string) {
    const { data, error } = await supabase
      .from('contratos_servicos')
      .select(`
        *,
        cliente:clientes(id, nome, email, whatsapp, status, client_id),
        servico:catalogo_servicos(id, nome, valor, tipo)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('[ContratoServicoRepository] Erro ao buscar contrato:', error)
      throw error
    }

    return data
  }

  async updateContrato(id: string, payload: any) {
    const { data, error } = await supabase
      .from('contratos_servicos')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[ContratoServicoRepository] Erro ao atualizar contrato:', error)
      throw error
    }

    return data
  }
}

export default new ContratoServicoRepository()
