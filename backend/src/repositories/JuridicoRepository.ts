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
    // GESTÃO DE CLIENTES DO JURÍDICO
    // =============================================

    // Atribuir responsável jurídico a um cliente
    async atribuirResponsavel(clienteId: string, responsavelId: string | null): Promise<any> {
        const { data, error } = await supabase
            .from('clientes')
            .update({ 
                responsavel_juridico_id: responsavelId,
                updated_at: new Date().toISOString()
            })
            .eq('id', clienteId)
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
}

export default new JuridicoRepository()
