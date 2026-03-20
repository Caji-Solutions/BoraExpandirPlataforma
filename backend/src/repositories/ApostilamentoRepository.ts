import { supabase } from '../config/SupabaseClient';
import { DocumentStatus } from '../constants/DocumentStatus';

class ApostilamentoRepository {
  async create(params: {
    documentoId: string;
    documentoUrl: string;
    observacoes?: string;
  }) {
    console.log(`[ApostilamentoRepository.create] Iniciando para documento: ${params.documentoId}`);
    
    // 0. Verificar se já existe um apostilamento e orçamento ativo para este documento
    const { data: existingAp } = await supabase
      .from('apostilamentos')
      .select('*')
      .eq('documento_id', params.documentoId)
      .maybeSingle();

    if (existingAp) {
      console.log(`[ApostilamentoRepository.create] Apostilamento já existe para doc: ${params.documentoId}. Verificando orçamento...`);
      const { data: existingOrc } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('documento_id', params.documentoId)
        .eq('status', 'disponivel')
        .maybeSingle();
      
      if (existingOrc) {
        console.log(`[ApostilamentoRepository.create] Retornando orçamento existente: ${existingOrc.id}`);
        return {
          ...existingAp,
          orcamentoId: existingOrc.id,
          valorTotal: existingOrc.preco_atualizado
        };
      }
    }

    console.log(`[ApostilamentoRepository.create] Criando novo registro para doc: ${params.documentoId}`);

    // 1. Criar o registro de apostilamento
    const { data: apostilamento, error: apError } = await supabase
      .from('apostilamentos')
      .insert([{
        documento_id: params.documentoId,
        documento_url: params.documentoUrl,
        observacoes: params.observacoes,
        status: 'aguardando_pagamento'
      }])
      .select()
      .single();

    if (apError) {
      console.error('Erro ao criar apostilamento no repositório:', apError);
      throw apError;
    }

    // 2. Criar um orçamento automático com valor fixo para a apostila
    // Buscamos o valor da apostila nas configurações ou usamos 180 como padrão
    const { data: configData } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'valor_apostila')
      .single();
    
    const valorApostila = configData?.valor ? parseFloat(configData.valor) : 180;

    const { data: orcamento, error: orcError } = await supabase
      .from('orcamentos')
      .insert([{
        documento_id: params.documentoId,
        valor_orcamento: valorApostila,
        preco_atualizado: valorApostila,
        prazo_entrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias de prazo padrão?
        observacoes: 'Apostilamento (Valor Fixo)',
        status: 'disponivel' // Fica disponível para o cliente pagar imediatamente
      }])
      .select()
      .single();

    if (orcError) {
      console.error('Erro ao criar orçamento para apostilamento:', orcError);
      throw orcError;
    }

    // 3. Atualizar status do documento para liberar pagamento
    await supabase
      .from('documentos')
      .update({ status: DocumentStatus.WAITING_QUOTE_APPROVAL })
      .eq('id', params.documentoId);

    return {
      ...apostilamento,
      orcamentoId: orcamento.id,
      valorTotal: valorApostila
    };
  }

  async submitComprovante(dados: {
    orcamentoIds: string[]
    filePath: string
    fileBuffer: Buffer
    contentType: string
    nomeOriginal: string
  }) {
    console.log(`[ApostilamentoRepository.submitComprovante] Iniciando para orçamentos: ${dados.orcamentoIds.join(', ')}`);
    console.log(`[ApostilamentoRepository.submitComprovante] Path: ${dados.filePath}`);
    
    // 1. Upload comprovante to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('documentos')
      .upload(dados.filePath, dados.fileBuffer, {
        contentType: dados.contentType,
        upsert: true
      })

    if (uploadError) {
      console.error('Erro ao fazer upload do comprovante de apostila:', uploadError)
      throw uploadError
    }

    // 2. Get public URL
    const { data: urlData } = supabase
      .storage
      .from('documentos')
      .getPublicUrl(dados.filePath)

    const publicUrl = urlData?.publicUrl || ''
    console.log(`[ApostilamentoRepository.submitComprovante] URL pública gerada: ${publicUrl}`);

    // 3. Update all orcamentos with comprovante_url and change status to 'pendente_verificacao'
    const { data: orcamentos, error: updateError } = await supabase
      .from('orcamentos')
      .update({
        status: 'pendente_verificacao',
        comprovante_url: publicUrl,
        comprovante_storage_path: dados.filePath,
        comprovante_nome_original: dados.nomeOriginal,
        atualizado_em: new Date().toISOString()
      })
      .in('id', dados.orcamentoIds)
      .select()

    if (updateError) {
      console.error('Erro ao atualizar orçamentos (apostila) com comprovante:', updateError)
      throw updateError
    }

    // 4. Update all related document statuses
    const documentoIds = orcamentos.map(o => o.documento_id)
    await supabase
      .from('documentos')
      .update({ status: DocumentStatus.ANALYZING_APOSTILLE_PAYMENT })
      .in('id', documentoIds)

    return orcamentos
  }

  async updateStatus(id: string, params: {
    status: string;
    documentoApostiladoUrl?: string;
    observacoes?: string;
  }) {
    const updateData: any = {
      status: params.status,
      atualizado_em: new Date().toISOString()
    };

    if (params.documentoApostiladoUrl) {
      updateData.documento_apostilado_url = params.documentoApostiladoUrl;
    }

    if (params.observacoes) {
      updateData.observacoes = params.observacoes;
    }

    if (params.status === 'concluido') {
      updateData.concluido_em = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('apostilamentos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar apostilamento:', error);
      throw error;
    }

    // Se concluiu o apostilamento, move o documento para análise jurídica da apostila
    if (params.status === 'concluido' && data.documento_id) {
      await supabase
        .from('documentos')
        .update({ status: DocumentStatus.ANALYZING_APOSTILLE })
        .eq('id', data.documento_id);
    }

    return data;
  }

  async findByDocumentoId(documentoId: string) {
    const { data, error } = await supabase
      .from('apostilamentos')
      .select('*')
      .eq('documento_id', documentoId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar apostilamento por documento_id:', error);
      throw error;
    }

    return data;
  }

  async findAll() {
    // 1. Buscar apostilamentos com documentos básicos
    const { data: apostilamentos, error: apError } = await supabase
      .from('apostilamentos')
      .select(`
        *,
        documentos (*)
      `)
      .order('solicitado_em', { ascending: false });

    if (apError) {
      console.error('Erro ao buscar todos os apostilamentos:', apError);
      throw apError;
    }

    if (!apostilamentos || apostilamentos.length === 0) return [];

    // 2. Coletar IDs únicos de clientes e dependentes
    const clienteIds = [...new Set(apostilamentos.map(a => a.documentos?.cliente_id).filter(id => !!id))];
    const dependenteIds = [...new Set(apostilamentos.map(a => a.documentos?.dependente_id).filter(id => !!id))];

    // 3. Buscar dados relacionados em paralelo
    const [clientesRes, dependentesRes] = await Promise.all([
      clienteIds.length > 0 
        ? supabase.from('clientes').select('id, nome').in('id', clienteIds)
        : Promise.resolve({ data: [], error: null }),
      dependenteIds.length > 0 
        ? supabase.from('dependentes').select('id, nome_completo').in('id', dependenteIds)
        : Promise.resolve({ data: [], error: null })
    ]);

    const clientes = clientesRes.data || [];
    const dependentes = dependentesRes.data || [];

    // 4. Mesclar os dados
    return apostilamentos.map(ap => {
      const doc = ap.documentos;
      if (doc) {
        // PostgREST/Supabase convention: joined table name as property
        doc.clientes = clientes.find(c => c.id === doc.cliente_id) || null;
        doc.dependentes = doc.dependente_id ? dependentes.find(d => d.id === doc.dependente_id) : null;
      }
      return ap;
    });
  }
}

export default new ApostilamentoRepository();
