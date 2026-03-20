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

  /**
   * Busca um contrato pelo ID do documento da Autentique.
   */
  async findByAutentiqueDocumentId(autentiqueDocumentId: string) {
    const { data, error } = await supabase
      .from('contratos_servicos')
      .select('*')
      .eq('autentique_document_id', autentiqueDocumentId)
      .maybeSingle()

    if (error) {
      console.error('[ContratoServicoRepository] Erro ao buscar contrato por autentique_document_id:', error)
      throw error
    }

    return data || null
  }

  /**
   * Atualiza o status de assinatura e, opcionalmente, a URL do PDF assinado.
   */
  async updateAssinaturaStatus(id: string, status: string, signedUrl?: string | null) {
    const payload: any = {
      assinatura_status: status,
      atualizado_em: new Date().toISOString()
    }

    if (status === 'aprovado') {
      payload.assinatura_aprovado_em = new Date().toISOString()
    }

    if (signedUrl) {
      payload.contrato_assinado_url = signedUrl
    }

    const { data, error } = await supabase
      .from('contratos_servicos')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[ContratoServicoRepository] Erro ao atualizar status de assinatura:', error)
      throw error
    }

    return data
  }
}

export default new ContratoServicoRepository()
