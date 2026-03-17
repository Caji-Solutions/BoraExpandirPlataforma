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

  async getContratos(filters?: { clienteId?: string }) {
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
