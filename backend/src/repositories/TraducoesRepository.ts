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

  async aprovarOrcamento(orcamentoIds: string | string[]) {
    const ids = Array.isArray(orcamentoIds) ? orcamentoIds : [orcamentoIds]
    
    // 1. Atualizar o status de todos os orçamentos para 'aprovado'
    const { data: orcamentos, error: orcError } = await supabase
      .from('orcamentos')
      .update({ status: 'aprovado' })
      .in('id', ids)
      .select('documento_id, observacoes')

    if (orcError) {
      console.error('Erro ao aprovar orçamentos:', orcError)
      throw orcError
    }

    if (!orcamentos || orcamentos.length === 0) return true;

    // 2. Buscar documentos para decidir o próximo status
    const documentoIds = orcamentos.map(o => o.documento_id)
    const { data: docs, error: fetchError } = await supabase
      .from('documentos')
      .select('id, status')
      .in('id', documentoIds)

    if (fetchError) {
      console.error('Erro ao buscar status dos documentos:', fetchError)
      throw fetchError
    }

    // 3. Atualizar status de cada documento baseado no fluxo
    for (const doc of docs) {
      const orcamento = orcamentos.find(o => o.documento_id === doc.id)
      const isApostille = doc.status === 'ANALYZING_APOSTILLE_PAYMENT' || orcamento?.observacoes?.includes('Apostilamento')
      
      const targetStatus = isApostille ? 'EXECUTING_APOSTILLE' : 'EXECUTING_TRANSLATION'

      console.log(`[TraducoesRepository.aprovarOrcamento] Atualizando status do doc ${doc.id} para ${targetStatus}`);

      await supabase
        .from('documentos')
        .update({ status: targetStatus })
        .eq('id', doc.id)

      if (isApostille) {
        console.log(`[TraducoesRepository.aprovarOrcamento] Atualizando status do apostilamento para pronto_para_apostilagem`);
        await supabase
          .from('apostilamentos')
          .update({ status: 'pronto_para_apostilagem' })
          .eq('documento_id', doc.id)
      }
    }

    return true
  }

  async getFilaDeTrabalho() {
    // Fetch documents that are approved for translation (translator needs to work on them)
    const { data: documentos, error: docError } = await supabase
      .from('documentos')
      .select('id, tipo, nome_original, storage_path, public_url, status, criado_em, atualizado_em, cliente_id, processo_id, dependente_id, traducao_url, traducao_storage_path, traducao_nome_original')
      .in('status', ['EXECUTING_TRANSLATION'])
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
      .select('id, tipo, nome_original, storage_path, public_url, status, criado_em, atualizado_em, cliente_id, processo_id, dependente_id, traducao_url, traducao_storage_path, traducao_nome_original')
      .in('status', ['APPROVED', 'ANALYZING_TRANSLATION'])
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
        status: 'ANALYZING_TRANSLATION',
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

  async submitComprovante(dados: {
    orcamentoId: string
    filePath: string
    fileBuffer: Buffer
    contentType: string
    nomeOriginal: string
  }) {
    // 1. Upload comprovante to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('documentos')
      .upload(dados.filePath, dados.fileBuffer, {
        contentType: dados.contentType,
        upsert: true
      })

    if (uploadError) {
      console.error('Erro ao fazer upload do comprovante:', uploadError)
      throw uploadError
    }

    // 2. Get public URL
    const { data: urlData } = supabase
      .storage
      .from('documentos')
      .getPublicUrl(dados.filePath)

    const publicUrl = urlData?.publicUrl || ''

    // 3. Update orcamento with comprovante_url and change status to 'pendente_verificacao'
    const { data: orcamento, error: updateError } = await supabase
      .from('orcamentos')
      .update({
        status: 'pendente_verificacao',
        comprovante_url: publicUrl,
        comprovante_storage_path: dados.filePath,
        comprovante_nome_original: dados.nomeOriginal,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', dados.orcamentoId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar orçamento com comprovante:', updateError)
      throw updateError
    }

    // 4. Update document status to indicate it's waiting for payment verification
    await supabase
      .from('documentos')
      .update({ status: 'ANALYZING_TRANSLATION_PAYMENT' })
      .eq('id', orcamento.documento_id)

    return orcamento
  }
}

export default new TraducoesRepository()
