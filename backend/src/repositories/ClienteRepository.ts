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
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string
    contentType?: string
    tamanho?: number
}

// Interface do documento retornado
interface DocumentoRecord {
    id: string
    cliente_id: string
    tipo: string
    nome_original: string
    nome_arquivo: string
    storage_path: string
    public_url: string | null
    content_type: string | null
    tamanho: number | null
    status: 'PENDING' | 'ANALYZING' | 'APPROVED' | 'REJECTED'
    motivo_rejeicao: string | null
    analisado_por: string | null
    analisado_em: string | null
    criado_em: string
    atualizado_em: string
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

    async uploadDocument({ filePath, fileBuffer, contentType }: UploadDocumentParams): Promise<UploadDocumentResult> {
        // Upload para o Supabase Storage
        const { data, error } = await supabase.storage
            .from('documentos')
            .upload(filePath, fileBuffer, {
                contentType,
                upsert: true
            })

        if (error) {
            console.error('Erro ao fazer upload para Supabase:', error)
            throw error
        }

        // Obter URL pública do arquivo
        const { data: urlData } = supabase.storage
            .from('documentos')
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
                tipo: params.tipo,
                nome_original: params.nomeOriginal,
                nome_arquivo: params.nomeArquivo,
                storage_path: params.storagePath,
                public_url: params.publicUrl || null,
                content_type: params.contentType || null,
                tamanho: params.tamanho || null,
                status: 'PENDING',
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
    async updateDocumentoStatus(documentoId: string, status: 'PENDING' | 'ANALYZING' | 'APPROVED' | 'REJECTED', motivoRejeicao?: string, analisadoPor?: string): Promise<DocumentoRecord> {
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
}

export default new ClienteRepository()