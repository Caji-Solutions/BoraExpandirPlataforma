import { supabase } from '../config/SupabaseClient';

class ApostilamentoRepository {
  async create(params: {
    documentoId: string;
    documentoUrl: string;
    observacoes?: string;
  }) {
    const { data, error } = await supabase
      .from('apostilamentos')
      .insert([{
        documento_id: params.documentoId,
        documento_url: params.documentoUrl,
        observacoes: params.observacoes,
        status: 'pendente'
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar apostilamento no repositório:', error);
      throw error;
    }

    return data;
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
    const { data, error } = await supabase
      .from('apostilamentos')
      .select(`
        *,
        documentos (*)
      `)
      .order('solicitado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar todos os apostilamentos:', error);
      throw error;
    }

    return data;
  }
}

export default new ApostilamentoRepository();
