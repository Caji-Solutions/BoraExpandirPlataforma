import NotificationService from '../services/NotificationService'
import { supabase } from '../config/SupabaseClient'
import type { ClienteDTO } from '../types/parceiro';

interface UploadDocumentParams {
    filePath: string
    fileBuffer: Buffer
    contentType: string
}

interface UploadDocumentResult {
    path: string
    fullPath: string
    publicUrl: string
}

// Interface para criar um registro de documento
interface CreateDocumentoParams {
    clienteId: string
    processoId?: string  // ID do processo ao qual o documento pertence
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string
    contentType?: string
    tamanho?: number
    status?: 'PENDING' | 'ANALYZING' | 'WAITING_APOSTILLE' | 'ANALYZING_APOSTILLE' | 'WAITING_TRANSLATION' | 'ANALYZING_TRANSLATION' | 'WAITING_TRANSLATION_QUOTE' | 'WAITING_QUOTE_APPROVAL' | 'APPROVED' | 'REJECTED'
    dependenteId?: string
}

// Interface do documento retornado
interface DocumentoRecord {
    id: string
    cliente_id: string
    processo_id: string | null  // ID do processo associado
    tipo: string
    nome_original: string
    nome_arquivo: string
    storage_path: string
    public_url: string | null
    content_type: string | null
    tamanho: number | null
    status: 'PENDING' | 'ANALYZING' | 'WAITING_APOSTILLE' | 'ANALYZING_APOSTILLE' | 'WAITING_TRANSLATION' | 'ANALYZING_TRANSLATION' | 'WAITING_TRANSLATION_QUOTE' | 'WAITING_QUOTE_APPROVAL' | 'APPROVED' | 'REJECTED'
    motivo_rejeicao: string | null
    analisado_por: string | null
    analisado_em: string | null
    criado_em: string
    atualizado_em: string
    dependente_id: string | null
    apostilado: boolean
    traduzido: boolean
}

class ClienteRepository {

    async getClienteByWppNumber(wppNumber: string) {

        const { data: cliente, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('whatsapp', wppNumber)
            .single()

        if (error) {
            throw error
        }

        return cliente
    }

    async getClienteById(id: string) {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Erro ao buscar cliente por ID:', error)
            throw error
        }
        return data
    }

    async getClientByParceiroId(parceiroId: string) {
        // Ajuste o nome da coluna conforme seu schema (ex.: parceiro_id)
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('parceiro_id', parceiroId)
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }
        return data
    }

    // Buscar processos de um cliente
    async getProcessosByClienteId(clienteId: string) {
        const { data, error } = await supabase
            .from('processos')
            .select('id, tipo_servico, status, etapa_atual, created_at, updated_at')
            .eq('cliente_id', clienteId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar processos do cliente:', error)
            throw error
        }

        return data || []
    }

    // Buscar dependentes de um cliente
    async getDependentesByClienteId(clienteId: string) {
        console.log('Repository: Buscando dependentes para clienteId:', clienteId)

        const { data, error } = await supabase
            .from('dependentes')
            .select('id, nome_completo, parentesco')
            .eq('cliente_id', clienteId)
            //.eq('status', 'ativo') // Comentado para debug - trazer todos
            .order('nome_completo', { ascending: true })

        if (error) {
            console.error('Erro ao buscar dependentes do cliente:', error)
            throw error
        }

        console.log('Repository: Dependentes encontrados:', data?.length, data)
        return data || []
    }
    async register(cliente: ClienteDTO) {
        const { data: createdData, error } = await supabase
            .from('clientes')
            .insert([cliente])
            .select()
            .single()

        if (error) {
            throw error
        }
        return createdData
    }
    async attStatusById(id: string, status: string) {
        const { data: updatedData, error } = await supabase
            .from('clientes')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw error
        }
        return updatedData
    }

    async uploadDocument({ filePath, fileBuffer, contentType, bucket = 'documentos' }: UploadDocumentParams & { bucket?: string }): Promise<UploadDocumentResult> {
        // Upload para o Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileBuffer, {
                contentType,
                upsert: true
            })

        if (error) {
            console.error(`Erro ao fazer upload para Supabase bucket ${bucket}:`, error)
            throw error
        }

        // Obter URL pública do arquivo
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        return {
            path: data.path,
            fullPath: data.fullPath,
            publicUrl: urlData.publicUrl
        }
    }

    // Criar registro de documento no banco de dados
    async createDocumento(params: CreateDocumentoParams): Promise<DocumentoRecord> {
        const { data, error } = await supabase
            .from('documentos')
            .insert([{
                cliente_id: params.clienteId,
                processo_id: params.processoId || null,  // Associa ao processo
                tipo: params.tipo,
                nome_original: params.nomeOriginal,
                nome_arquivo: params.nomeArquivo,
                storage_path: params.storagePath,
                public_url: params.publicUrl || null,
                content_type: params.contentType || null,
                tamanho: params.tamanho || null,
                status: params.status || 'PENDING',
                dependente_id: params.dependenteId || null,
                atualizado_em: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar registro de documento:', error)
            throw error
        }

        return data as DocumentoRecord
    }

    // Buscar documentos de um cliente
    async getDocumentosByClienteId(clienteId: string): Promise<DocumentoRecord[]> {
        const { data, error } = await supabase
            .from('documentos')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('criado_em', { ascending: false })

        if (error) {
            console.error('Erro ao buscar documentos:', error)
            throw error
        }

        return (data || []) as DocumentoRecord[]
    }

    // Buscar documentos de um processo
    async getDocumentosByProcessoId(processoId: string): Promise<DocumentoRecord[]> {
        const { data, error } = await supabase
            .from('documentos')
            .select('*')
            .eq('processo_id', processoId)
            .order('criado_em', { ascending: false })

        if (error) {
            console.error('Erro ao buscar documentos do processo:', error)
            throw error
        }

        return (data || []) as DocumentoRecord[]
    }

    // Deletar documento (storage + registro no banco)
    async deleteDocumento(documentoId: string): Promise<void> {
        // Primeiro, buscar o documento para obter o storage_path
        const { data: documento, error: fetchError } = await supabase
            .from('documentos')
            .select('storage_path')
            .eq('id', documentoId)
            .single()

        if (fetchError) {
            console.error('Erro ao buscar documento para deletar:', fetchError)
            throw fetchError
        }

        if (documento?.storage_path) {
            // Deletar do storage
            const { error: storageError } = await supabase.storage
                .from('documentos')
                .remove([documento.storage_path])

            if (storageError) {
                console.error('Erro ao deletar arquivo do storage:', storageError)
                // Continuar mesmo se falhar no storage
            }
        }

        // Deletar registro do banco
        const { error: deleteError } = await supabase
            .from('documentos')
            .delete()
            .eq('id', documentoId)

        if (deleteError) {
            console.error('Erro ao deletar registro do documento:', deleteError)
            throw deleteError
        }
    }

    // Atualizar status do documento
    async updateDocumentoStatus(
        documentoId: string,
        status: 'PENDING' | 'ANALYZING' | 'WAITING_APOSTILLE' | 'ANALYZING_APOSTILLE' | 'WAITING_TRANSLATION' | 'ANALYZING_TRANSLATION' | 'WAITING_TRANSLATION_QUOTE' | 'WAITING_QUOTE_APPROVAL' | 'APPROVED' | 'REJECTED',
        motivoRejeicao?: string,
        analisadoPor?: string,
        apostilado?: boolean,
        traduzido?: boolean
    ): Promise<DocumentoRecord> {
        const updateData: any = {
            status,
            atualizado_em: new Date().toISOString()
        }

        if (motivoRejeicao) {
            updateData.motivo_rejeicao = motivoRejeicao
        }

        if (analisadoPor) {
            updateData.analisado_por = analisadoPor
            updateData.analisado_em = new Date().toISOString()
        }

        if (apostilado !== undefined) {
            updateData.apostilado = apostilado
        }

        if (traduzido !== undefined) {
            updateData.traduzido = traduzido
        }

        const { data, error } = await supabase
            .from('documentos')
            .update(updateData)
            .eq('id', documentoId)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar status do documento:', error)
            throw error
        }

        return data as DocumentoRecord
    }

    // Atualizar arquivo de um documento existente (substituição)
    async updateDocumentoFile(
        documentoId: string,
        params: {
            nomeOriginal: string
            nomeArquivo: string
            storagePath: string
            publicUrl?: string
            contentType?: string
            tamanho?: number
            status: 'ANALYZING' | 'ANALYZING_APOSTILLE' | 'ANALYZING_TRANSLATION'
        }
    ): Promise<DocumentoRecord> {
        const { data, error } = await supabase
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
            .single()

        if (error) {
            console.error('Erro ao atualizar arquivo do documento:', error)
            throw error
        }

        return data as DocumentoRecord
    }

    // ========== FORMULÁRIOS E DECLARAÇÕES ==========

    // Interface para formulários
    // Buscar formulários de um processo (opcionalmente filtrado por memberId)
    async getFormulariosByProcessoId(processoId: string, memberId?: string): Promise<any[]> {
        let query = supabase
            .from('formularios_juridico') // Changed from 'formularios'
            .select('*')
            .eq('processo_id', processoId)
            .order('criado_em', { ascending: false })

        if (memberId) {
            query = query.eq('membro_id', memberId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Erro ao buscar formulários:', error)
            throw error
        }

        return (data || []).map(f => ({
            id: f.id,
            name: f.nome_original?.replace(/\.[^/.]+$/, '') || 'Formulário',
            fileName: f.nome_original,
            fileSize: f.tamanho,
            uploadDate: f.criado_em,
            memberId: f.membro_id,
            downloadUrl: f.public_url
        }))
    }

    // Criar formulário
    async createFormulario(params: {
        processoId: string
        clienteId: string
        memberId: string
        nomeOriginal: string
        nomeArquivo: string
        storagePath: string
        publicUrl: string
        contentType: string
        tamanho: number
    }): Promise<any> {
        // Mocked ID for client uploads (or system uploads)
        const SYSTEM_JURIDICO_ID = '41f21e5c-dd93-4592-9470-e043badc3a18'

        const { data, error } = await supabase
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
            .single()

        if (error) {
            console.error('Erro ao criar formulário:', error)
            throw error
        }

        return data
    }

    // Deletar formulário
    async deleteFormulario(formularioId: string): Promise<void> {
        // Buscar o formulário para obter o storage_path
        const { data: formulario, error: fetchError } = await supabase
            .from('formularios_juridico') // Changed from 'formularios'
            .select('storage_path')
            .eq('id', formularioId)
            .single()

        if (fetchError) {
            console.error('Erro ao buscar formulário para deletar:', fetchError)
            throw fetchError
        }

        if (formulario?.storage_path) {
            // Deletar do storage
            const { error: storageError } = await supabase.storage
                .from('formularios-juridico') // Changed bucket too! assuming we use the same bucket
                .remove([formulario.storage_path])

            if (storageError) {
                console.error('Erro ao deletar arquivo do storage:', storageError)
            }
        }

        // Deletar registro do banco
        const { error: deleteError } = await supabase
            .from('formularios_juridico') // Changed from 'formularios'
            .delete()
            .eq('id', formularioId)

        if (deleteError) {
            console.error('Erro ao deletar formulário:', deleteError)
            throw deleteError
        }
    }

    // ============================================
    // FORMULARIOS CLIENTE (Client Response Forms)
    // ============================================

    async uploadFormularioClienteResponse(params: {
        filePath: string
        fileBuffer: Buffer
        contentType: string
    }): Promise<{ path: string; fullPath: string; publicUrl: string }> {
        const { data, error } = await supabase.storage
            .from('formularios-juridico')  // Same bucket, different folder structure
            .upload(params.filePath, params.fileBuffer, {
                contentType: params.contentType,
                upsert: true
            })

        if (error) {
            console.error('Erro ao fazer upload de resposta de formulário:', error)
            throw error
        }

        const { data: urlData } = supabase.storage
            .from('formularios-juridico')
            .getPublicUrl(params.filePath)

        return {
            path: data.path,
            fullPath: data.fullPath,
            publicUrl: urlData.publicUrl
        }
    }

    async createFormularioClienteResponse(params: {
        formularioJuridicoId: string
        clienteId: string
        membroId: string
        nomeOriginal: string
        nomeArquivo: string
        storagePath: string
        publicUrl: string
        contentType: string
        tamanho: number
    }): Promise<any> {
        const { data, error } = await supabase
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
            .single()

        if (error) {
            console.error('Erro ao criar resposta de formulário:', error)
            throw error
        }

        return data
    }

    async getFormularioClienteResponsesByFormularioId(formularioJuridicoId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('formularios_cliente')
            .select('*')
            .eq('formulario_juridico_id', formularioJuridicoId)
            .order('criado_em', { ascending: false })

        if (error) {
            console.error('Erro ao buscar respostas de formulário:', error)
            throw error
        }

        return data || []
    }

    async getFormularioClienteResponsesByCliente(clienteId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('formularios_cliente')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('criado_em', { ascending: false })

        if (error) {
            console.error('Erro ao buscar respostas de formulários do cliente:', error)
            throw error
        }

        return data || []
    }

    async getAllClientes() {
        const { data, error } = await supabase
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
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar todos os clientes:', error)
            throw error
        }

        return data || []
    }

    // ========== PROFILE PHOTO ==========

    async upsertProfilePhoto(params: {
        clienteId: string
        fileBuffer: Buffer
        contentType: string
        fileName: string
    }): Promise<any> {
        const BUCKET = 'profile-photos'
        const documentType = 'profile_photo'
        
        // 1. Upload file to Supabase Storage
        // Path structure: clienteId/profile_timestamp.ext to avoid cache issues or just profile.ext
        const filePath = `${params.clienteId}/avatar`

        const { data: storageData, error: storageError } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, params.fileBuffer, {
                contentType: params.contentType,
                upsert: true
            })

        if (storageError) {
            console.error('Erro ao fazer upload da foto de perfil:', storageError)
            throw storageError
        }

        const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(filePath)

        const publicUrl = urlData.publicUrl

        // 2. Update Cliente record with the new photo URL
        const { data: updatedCliente, error: updateError } = await supabase
            .from('clientes')
            .update({
                foto_perfil: publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', params.clienteId)
            .select()
            .single()

        if (updateError) {
            console.error('Erro ao atualizar foto_perfil no cliente:', updateError)
            throw updateError
        }

        return updatedCliente
    }

    async getNotificacoes(clienteId: string): Promise<any[]> {
        return NotificationService.getNotificationsByCliente(clienteId);
    }

    async updateNotificacaoStatus(notificacaoId: string, lida: boolean): Promise<any> {
        return NotificationService.updateStatus(notificacaoId, lida);
    }

    async markAllNotificacoesAsRead(clienteId: string): Promise<any> {
        return NotificationService.markAllAsRead(clienteId);
    }
}

export default new ClienteRepository()