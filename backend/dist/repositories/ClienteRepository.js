"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NotificationService_1 = __importDefault(require("../services/NotificationService"));
const SupabaseClient_1 = require("../config/SupabaseClient");
class ClienteRepository {
    async getClienteByWppNumber(wppNumber) {
        const { data: cliente, error } = await SupabaseClient_1.supabase
            .from('clientes')
            .select('*')
            .eq('whatsapp', wppNumber)
            .maybeSingle();
        if (error) {
            throw error;
        }
        return cliente;
    }
    async getClienteById(id) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) {
            console.error('Erro ao buscar cliente por ID:', error);
            throw error;
        }
        return data;
    }
    async getClientByParceiroId(parceiroId) {
        // Ajuste o nome da coluna conforme seu schema (ex.: parceiro_id)
        const { data, error } = await SupabaseClient_1.supabase
            .from('clientes')
            .select('*')
            .eq('parceiro_id', parceiroId)
            .order('criado_em', { ascending: false });
        if (error) {
            throw error;
        }
        return data;
    }
    // Buscar processos de um cliente
    async getProcessosByClienteId(clienteId) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('processos')
            .select('id, tipo_servico, status, etapa_atual, criado_em, atualizado_em, servico_id')
            .eq('cliente_id', clienteId)
            .order('criado_em', { ascending: false });
        if (error) {
            console.error('Erro ao buscar processos do cliente:', error);
            throw error;
        }
        return data || [];
    }
    // Buscar dependentes de um cliente
    async getDependentesByClienteId(clienteId) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('dependentes')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('nome_completo', { ascending: true });
        if (error) {
            console.error('Erro ao buscar dependentes do cliente:', error);
            throw error;
        }
        return data || [];
    }
    // Criar dependente para um cliente
    async createDependent(params) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('dependentes')
            .insert([{
                cliente_id: params.clienteId,
                nome_completo: params.nomeCompleto,
                parentesco: params.parentesco,
                cpf: params.documento,
                data_nascimento: params.dataNascimento,
                rg: params.rg,
                passaporte: params.passaporte,
                nacionalidade: params.nacionalidade,
                email: params.email,
                telefone: params.telefone,
                is_ancestral_direto: params.isAncestralDireto || false,
                status: 'ativo',
                criado_em: new Date().toISOString()
            }])
            .select()
            .single();
        if (error) {
            console.error('Erro ao criar dependente:', error);
            throw error;
        }
        return data;
    }
    async register(cliente) {
        const { data: createdData, error } = await SupabaseClient_1.supabase
            .from('clientes')
            .insert([cliente])
            .select()
            .single();
        if (error) {
            throw error;
        }
        return createdData;
    }
    async attStatusById(id, status) {
        const { data: updatedData, error } = await SupabaseClient_1.supabase
            .from('clientes')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            throw error;
        }
        return updatedData;
    }
    async uploadDocument({ filePath, fileBuffer, contentType, bucket = 'documentos' }) {
        // Upload para o Supabase Storage
        const { data, error } = await SupabaseClient_1.supabase.storage
            .from(bucket)
            .upload(filePath, fileBuffer, {
            contentType,
            upsert: true
        });
        if (error) {
            console.error(`Erro ao fazer upload para Supabase bucket ${bucket}:`, error);
            throw error;
        }
        // Obter URL pública do arquivo
        const { data: urlData } = SupabaseClient_1.supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
        return {
            path: data.path,
            fullPath: data.fullPath,
            publicUrl: urlData.publicUrl
        };
    }
    // Criar registro de documento no banco de dados
    async createDocumento(params) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('documentos')
            .insert([{
                cliente_id: params.clienteId,
                processo_id: params.processoId || null, // Associa ao processo
                tipo: params.tipo,
                nome_original: params.nomeOriginal,
                nome_arquivo: params.nomeArquivo,
                storage_path: params.storagePath,
                public_url: params.publicUrl || null,
                content_type: params.contentType || null,
                tamanho: params.tamanho || null,
                status: params.status || 'PENDING',
                dependente_id: params.dependenteId || null,
                solicitado_pelo_juridico: params.solicitado_pelo_juridico || false,
                atualizado_em: new Date().toISOString()
            }])
            .select()
            .single();
        if (error) {
            console.error('Erro ao criar registro de documento:', error);
            throw error;
        }
        return data;
    }
    // Buscar documentos de um cliente
    async getDocumentosByClienteId(clienteId) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('documentos')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('criado_em', { ascending: false });
        if (error) {
            console.error('Erro ao buscar documentos:', error);
            throw error;
        }
        return (data || []);
    }
    // Buscar documentos de um processo
    async getDocumentosByProcessoId(processoId) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('documentos')
            .select('*')
            .eq('processo_id', processoId)
            .order('criado_em', { ascending: false });
        if (error) {
            console.error('Erro ao buscar documentos do processo:', error);
            throw error;
        }
        return (data || []);
    }
    // Deletar documento (storage + registro no banco)
    async deleteDocumento(documentoId) {
        // Primeiro, buscar o documento para obter o storage_path
        const { data: documento, error: fetchError } = await SupabaseClient_1.supabase
            .from('documentos')
            .select('storage_path')
            .eq('id', documentoId)
            .single();
        if (fetchError) {
            console.error('Erro ao buscar documento para deletar:', fetchError);
            throw fetchError;
        }
        if (documento?.storage_path) {
            // Deletar do storage
            const { error: storageError } = await SupabaseClient_1.supabase.storage
                .from('documentos')
                .remove([documento.storage_path]);
            if (storageError) {
                console.error('Erro ao deletar arquivo do storage:', storageError);
                // Continuar mesmo se falhar no storage
            }
        }
        // Deletar registro do banco
        const { error: deleteError } = await SupabaseClient_1.supabase
            .from('documentos')
            .delete()
            .eq('id', documentoId);
        if (deleteError) {
            console.error('Erro ao deletar registro do documento:', deleteError);
            throw deleteError;
        }
    }
    async updateDocumentoStatus(documentoId, status, motivoRejeicao, analisadoPor, apostilado, traduzido, solicitadoPeloJuridico) {
        const updateData = {
            status,
            atualizado_em: new Date().toISOString()
        };
        if (motivoRejeicao) {
            updateData.motivo_rejeicao = motivoRejeicao;
        }
        if (solicitadoPeloJuridico !== undefined) {
            updateData.solicitado_pelo_juridico = solicitadoPeloJuridico;
        }
        if (analisadoPor) {
            updateData.analisado_por = analisadoPor;
            updateData.analisado_em = new Date().toISOString();
        }
        if (apostilado !== undefined) {
            updateData.apostilado = apostilado;
        }
        if (traduzido !== undefined) {
            updateData.traduzido = traduzido;
        }
        const { data, error } = await SupabaseClient_1.supabase
            .from('documentos')
            .update(updateData)
            .eq('id', documentoId)
            .select()
            .single();
        if (error) {
            console.error('Erro ao atualizar status do documento:', error);
            throw error;
        }
        return data;
    }
    // Atualizar arquivo de um documento existente (substituição)
    async updateDocumentoFile(documentoId, params) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('documentos')
            .update({
            nome_original: params.nomeOriginal,
            nome_arquivo: params.nomeArquivo,
            storage_path: params.storagePath,
            public_url: params.publicUrl || null,
            content_type: params.contentType || null,
            tamanho: params.tamanho || null,
            status: params.status,
            atualizado_em: new Date().toISOString()
        })
            .eq('id', documentoId)
            .select()
            .single();
        if (error) {
            console.error('Erro ao atualizar arquivo do documento:', error);
            throw error;
        }
        return data;
    }
    // ========== FORMULÁRIOS E DECLARAÇÕES ==========
    // Interface para formulários
    // Buscar formulários de um processo (opcionalmente filtrado por memberId)
    async getFormulariosByProcessoId(processoId, memberId) {
        let query = SupabaseClient_1.supabase
            .from('formularios_juridico') // Changed from 'formularios'
            .select('*')
            .eq('processo_id', processoId)
            .order('criado_em', { ascending: false });
        if (memberId) {
            query = query.eq('membro_id', memberId);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar formulários:', error);
            throw error;
        }
        return (data || []).map(f => ({
            id: f.id,
            name: f.nome_original?.replace(/\.[^/.]+$/, '') || 'Formulário',
            fileName: f.nome_original,
            fileSize: f.tamanho,
            uploadDate: f.criado_em,
            memberId: f.membro_id,
            downloadUrl: f.public_url
        }));
    }
    // Criar formulário
    async createFormulario(params) {
        // Mocked ID for client uploads (or system uploads)
        const SYSTEM_JURIDICO_ID = '41f21e5c-dd93-4592-9470-e043badc3a18';
        const { data, error } = await SupabaseClient_1.supabase
            .from('formularios_juridico') // Changed from 'formularios'
            .insert([{
                funcionario_juridico_id: SYSTEM_JURIDICO_ID,
                cliente_id: params.clienteId,
                membro_id: params.memberId,
                processo_id: params.processoId,
                nome_original: params.nomeOriginal,
                nome_arquivo: params.nomeArquivo,
                storage_path: params.storagePath,
                public_url: params.publicUrl,
                content_type: params.contentType,
                tamanho: params.tamanho
            }])
            .select()
            .single();
        if (error) {
            console.error('Erro ao criar formulário:', error);
            throw error;
        }
        return data;
    }
    // Deletar formulário
    async deleteFormulario(formularioId) {
        // Buscar o formulário para obter o storage_path
        const { data: formulario, error: fetchError } = await SupabaseClient_1.supabase
            .from('formularios_juridico') // Changed from 'formularios'
            .select('storage_path')
            .eq('id', formularioId)
            .single();
        if (fetchError) {
            console.error('Erro ao buscar formulário para deletar:', fetchError);
            throw fetchError;
        }
        if (formulario?.storage_path) {
            // Deletar do storage
            const { error: storageError } = await SupabaseClient_1.supabase.storage
                .from('formularios-juridico') // Changed bucket too! assuming we use the same bucket
                .remove([formulario.storage_path]);
            if (storageError) {
                console.error('Erro ao deletar arquivo do storage:', storageError);
            }
        }
        // Deletar registro do banco
        const { error: deleteError } = await SupabaseClient_1.supabase
            .from('formularios_juridico') // Changed from 'formularios'
            .delete()
            .eq('id', formularioId);
        if (deleteError) {
            console.error('Erro ao deletar formulário:', deleteError);
            throw deleteError;
        }
    }
    // ============================================
    // FORMULARIOS CLIENTE (Client Response Forms)
    // ============================================
    async uploadFormularioClienteResponse(params) {
        const { data, error } = await SupabaseClient_1.supabase.storage
            .from('formularios-juridico') // Same bucket, different folder structure
            .upload(params.filePath, params.fileBuffer, {
            contentType: params.contentType,
            upsert: true
        });
        if (error) {
            console.error('Erro ao fazer upload de resposta de formulário:', error);
            throw error;
        }
        const { data: urlData } = SupabaseClient_1.supabase.storage
            .from('formularios-juridico')
            .getPublicUrl(params.filePath);
        return {
            path: data.path,
            fullPath: data.fullPath,
            publicUrl: urlData.publicUrl
        };
    }
    async createFormularioClienteResponse(params) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('formularios_cliente')
            .insert([{
                formulario_juridico_id: params.formularioJuridicoId,
                cliente_id: params.clienteId,
                membro_id: params.membroId,
                nome_original: params.nomeOriginal,
                nome_arquivo: params.nomeArquivo,
                storage_path: params.storagePath,
                public_url: params.publicUrl,
                content_type: params.contentType,
                tamanho: params.tamanho
            }])
            .select()
            .single();
        if (error) {
            console.error('Erro ao criar resposta de formulário:', error);
            throw error;
        }
        return data;
    }
    async getFormularioClienteResponsesByFormularioId(formularioJuridicoId) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('formularios_cliente')
            .select('*')
            .eq('formulario_juridico_id', formularioJuridicoId)
            .order('criado_em', { ascending: false });
        if (error) {
            console.error('Erro ao buscar respostas de formulário:', error);
            throw error;
        }
        return data || [];
    }
    async getFormularioClienteResponsesByCliente(clienteId) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('formularios_cliente')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('criado_em', { ascending: false });
        if (error) {
            console.error('Erro ao buscar respostas de formulários do cliente:', error);
            throw error;
        }
        return data || [];
    }
    async getAllClientes() {
        const { data, error } = await SupabaseClient_1.supabase
            .from('clientes')
            .select(`
                *,
                processos (
                    id,
                    tipo_servico,
                    status,
                    etapa_atual,
                    responsavel_id
                ),
                requerimentos (*)
            `)
            .order('criado_em', { ascending: false });
        if (error) {
            console.error('Erro ao buscar todos os clientes:', error);
            throw error;
        }
        if (!data || data.length === 0)
            return [];
        // Fetch profiles to get CPF/documento and responsaveis
        const { data: profiles } = await SupabaseClient_1.supabase
            .from('profiles')
            .select('id, email, cpf, full_name');
        const cpfMap = new Map(profiles?.map(p => [p.email, p.cpf]) || []);
        const responsavelMap = new Map(profiles?.map(p => [p.id, { id: p.id, full_name: p.full_name }]) || []);
        return data.map(c => {
            const processosPopulated = c.processos?.map((p) => ({
                ...p,
                responsavel: p.responsavel_id ? responsavelMap.get(p.responsavel_id) : null
            }));
            return {
                ...c,
                processos: processosPopulated,
                documento: cpfMap.get(c.email) || ''
            };
        });
    }
    // ========== PROFILE PHOTO ==========
    async upsertProfilePhoto(params) {
        const BUCKET = 'profile-photos';
        const documentType = 'profile_photo';
        // 1. Upload file to Supabase Storage
        // Path structure: clienteId/profile_timestamp.ext to avoid cache issues or just profile.ext
        const filePath = `${params.clienteId}/avatar`;
        const { data: storageData, error: storageError } = await SupabaseClient_1.supabase.storage
            .from(BUCKET)
            .upload(filePath, params.fileBuffer, {
            contentType: params.contentType,
            upsert: true
        });
        if (storageError) {
            console.error('Erro ao fazer upload da foto de perfil:', storageError);
            throw storageError;
        }
        const { data: urlData } = SupabaseClient_1.supabase.storage
            .from(BUCKET)
            .getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;
        // 2. Update Cliente record with the new photo URL
        const { data: updatedCliente, error: updateError } = await SupabaseClient_1.supabase
            .from('clientes')
            .update({
            foto_perfil: publicUrl,
            atualizado_em: new Date().toISOString()
        })
            .eq('id', params.clienteId)
            .select()
            .single();
        if (updateError) {
            console.error('Erro ao atualizar foto_perfil no cliente:', updateError);
            throw updateError;
        }
        return updatedCliente;
    }
    async getNotificacoes(clienteId) {
        return NotificationService_1.default.getNotificationsByCliente(clienteId);
    }
    async updateNotificacaoStatus(notificacaoId, lida) {
        return NotificationService_1.default.updateStatus(notificacaoId, lida);
    }
    async markAllNotificacoesAsRead(clienteId) {
        return NotificationService_1.default.markAllAsRead(clienteId);
    }
}
exports.default = new ClienteRepository();
