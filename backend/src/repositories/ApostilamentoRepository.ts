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
