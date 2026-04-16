import { supabase } from '../config/SupabaseClient';

export class AdmRepository {
  private derivarTipo(data: { contratoTemplateId?: string | null; isAgendavel?: boolean }): 'fixo' | 'agendavel' | 'diverso' {
    if (data.contratoTemplateId) return 'fixo';
    if (data.isAgendavel) return 'agendavel';
    return 'diverso';
  }

  async getCatalogServices() {
    const { data: services, error: servicesError } = await supabase
      .from('catalogo_servicos')
      .select(`
        *,
        requisitos:servico_requisitos(*),
        subservicos:subservicos(*, requisitos:servico_requisitos(*))
      `)
      .order('nome', { ascending: true });

    if (servicesError) {
      console.error('Erro ao buscar catalogo:', servicesError);
      throw servicesError;
    }

    return services;
  }

  async createCatalogService(data: any) {
    const {
      name, value, duration, showInCommercial, showToClient,
      documents, subservices,
      isAgendavel, tipoPreco, contratoTemplateId, possuiSubservicos,
      naoAgendavel
    } = data;

    const tipoDerivado = this.derivarTipo({ contratoTemplateId, isAgendavel });
    const valorFinal = tipoPreco === 'fixo' ? (value || null) : null;

    // Inserir servico
    const { data: service, error: serviceError } = await supabase
      .from('catalogo_servicos')
      .insert([{
        nome: name,
        valor: valorFinal,
        duracao: duration,
        tipo: tipoDerivado,
        exibir_comercial: showInCommercial ?? true,
        exibir_cliente: showToClient ?? true,
        contrato_template_id: contratoTemplateId ?? null,
        possui_subservicos: possuiSubservicos ?? false,
        tipo_preco: tipoPreco ?? 'por_contrato',
        is_agendavel: isAgendavel ?? false,
        nao_agendavel: naoAgendavel ?? false,
      }])
      .select()
      .single();

    if (serviceError) {
      console.error('Erro ao criar servico:', serviceError);
      throw serviceError;
    }

    // Inserir requisitos do servico (para compatibilidade)
    if (documents && documents.length > 0) {
      const { error: reqError } = await supabase
        .from('servico_requisitos')
        .insert(
          documents.map((doc: any) => ({
            servico_id: service.id,
            nome: doc.name,
            etapa: doc.stage,
            obrigatorio: doc.required,
            tipo_documento: doc.tipoDocumento ?? 'titular',
          }))
        );

      if (reqError) {
        console.error('Erro ao criar requisitos:', reqError);
        throw reqError;
      }
    }

    // Inserir subservicos se houver (apenas para tipo fixo)
    if (subservices && subservices.length > 0) {
      for (const sub of subservices) {
        const { data: createdSub, error: subError } = await supabase
          .from('subservicos')
          .insert([{
            servico_id: service.id,
            nome: sub.name || sub.nome
          }])
          .select()
          .single();

        if (subError) {
          console.error('Erro ao criar subservico:', subError);
          throw subError;
        }

        // Inserir documentos do subservico, se houver
        if (sub.documents && sub.documents.length > 0) {
          const { error: docError } = await supabase
            .from('servico_requisitos')
            .insert(
              sub.documents.map((doc: any) => ({
                servico_id: service.id,
                subservico_id: createdSub.id,
                nome: doc.name,
                etapa: doc.stage,
                obrigatorio: doc.required,
                tipo_documento: doc.tipoDocumento ?? 'titular',
              }))
            );

          if (docError) {
            console.error('Erro ao criar requisitos do subservico:', docError);
            throw docError;
          }
        }
      }
    }

    // Retornar servico completo
    return this.getServiceById(service.id);
  }

  async updateCatalogService(id: string, data: any) {
    const {
      name, value, duration, showInCommercial, documents, subservices,
      isAgendavel, tipoPreco, contratoTemplateId, possuiSubservicos,
      naoAgendavel
    } = data;

    const tipoDerivado = this.derivarTipo({ contratoTemplateId, isAgendavel });
    const valorFinal = tipoPreco === 'fixo' ? (value || null) : null;

    // Atualizar dados basicos
    const updatePayload: any = {
      nome: name,
      valor: valorFinal,
      duracao: duration,
      tipo: tipoDerivado,  // ALWAYS derived, never from data.tipo
      exibir_comercial: showInCommercial,
      exibir_cliente: data.showToClient,
      contrato_template_id: contratoTemplateId ?? null,
      possui_subservicos: possuiSubservicos ?? false,
      tipo_preco: tipoPreco ?? 'por_contrato',
      is_agendavel: isAgendavel ?? false,
      nao_agendavel: naoAgendavel ?? false,
      atualizado_em: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('catalogo_servicos')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      console.error('Erro ao atualizar servico:', updateError);
      throw updateError;
    }

    // Atualizar requisitos de nivel servico (Delete + Insert)
    if (documents) {
      // Remover requisitos antigos que NAO estejam vinculados a subservicos
      const { error: deleteError } = await supabase
        .from('servico_requisitos')
        .delete()
        .eq('servico_id', id)
        .is('subservico_id', null);

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
              obrigatorio: doc.required,
              tipo_documento: doc.tipoDocumento ?? 'titular',
            }))
          );

        if (insertError) {
          console.error('Erro ao inserir novos requisitos:', insertError);
          throw insertError;
        }
      }
    }

    // Atualizar subservicos (Delete + Insert com documentos)
    if (subservices !== undefined) {
      // Remover requisitos vinculados a subservicos deste servico
      const { error: deleteSubReqError } = await supabase
        .from('servico_requisitos')
        .delete()
        .eq('servico_id', id)
        .not('subservico_id', 'is', null);

      if (deleteSubReqError) {
        console.error('Erro ao remover requisitos de subservicos:', deleteSubReqError);
        throw deleteSubReqError;
      }

      // Remover subservicos antigos
      const { error: deleteSubError } = await supabase
        .from('subservicos')
        .delete()
        .eq('servico_id', id);

      if (deleteSubError) {
        console.error('Erro ao remover subservicos antigos:', deleteSubError);
        throw deleteSubError;
      }

      // Inserir novos subservicos com seus documentos
      if (subservices && subservices.length > 0) {
        for (const sub of subservices) {
          const { data: createdSub, error: insertSubError } = await supabase
            .from('subservicos')
            .insert([{
              servico_id: id,
              nome: sub.name || sub.nome
            }])
            .select()
            .single();

          if (insertSubError) {
            console.error('Erro ao inserir novo subservico:', insertSubError);
            throw insertSubError;
          }

          // Inserir documentos do subservico
          if (sub.documents && sub.documents.length > 0) {
            const { error: docError } = await supabase
              .from('servico_requisitos')
              .insert(
                sub.documents.map((doc: any) => ({
                  servico_id: id,
                  subservico_id: createdSub.id,
                  nome: doc.name,
                  etapa: doc.stage,
                  obrigatorio: doc.required,
                  tipo_documento: doc.tipoDocumento ?? 'titular',
                }))
              );

            if (docError) {
              console.error('Erro ao inserir requisitos do subservico:', docError);
              throw docError;
            }
          }
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
      console.error('Erro ao excluir servico:', error);
      throw error;
    }
  }

  public async getServiceById(id: string) {
    const { data, error } = await supabase
      .from('catalogo_servicos')
      .select(`
        *,
        requisitos:servico_requisitos(*),
        subservicos:subservicos(*, requisitos:servico_requisitos(*))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // ======= Subservicos standalone CRUD =======

  async getAllSubservices() {
    const { data, error } = await supabase
      .from('subservicos')
      .select('*, servico:catalogo_servicos(id, nome, possui_subservicos), requisitos:servico_requisitos(*)')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar subservicos:', error);
      throw error;
    }

    return data;
  }

  async createSubservice(payload: any) {
    const { name, servicoId, documents } = payload;

    const { data: sub, error: subError } = await supabase
      .from('subservicos')
      .insert([{
        nome: name,
        servico_id: servicoId || null
      }])
      .select()
      .single();

    if (subError) {
      console.error('Erro ao criar subservico:', subError);
      throw subError;
    }

    // Inserir documentos do subservico
    if (documents && documents.length > 0) {
      const { error: docError } = await supabase
        .from('servico_requisitos')
        .insert(
          documents.map((doc: any) => ({
            servico_id: servicoId || null,
            subservico_id: sub.id,
            nome: doc.name,
            etapa: doc.stage,
            obrigatorio: doc.required
          }))
        );

      if (docError) {
        console.error('Erro ao criar requisitos do subservico:', docError);
        throw docError;
      }
    }

    return this.getSubserviceById(sub.id);
  }

  async updateSubservice(id: string, payload: any) {
    const { name, servicoId, documents } = payload;

    const updatePayload: any = {
      nome: name,
    };

    if (servicoId !== undefined) {
      updatePayload.servico_id = servicoId || null;
    }

    const { error: updateError } = await supabase
      .from('subservicos')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      console.error('Erro ao atualizar subservico:', updateError);
      throw updateError;
    }

    // Atualizar documentos (Delete + Insert)
    if (documents !== undefined) {
      const { error: delError } = await supabase
        .from('servico_requisitos')
        .delete()
        .eq('subservico_id', id);

      if (delError) {
        console.error('Erro ao remover requisitos do subservico:', delError);
        throw delError;
      }

      if (documents.length > 0) {
        // Buscar o servico_id do subservico para manter a FK
        const { data: subData } = await supabase
          .from('subservicos')
          .select('servico_id')
          .eq('id', id)
          .single();

        const { error: insertError } = await supabase
          .from('servico_requisitos')
          .insert(
            documents.map((doc: any) => ({
              servico_id: subData?.servico_id || servicoId || null,
              subservico_id: id,
              nome: doc.name,
              etapa: doc.stage,
              obrigatorio: doc.required
            }))
          );

        if (insertError) {
          console.error('Erro ao inserir novos requisitos do subservico:', insertError);
          throw insertError;
        }
      }
    }

    return this.getSubserviceById(id);
  }

  async deleteSubservice(id: string) {
    // Remover requisitos vinculados primeiro
    await supabase
      .from('servico_requisitos')
      .delete()
      .eq('subservico_id', id);

    const { error } = await supabase
      .from('subservicos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir subservico:', error);
      throw error;
    }
  }

  async getSubserviceById(id: string) {
    const { data, error } = await supabase
      .from('subservicos')
      .select('*, servico:catalogo_servicos(id, nome), requisitos:servico_requisitos(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getTranslators() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'tradutor')
      .or('registration_complete.is.null,registration_complete.eq.true')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tradutores:', error);
      throw error;
    }

    return data;
  }
}

export default new AdmRepository();
