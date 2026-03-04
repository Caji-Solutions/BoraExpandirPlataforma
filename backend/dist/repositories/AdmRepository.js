"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmRepository = void 0;
const SupabaseClient_1 = require("../config/SupabaseClient");
class AdmRepository {
    async getCatalogServices() {
        const { data: services, error: servicesError } = await SupabaseClient_1.supabase
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
    async createCatalogService(data) {
        const { name, value, duration, showInCommercial, documents } = data;
        // Inserir serviço
        const { data: service, error: serviceError } = await SupabaseClient_1.supabase
            .from('catalogo_servicos')
            .insert([{
                nome: name,
                valor: value,
                duracao: duration,
                exibir_comercial: showInCommercial,
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
            const { error: reqError } = await SupabaseClient_1.supabase
                .from('servico_requisitos')
                .insert(documents.map((doc) => ({
                servico_id: service.id,
                nome: doc.name,
                etapa: doc.stage,
                obrigatorio: doc.required
            })));
            if (reqError) {
                console.error('Erro ao criar requisitos:', reqError);
                throw reqError;
            }
        }
        // Retornar serviço completo
        return this.getServiceById(service.id);
    }
    async updateCatalogService(id, data) {
        const { name, value, duration, showInCommercial, documents } = data;
        // Atualizar dados básicos
        const { error: updateError } = await SupabaseClient_1.supabase
            .from('catalogo_servicos')
            .update({
            nome: name,
            valor: value,
            duracao: duration,
            exibir_comercial: showInCommercial,
            requer_delegacao_juridico: data.requiresLegalDelegation,
            updated_at: new Date().toISOString()
        })
            .eq('id', id);
        if (updateError) {
            console.error('Erro ao atualizar serviço:', updateError);
            throw updateError;
        }
        // Atualizar requisitos (Delete + Insert para simplificar, similar ao padrão de transação)
        if (documents) {
            // Remover antigos
            const { error: deleteError } = await SupabaseClient_1.supabase
                .from('servico_requisitos')
                .delete()
                .eq('servico_id', id);
            if (deleteError) {
                console.error('Erro ao remover requisitos antigos:', deleteError);
                throw deleteError;
            }
            // Inserir novos
            if (documents.length > 0) {
                const { error: insertError } = await SupabaseClient_1.supabase
                    .from('servico_requisitos')
                    .insert(documents.map((doc) => ({
                    servico_id: id,
                    nome: doc.name,
                    etapa: doc.stage,
                    obrigatorio: doc.required
                })));
                if (insertError) {
                    console.error('Erro ao inserir novos requisitos:', insertError);
                    throw insertError;
                }
            }
        }
        return this.getServiceById(id);
    }
    async deleteCatalogService(id) {
        const { error } = await SupabaseClient_1.supabase
            .from('catalogo_servicos')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Erro ao excluir serviço:', error);
            throw error;
        }
    }
    async getServiceById(id) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('catalogo_servicos')
            .select(`
        *,
        requisitos:servico_requisitos(*)
      `)
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return data;
    }
}
exports.AdmRepository = AdmRepository;
exports.default = new AdmRepository();
