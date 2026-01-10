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
}

export default new ClienteRepository()