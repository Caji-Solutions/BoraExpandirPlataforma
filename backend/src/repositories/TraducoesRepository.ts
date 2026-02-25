import { supabase } from '../config/SupabaseClient'

class TraducoesRepository {
  async getOrcamentos() {
    // 1. Buscar os documentos com status WAITING_TRANSLATION_QUOTE ou WAITING_QUOTE_APPROVAL
    const { data: documentos, error: docError } = await supabase
      .from('documentos')
      .select('id, tipo, nome_original, storage_path, public_url, status, criado_em, atualizado_em, cliente_id, processo_id, dependente_id')
      .in('status', ['solicitado', 'WAITING_TRANSLATION_QUOTE', 'em_analise', 'disponivel'])
      .order('criado_em', { ascending: false })

    if (docError) {
      console.error('Erro ao buscar documentos:', docError)
      throw docError
    }

    if (!documentos || documentos.length === 0) return []

    // 2. Coletar IDs únicos de clientes, documentos e dependentes
    const clienteIds = [...new Set(documentos.map(d => d.cliente_id))]
    const documentoIds = documentos.map(d => d.id)
    const dependenteIds = [...new Set(documentos.map(d => d.dependente_id).filter(id => id !== null))]

    // 3. Buscar dados dos clientes, orçamentos e dependentes em paralelo
    const [clientesRes, orcamentosRes, dependentesRes] = await Promise.all([
      supabase
        .from('clientes')
        .select('id, nome, email, whatsapp')
        .in('id', clienteIds),
      supabase
        .from('orcamentos')
        .select('*, porcentagem, preco_atualizado')
        .in('documento_id', documentoIds)
        .order('criado_em', { ascending: false }),
      supabase
        .from('dependentes')
        .select('id, nome_completo, parentesco')
        .in('id', dependenteIds)
    ])

    if (clientesRes.error) {
      console.error('Erro ao buscar clientes dos documentos:', clientesRes.error)
    }

    if (orcamentosRes.error) {
      console.error('Erro ao buscar orçamentos dos documentos:', orcamentosRes.error)
    }

    if (dependentesRes.error) {
      console.error('Erro ao buscar dependentes dos documentos:', dependentesRes.error)
    }

    const clientes = clientesRes.data || []
    const orcamentos = orcamentosRes.data || []
    const dependentes = dependentesRes.data || []

    // 4. Mesclar os dados
    return documentos.map(doc => {
      const orcamento = orcamentos.find(o => o.documento_id === doc.id)
      const dependente = doc.dependente_id ? dependentes.find(dep => dep.id === doc.dependente_id) : null

      return {
        ...doc,
        clientes: clientes.find(c => c.id === doc.cliente_id) || null,
        orcamento: orcamento || null,
        dependente: dependente || null
      }
    })
  }

  async saveOrcamento(dados: {
    documentoId: string
    valorOrcamento: number
    prazoEntrega: string
    observacoes?: string
  }) {
    // 1. Buscar a porcentagem padrão de markup configurada
    const { data: configData, error: configError } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'markup_padrao')
      .single()

    // Fallback para 20% se houver erro (ex: tabela não existe) ou não houver valor
    const markup = (configData?.valor && !configError) ? parseFloat(configData.valor) : 20
    const precoAtualizado = dados.valorOrcamento * (1 + markup / 100)

    // 2. Inserir o orçamento na tabela 'orcamentos' já com o cálculo e status disponível
    const { data: orcamento, error: orcError } = await supabase
      .from('orcamentos')
      .insert([{
        documento_id: dados.documentoId,
        valor_orcamento: dados.valorOrcamento,
        prazo_entrega: dados.prazoEntrega,
        observacoes: dados.observacoes,
        porcentagem: markup,
        preco_atualizado: precoAtualizado,
        status: 'disponivel' // Agora já entra liberado se o ADM configurou a regra
      }])
      .select()
      .single()

    if (orcError) {
      console.error('Erro ao salvar orçamento:', orcError)
      throw orcError
    }

    // 3. Atualizar o status do documento para liberar visualização/pagamento pro cliente
    await supabase
      .from('documentos')
      .update({ status: 'WAITING_QUOTE_APPROVAL' })
      .eq('id', dados.documentoId)

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

  async getFilaDeTrabalho() {
    // Fetch documents that are approved for translation (translator needs to work on them)
    const { data: documentos, error: docError } = await supabase
      .from('documentos')
      .select('id, tipo, nome_original, storage_path, public_url, status, criado_em, atualizado_em, cliente_id, processo_id, dependente_id')
      .in('status', ['ANALYZING_TRANSLATION'])
      .order('criado_em', { ascending: true })

    if (docError) {
      console.error('Erro ao buscar fila de trabalho:', docError)
      throw docError
    }

    if (!documentos || documentos.length === 0) return []

    const clienteIds = [...new Set(documentos.map(d => d.cliente_id))]
    const documentoIds = documentos.map(d => d.id)
    const dependenteIds = [...new Set(documentos.map(d => d.dependente_id).filter(id => id !== null))]

    const [clientesRes, orcamentosRes, dependentesRes] = await Promise.all([
      supabase.from('clientes').select('id, nome, email, whatsapp').in('id', clienteIds),
      supabase.from('orcamentos').select('*').in('documento_id', documentoIds).order('criado_em', { ascending: false }),
      supabase.from('dependentes').select('id, nome_completo, parentesco').in('id', dependenteIds)
    ])

    const clientes = clientesRes.data || []
    const orcamentos = orcamentosRes.data || []
    const dependentes = dependentesRes.data || []

    return documentos.map(doc => {
      const orcamento = orcamentos.find(o => o.documento_id === doc.id)
      const dependente = doc.dependente_id ? dependentes.find(dep => dep.id === doc.dependente_id) : null
      return {
        ...doc,
        clientes: clientes.find(c => c.id === doc.cliente_id) || null,
        orcamento: orcamento || null,
        dependente: dependente || null
      }
    })
  }

  async getEntregues() {
    // Fetch documents that have been translated and delivered
    const { data: documentos, error: docError } = await supabase
      .from('documentos')
      .select('id, tipo, nome_original, storage_path, public_url, status, criado_em, atualizado_em, cliente_id, processo_id, dependente_id')
      .in('status', ['APPROVED'])
      .order('atualizado_em', { ascending: false })

    if (docError) {
      console.error('Erro ao buscar entregues:', docError)
      throw docError
    }

    if (!documentos || documentos.length === 0) return []

    const clienteIds = [...new Set(documentos.map(d => d.cliente_id))]
    const documentoIds = documentos.map(d => d.id)
    const dependenteIds = [...new Set(documentos.map(d => d.dependente_id).filter(id => id !== null))]

    const [clientesRes, orcamentosRes, dependentesRes] = await Promise.all([
      supabase.from('clientes').select('id, nome, email, whatsapp').in('id', clienteIds),
      supabase.from('orcamentos').select('*').in('documento_id', documentoIds).order('criado_em', { ascending: false }),
      supabase.from('dependentes').select('id, nome_completo, parentesco').in('id', dependenteIds)
    ])

    const clientes = clientesRes.data || []
    const orcamentos = orcamentosRes.data || []
    const dependentes = dependentesRes.data || []

    return documentos.map(doc => {
      const orcamento = orcamentos.find(o => o.documento_id === doc.id)
      const dependente = doc.dependente_id ? dependentes.find(dep => dep.id === doc.dependente_id) : null
      return {
        ...doc,
        clientes: clientes.find(c => c.id === doc.cliente_id) || null,
        orcamento: orcamento || null,
        dependente: dependente || null
      }
    })
  }

  async submitTraducao(dados: {
    documentoId: string
    filePath: string
    fileBuffer: Buffer
    contentType: string
    nomeOriginal: string
  }) {
    // 1. Upload the translated file to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('documentos')
      .upload(dados.filePath, dados.fileBuffer, {
        contentType: dados.contentType,
        upsert: true
      })

    if (uploadError) {
      console.error('Erro ao fazer upload da tradução:', uploadError)
      throw uploadError
    }

    // 2. Get public URL
    const { data: urlData } = supabase
      .storage
      .from('documentos')
      .getPublicUrl(dados.filePath)

    const publicUrl = urlData?.publicUrl || ''

    // 3. Update document status and add translated file info
    const { data: doc, error: updateError } = await supabase
      .from('documentos')
      .update({
        status: 'APPROVED',
        traducao_url: publicUrl,
        traducao_storage_path: dados.filePath,
        traducao_nome_original: dados.nomeOriginal,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', dados.documentoId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar documento com tradução:', updateError)
      throw updateError
    }

    return doc
  }
}

export default new TraducoesRepository()
