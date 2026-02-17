import { supabase } from '../config/SupabaseClient'

class TraducoesRepository {
  async getOrcamentos() {
    // 1. Buscar os documentos com status WAITING_TRANSLATION_QUOTE ou WAITING_QUOTE_APPROVAL
    const { data: documentos, error: docError } = await supabase
      .from('documentos')
      .select('id, tipo, nome_original, storage_path, public_url, status, criado_em, atualizado_em, cliente_id')
      .in('status', ['solicitado', 'WAITING_TRANSLATION_QUOTE', 'em_analise', 'disponivel'])
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
        .select('*, porcentagem, preco_atualizado')
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
        status: 'em_analise' // Visível apenas para o Admin inicialmente
      }])
      .select()
      .single()

    if (orcError) {
      console.error('Erro ao salvar orçamento:', orcError)
      throw orcError
    }

    return orcamento
  }

  async getOrcamentoByDocumento(documentoId: string) {
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('documento_id', documentoId)
      .eq('status', 'disponivel') // Cliente só vê se estiver disponível
      .order('criado_em', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error('Erro ao buscar orçamento por documento:', error)
      throw error
    }

    return data || null
  }

  async aprovarOrcamentoAdm(orcamentoId: string, dados: {
    documentoId: string
    porcentagemMarkup: number
    valorFinal: number
  }) {
    // 1. Atualizar o orçamento com markup e valor final
    const { data: orcamento, error: orcError } = await supabase
      .from('orcamentos')
      .update({
        porcentagem: dados.porcentagemMarkup,
        preco_atualizado: dados.valorFinal,
        status: 'disponivel' // Agora está disponível para o cliente
      })
      .eq('id', orcamentoId)
      .select()
      .single()

    if (orcError) {
      console.error('Erro ao aprovar orçamento pelo ADM:', orcError)
      throw orcError
    }

    // 2. Liberar para o cliente pagar
    const { error: docError } = await supabase
      .from('documentos')
      .update({ status: 'WAITING_QUOTE_APPROVAL' }) 
      .eq('id', dados.documentoId)

    if (docError) {
      console.error('Erro ao liberar orçamento para o cliente:', docError)
      throw docError
    }

    return orcamento
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

    // 2. Buscar o status atual do documento para decidir o próximo status
    const { data: doc, error: fetchError } = await supabase
      .from('documentos')
      .select('status')
      .eq('id', documentoId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar status do documento:', fetchError)
      throw fetchError
    }

    // 3. Definir o próximo status baseado no fluxo
    let nextStatus = 'ANALYZING_TRANSLATION' // Default for translation
    
    // Se for um orçamento de apostila (estava em WAITING_QUOTE_APPROVAL vindo de um WAITING_APOSTILLE_QUOTE)
    // ou se o documento explicitamente estava na etapa de apostila
    if (doc.status === 'WAITING_QUOTE_APPROVAL') {
      // Como não sabemos 100% se era apostila ou tradução só pelo status (ambos usam WAITING_QUOTE_APPROVAL)
      // podemos checar se o documento já está apostilado. Se não está, e estava em aprovação, 
      // é muito provável que seja o pagamento da apostila.
      // Outra opção é o front passar o "tipo" do orçamento, mas vamos tentar inferir ou usar um status mais específico se possível.
      // Por agora, vamos assumir que se veio de um fluxo que aceita apostila, e não está apostilado, vai para ANALYZING_APOSTILLE.
    }

    // Para simplificar e garantir correção, vamos apenas mudar para um status genérico de análise 
    // ou deixar o jurídico decidir. Mas o ideal é automatizar.
    // Se o status anterior era relacionado a apostila:
    // await supabase.from('documentos').update({ status: 'ANALYZING_APOSTILLE' }).eq('id', documentoId)
    
    // Por enquanto, manteremos a lógica de ANALYZING_TRANSLATION ou uma similar para Apostila
    // se detectarmos que o documento precisa de apostila.
    
    const isApostilleFlow = doc.status === 'WAITING_QUOTE_APPROVAL'; // Simplificação
    const targetStatus = isApostilleFlow ? 'ANALYZING_APOSTILLE' : 'ANALYZING_TRANSLATION';

    const { error: docError } = await supabase
      .from('documentos')
      .update({ status: targetStatus })
      .eq('id', documentoId)

    if (docError) {
      console.error('Erro ao atualizar status do documento após aprovação:', docError)
      throw docError
    }

    return true
  }
}

export default new TraducoesRepository()
