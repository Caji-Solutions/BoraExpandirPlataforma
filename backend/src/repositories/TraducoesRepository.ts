import { supabase } from '../config/SupabaseClient'

class TraducoesRepository {
  async getOrcamentos() {
    // 1. Buscar os documentos com status WAITING_TRANSLATION_QUOTE ou WAITING_QUOTE_APPROVAL
    const { data: documentos, error: docError } = await supabase
      .from('documentos')
      .select('id, tipo, nome_original, storage_path, public_url, status, criado_em, atualizado_em, cliente_id')
      .in('status', ['WAITING_TRANSLATION_QUOTE', 'WAITING_QUOTE_APPROVAL', 'ANALYZING_TRANSLATION'])
      .order('criado_em', { ascending: false })

    if (docError) {
      console.error('Erro ao buscar documentos:', docError)
      throw docError
    }

    if (!documentos || documentos.length === 0) return []

    // 2. Coletar IDs únicos de clientes e documentos
    const clienteIds = [...new Set(documentos.map(d => d.cliente_id))]
    const documentoIds = documentos.map(d => d.id)

    // 3. Buscar dados dos clientes e orçamentos em paralelo
    const [clientesRes, orcamentosRes] = await Promise.all([
      supabase
        .from('clientes')
        .select('id, nome, email, whatsapp')
        .in('id', clienteIds),
      supabase
        .from('orcamentos')
        .select('*')
        .in('documento_id', documentoIds)
        .order('criado_em', { ascending: false })
    ])

    if (clientesRes.error) {
      console.error('Erro ao buscar clientes dos documentos:', clientesRes.error)
    }
    
    if (orcamentosRes.error) {
      console.error('Erro ao buscar orçamentos dos documentos:', orcamentosRes.error)
    }

    const clientes = clientesRes.data || []
    const orcamentos = orcamentosRes.data || []

    // 4. Mesclar os dados
    return documentos.map(doc => {
      const orcamento = orcamentos.find(o => o.documento_id === doc.id)
      return {
        ...doc,
        clientes: clientes.find(c => c.id === doc.cliente_id) || null,
        orcamento: orcamento || null
      }
    })
  }

  async saveOrcamento(dados: {
    documentoId: string
    valorOrcamento: number
    prazoEntrega: string
    observacoes?: string
  }) {
    // 1. Inserir o orçamento na tabela 'orcamentos'
    const { data: orcamento, error: orcError } = await supabase
      .from('orcamentos')
      .insert([{
        documento_id: dados.documentoId,
        valor_orcamento: dados.valorOrcamento,
        prazo_entrega: dados.prazoEntrega,
        observacoes: dados.observacoes,
        status: 'respondido'
      }])
      .select()
      .single()

    if (orcError) {
      console.error('Erro ao salvar orçamento:', orcError)
      throw orcError
    }

    // 2. Atualizar o status do documento para WAITING_QUOTE_APPROVAL
    // Opcional: dependendo da regra de negócio, podemos manter como WAITING_TRANSLATION_QUOTE
    // mas geralmente quando o tradutor responde, ele sai da fila de "pendentes"
    const { error: docError } = await supabase
      .from('documentos')
      .update({ status: 'WAITING_QUOTE_APPROVAL' })
      .eq('id', dados.documentoId)

    if (docError) {
      console.error('Erro ao atualizar status do documento:', docError)
      // Note: we might want to rollback the budget insert if this fails, 
      // but Supabase doesn't easily support cross-table transactions via JS client without RPC.
      throw docError
    }

    return orcamento
  }

  async getOrcamentoByDocumento(documentoId: string) {
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('documento_id', documentoId)
      .eq('status', 'respondido') // We only want the active/recent quote
      .order('criado_em', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error('Erro ao buscar orçamento por documento:', error)
      throw error
    }

    return data || null
  }

  async aprovarOrcamento(orcamentoId: string, documentoId: string) {
    // 1. Atualizar o status do orçamento para 'aprovado'
    const { error: orcError } = await supabase
      .from('orcamentos')
      .update({ status: 'aprovado' })
      .eq('id', orcamentoId)

    if (orcError) {
      console.error('Erro ao aprovar orçamento:', orcError)
      throw orcError
    }

    // 2. Atualizar o status do documento para 'ANALYZING_TRANSLATION'
    // Isso indica que o pagamento foi "confirmado" (simulado) e a tradução está em andamento/análise
    const { error: docError } = await supabase
      .from('documentos')
      .update({ status: 'ANALYZING_TRANSLATION' })
      .eq('id', documentoId)

    if (docError) {
      console.error('Erro ao atualizar status do documento após aprovação:', docError)
      throw docError
    }

    return true
  }
}

export default new TraducoesRepository()
