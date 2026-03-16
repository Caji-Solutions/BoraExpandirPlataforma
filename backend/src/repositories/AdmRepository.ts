import { supabase } from '../config/SupabaseClient';

export class AdmRepository {
  async getCatalogServices() {
    const { data: services, error: servicesError } = await supabase
      .from('catalogo_servicos')
      .select(`
        *,
        requisitos:servico_requisitos(*)
      `)
      .order('nome', { ascending: true });

    if (servicesError) {
      console.error('Erro ao buscar catálogo:', servicesError);
      throw servicesError;
    }

    return services;
  }

  async createCatalogService(data: any) {
    const { name, value, duration, showInCommercial, documents, type } = data;
    
    // Inserir serviço
    const { data: service, error: serviceError } = await supabase
      .from('catalogo_servicos')
      .insert([{
        nome: name,
        valor: value,
        duracao: duration,
        tipo: type || data.tipo || 'agendavel',
        exibir_comercial: showInCommercial,
        exibir_cliente: data.showToClient ?? true,
        requer_delegacao_juridico: data.requiresLegalDelegation || false
      }])
      .select()
      .single();

    if (serviceError) {
      console.error('Erro ao criar serviço:', serviceError);
      throw serviceError;
    }

    // Inserir requisitos se houver
    if (documents && documents.length > 0) {
      const { error: reqError } = await supabase
        .from('servico_requisitos')
        .insert(
          documents.map((doc: any) => ({
            servico_id: service.id,
            nome: doc.name,
            etapa: doc.stage,
            obrigatorio: doc.required
          }))
        );

      if (reqError) {
        console.error('Erro ao criar requisitos:', reqError);
        throw reqError;
      }
    }

    // Retornar serviço completo
    return this.getServiceById(service.id);
  }

  async updateCatalogService(id: string, data: any) {
    const { name, value, duration, showInCommercial, documents, type } = data;

    // Atualizar dados básicos
    const updatePayload: any = {
      nome: name,
      valor: value,
      duracao: duration,
      exibir_comercial: showInCommercial,
      exibir_cliente: data.showToClient,
      requer_delegacao_juridico: data.requiresLegalDelegation,
      atualizado_em: new Date().toISOString()
    }

    if (type || data.tipo) {
      updatePayload.tipo = type || data.tipo
    }

    const { error: updateError } = await supabase
      .from('catalogo_servicos')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      console.error('Erro ao atualizar serviço:', updateError);
      throw updateError;
    }

    // Atualizar requisitos (Delete + Insert para simplificar, similar ao padrão de transação)
    if (documents) {
      // Remover antigos
      const { error: deleteError } = await supabase
        .from('servico_requisitos')
        .delete()
        .eq('servico_id', id);

      if (deleteError) {
        console.error('Erro ao remover requisitos antigos:', deleteError);
        throw deleteError;
      }

      // Inserir novos
      if (documents.length > 0) {
        const { error: insertError } = await supabase
          .from('servico_requisitos')
          .insert(
            documents.map((doc: any) => ({
              servico_id: id,
              nome: doc.name,
              etapa: doc.stage,
              obrigatorio: doc.required
            }))
          );

        if (insertError) {
          console.error('Erro ao inserir novos requisitos:', insertError);
          throw insertError;
        }
      }
    }

    return this.getServiceById(id);
  }

  async deleteCatalogService(id: string) {
    const { error } = await supabase
      .from('catalogo_servicos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir serviço:', error);
      throw error;
    }
  }

  public async getServiceById(id: string) {
    const { data, error } = await supabase
      .from('catalogo_servicos')
      .select(`
        *,
        requisitos:servico_requisitos(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}

export default new AdmRepository();
