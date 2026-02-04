import { supabase } from '../config/SupabaseClient'

// Interface do funcionário jurídico
interface FuncionarioJuridico {
    id: string
    full_name: string | null
    email: string | null
    telefone: string | null
}

// Interface do cliente com responsável
interface ClienteComResponsavel {
    id: string
    nome: string
    email: string
    whatsapp: string
    parceiro_id: string
    status: string
    responsavel_juridico_id: string | null
    created_at: string
    updated_at: string
    responsavel_juridico?: FuncionarioJuridico | null
}

class JuridicoRepository {

    // =============================================
    // GESTÃO DE FUNCIONÁRIOS DO JURÍDICO
    // =============================================

    // Buscar todos os funcionários do jurídico
    async getFuncionarios(): Promise<FuncionarioJuridico[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, telefone')
            .eq('role', 'juridico')
            .order('full_name', { ascending: true })

        if (error) {
            console.error('Erro ao buscar funcionários do jurídico:', error)
            throw error
        }

        return (data || []) as FuncionarioJuridico[]
    }

    // Buscar funcionário por ID
    async getFuncionarioById(funcionarioId: string): Promise<FuncionarioJuridico | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, telefone')
            .eq('id', funcionarioId)
            .eq('role', 'juridico')
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            console.error('Erro ao buscar funcionário:', error)
            throw error
        }

        return data as FuncionarioJuridico
    }

    // =============================================
    // GESTÃO DE PROCESSOS DO JURÍDICO
    // =============================================

    // Listar todos os processos com dados do cliente e responsável
    async getProcessos(): Promise<any[]> {
        const { data: processos, error } = await supabase
            .from('processos')
            .select(`
                *,
                client:profiles!client_id (
                    id,
                    full_name,
                    email
                ),
                documentos (*)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar processos:', error)
            throw error
        }

        if (!processos || processos.length === 0) return []

        // Buscar responsáveis únicos
        const responsavelIds = [...new Set(
            processos
                .filter(p => p.responsavel_id)
                .map(p => p.responsavel_id)
        )]

        let responsaveisMap: Record<string, FuncionarioJuridico> = {}

        if (responsavelIds.length > 0) {
            const { data: responsaveis } = await supabase
                .from('profiles')
                .select('id, full_name, email, telefone')
                .in('id', responsavelIds)

            if (responsaveis) {
                responsaveisMap = responsaveis.reduce((acc, r) => {
                    acc[r.id] = r as FuncionarioJuridico
                    return acc
                }, {} as Record<string, FuncionarioJuridico>)
            }
        }

        // Mapear processos com seus responsáveis
        return processos.map(processo => ({
            ...processo,
            responsavel: processo.responsavel_id 
                ? responsaveisMap[processo.responsavel_id] || null 
                : null
        }))
    }

    // Listar processos sem responsável (vagos)
    async getProcessosSemResponsavel(): Promise<any[]> {
        const { data, error } = await supabase
            .from('processos')
            .select(`
                *,
                client:profiles!client_id (
                    id,
                    full_name,
                    email
                ),
                documentos (*)
            `)
            .is('responsavel_id', null)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar processos sem responsável:', error)
            throw error
        }

        return data || []
    }

    // Listar processos de um responsável específico
    async getProcessosByResponsavel(responsavelId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('processos')
            .select(`
                *,
                clientes:clientes!cliente_id (
                    id,
                    nome,
                    email
                ),
                documentos (*)
            `)
            .eq('responsavel_id', responsavelId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar processos do responsável:', error)
            throw error
        }

        return data || []
    }

    // Atribuir responsável jurídico a um processo
    async atribuirResponsavel(processoId: string, responsavelId: string | null): Promise<any> {
        const { data, error } = await supabase
            .from('processos')
            .update({   
                responsavel_id: responsavelId,
                delegado_em: responsavelId ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', processoId)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atribuir responsável jurídico:', error)
            throw error
        }

        return data
    }

    // Buscar clientes por responsável jurídico
    async getClientesByResponsavel(responsavelId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('responsavel_juridico_id', responsavelId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar clientes do responsável:', error)
            throw error
        }

        return data || []
    }

    // Buscar clientes sem responsável jurídico (vagos)
    async getClientesSemResponsavel(): Promise<any[]> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .is('responsavel_juridico_id', null)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar clientes sem responsável:', error)
            throw error
        }

        return data || []
    }

    // Buscar cliente com dados do responsável jurídico
    async getClienteComResponsavel(clienteId: string): Promise<ClienteComResponsavel | null> {
        // Primeiro busca o cliente
        const { data: cliente, error: clienteError } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', clienteId)
            .single()

        if (clienteError) {
            if (clienteError.code === 'PGRST116') return null
            console.error('Erro ao buscar cliente:', clienteError)
            throw clienteError
        }

        // Se tiver responsável, busca os dados dele
        if (cliente?.responsavel_juridico_id) {
            const { data: responsavel, error: responsavelError } = await supabase
                .from('profiles')
                .select('id, full_name, email, telefone')
                .eq('id', cliente.responsavel_juridico_id)
                .single()

            if (!responsavelError && responsavel) {
                return {
                    ...cliente,
                    responsavel_juridico: responsavel as FuncionarioJuridico
                } as ClienteComResponsavel
            }
        }

        return {
            ...cliente,
            responsavel_juridico: null
        } as ClienteComResponsavel
    }

    // Buscar todos os clientes com seus responsáveis (para listagem geral)
    async getAllClientesComResponsavel(): Promise<any[]> {
        const { data: clientes, error } = await supabase
            .from('clientes')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar clientes:', error)
            throw error
        }

        if (!clientes || clientes.length === 0) return []

        // Buscar todos os responsáveis únicos
        const responsavelIds = [...new Set(
            clientes
                .filter(c => c.responsavel_juridico_id)
                .map(c => c.responsavel_juridico_id)
        )]

        let responsaveisMap: Record<string, FuncionarioJuridico> = {}

        if (responsavelIds.length > 0) {
            const { data: responsaveis } = await supabase
                .from('profiles')
                .select('id, full_name, email, telefone')
                .in('id', responsavelIds)

            if (responsaveis) {
                responsaveisMap = responsaveis.reduce((acc, r) => {
                    acc[r.id] = r as FuncionarioJuridico
                    return acc
                }, {} as Record<string, FuncionarioJuridico>)
            }
        }

        // Mapear clientes com seus responsáveis
        return clientes.map(cliente => ({
            ...cliente,
            responsavel_juridico: cliente.responsavel_juridico_id 
                ? responsaveisMap[cliente.responsavel_juridico_id] || null 
                : null
        }))
    }

    // =============================================
    // ESTATÍSTICAS DO JURÍDICO
    // =============================================

    // Contar clientes por responsável
    async getEstatisticasPorResponsavel(): Promise<any[]> {
        const funcionarios = await this.getFuncionarios()
        
        const stats = await Promise.all(
            funcionarios.map(async (func) => {
                const { count } = await supabase
                    .from('clientes')
                    .select('*', { count: 'exact', head: true })
                    .eq('responsavel_juridico_id', func.id)

                return {
                    funcionario: func,
                    totalClientes: count || 0
                }
            })
        )

        // Adicionar contagem de vagos
        const { count: vagos } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .is('responsavel_juridico_id', null)

        return [
            ...stats,
            { funcionario: null, totalClientes: vagos || 0, isVago: true }
        ]
    }

    // =============================================
    // FORMULÁRIOS DO JURÍDICO (enviados para clientes)
    // =============================================

    // Upload document to formularios-juridico bucket
    async uploadFormularioJuridico(params: { filePath: string, fileBuffer: Buffer, contentType: string }): Promise<{ path: string, fullPath: string, publicUrl: string }> {
        const { data, error } = await supabase.storage
            .from('formularios-juridico')
            .upload(params.filePath, params.fileBuffer, {
                contentType: params.contentType,
                upsert: true
            })

        if (error) {
            console.error('Erro ao fazer upload para bucket formularios-juridico:', error)
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

    // Create formulario_juridico record
    async createFormularioJuridico(params: {
        funcionarioJuridicoId: string
        clienteId: string
        membroId?: string
        processoId?: string
        nomeOriginal: string
        nomeArquivo: string
        storagePath: string
        publicUrl: string
        contentType: string
        tamanho: number
    }): Promise<any> {
        const { data, error } = await supabase
            .from('formularios_juridico')
            .insert([{
                funcionario_juridico_id: params.funcionarioJuridicoId,
                cliente_id: params.clienteId,
                membro_id: params.membroId || null,
                processo_id: params.processoId || null,
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
            console.error('Erro ao criar formulário jurídico:', error)
            throw error
        }

        return data
    }

    // Get formularios_juridico by cliente (documents sent to this client)
    async getFormulariosJuridicoByClienteId(clienteId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('formularios_juridico')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('criado_em', { ascending: false })

        if (error) {
            console.error('Erro ao buscar formulários jurídico:', error)
            throw error
        }

        return (data || []).map(f => ({
            id: f.id,
            name: f.nome_original?.replace(/\.[^/.]+$/, '') || 'Documento',
            fileName: f.nome_original,
            fileSize: f.tamanho,
            uploadDate: f.criado_em,
            memberId: f.membro_id,
            downloadUrl: f.public_url,
            funcionarioId: f.funcionario_juridico_id
        }))
    }

    // Delete formulario_juridico
    async deleteFormularioJuridico(formularioId: string): Promise<void> {
        // Fetch to get storage_path
        const { data: formulario, error: fetchError } = await supabase
            .from('formularios_juridico')
            .select('storage_path')
            .eq('id', formularioId)
            .single()

        if (fetchError) {
            console.error('Erro ao buscar formulário jurídico para deletar:', fetchError)
            throw fetchError
        }

        if (formulario?.storage_path) {
            const { error: storageError } = await supabase.storage
                .from('formularios-juridico')
                .remove([formulario.storage_path])

            if (storageError) {
                console.error('Erro ao deletar arquivo do storage:', storageError)
            }
        }

        const { error: deleteError } = await supabase
            .from('formularios_juridico')
            .delete()
            .eq('id', formularioId)

        if (deleteError) {
            console.error('Erro ao deletar formulário jurídico:', deleteError)
            throw deleteError
        }
    }

    // Get formulários with response status (waiting or received)
    async getFormulariosWithResponses(clienteId: string, membroId?: string): Promise<any[]> {
        // 1. Fetch all formularios_juridico for this client/member
        let query = supabase
            .from('formularios_juridico')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('criado_em', { ascending: false })

        if (membroId) {
            query = query.eq('membro_id', membroId)
        }

        const { data: formularios, error } = await query

        if (error) {
            console.error('Erro ao buscar formulários jurídico:', error)
            throw error
        }

        if (!formularios || formularios.length === 0) {
            return []
        }

        // 2. For each formulário, check if there's a response in formularios_cliente
        const formularioIds = formularios.map(f => f.id)

        const { data: respostas, error: respostasError } = await supabase
            .from('formularios_cliente')
            .select('*')
            .in('formulario_juridico_id', formularioIds)

        if (respostasError) {
            console.error('Erro ao buscar respostas de formulários:', respostasError)
            // Continue without responses if there's an error
        }

        // Create a map of formularioId -> response
        const respostasMap: Record<string, any> = {}
        if (respostas) {
            respostas.forEach(r => {
                respostasMap[r.formulario_juridico_id] = r
            })
        }

        // 3. Map formulários with their status
        return formularios.map(f => {
            const resposta = respostasMap[f.id]
            return {
                id: f.id,
                name: f.nome_original?.replace(/\.[^/.]+$/, '') || 'Formulário',
                fileName: f.nome_original,
                fileSize: f.tamanho,
                uploadDate: f.criado_em,
                memberId: f.membro_id,
                downloadUrl: f.public_url,
                funcionarioId: f.funcionario_juridico_id,
                // Response status
                status: resposta ? 'received' : 'waiting',
                // Response approval status (pendente/aprovado/rejeitado)
                responseStatus: resposta?.status || null,
                motivoRejeicao: resposta?.motivo_rejeicao || null,
                // Response data (if exists)
                response: resposta ? {
                    id: resposta.id,
                    fileName: resposta.nome_original,
                    downloadUrl: resposta.public_url,
                    uploadDate: resposta.criado_em
                } : null
            }
        })
    }

    // Update formulario_cliente status (approve/reject)
    async updateFormularioClienteStatus(
        formularioClienteId: string, 
        status: 'pendente' | 'aprovado' | 'rejeitado', 
        motivoRejeicao?: string
    ): Promise<any> {
        const updateData: any = {
            status,
            atualizado_em: new Date().toISOString()
        }

        // Only set motivo_rejeicao if rejecting
        if (status === 'rejeitado' && motivoRejeicao) {
            updateData.motivo_rejeicao = motivoRejeicao
        } else if (status !== 'rejeitado') {
            updateData.motivo_rejeicao = null
        }

        const { data, error } = await supabase
            .from('formularios_cliente')
            .update(updateData)
            .eq('id', formularioClienteId)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar status do formulário cliente:', error)
            throw error
        }

        return data
    }
}

export default new JuridicoRepository()
