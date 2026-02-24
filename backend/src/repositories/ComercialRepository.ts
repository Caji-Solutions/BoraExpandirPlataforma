import { supabase } from '../config/SupabaseClient'

class ComercialRepository {

    async createAgendamento(agendamento: any) {   
        console.log('Tentando criar agendamento no banco:', agendamento)
        
        const { data: createdData, error } = await supabase
            .from('agendamentos')
            .insert([agendamento])
            .select()
            .single()
        
        if (error) {
            console.error('Erro do Supabase ao criar agendamento:', error)
            throw error
        }
        
        console.log('Agendamento criou com sucesso:', createdData)
        return createdData
    }

    async updateAgendamentoStatus(id: string, status: string) {
        console.log('Atualizando status do agendamento:', { id, status })
        
        const { data, error } = await supabase
            .from('agendamentos')
            .update({ status })
            .eq('id', id)
            .select()
            .single()
        
        if (error) {
            console.error('Erro ao atualizar status do agendamento:', error)
            throw error
        }
        
        return data
    }

    async getAgendamentosByUsuario(usuarioId: string) {
        console.log('Buscando agendamentos para o usuário:', usuarioId)
        
        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*')
            .eq('usuario_id', usuarioId)
            .neq('status', 'cancelado')
            .order('data_hora', { ascending: true })
        
        if (error) {
            console.error('Erro ao buscar agendamentos por usuário:', error)
            throw error
        }
        
        return agendamentos || []
    }

    async getAgendamentosByIntervalo(data_hora_inicio: string, data_hora_fim: string) {
        console.log('Buscando agendamentos no intervalo:', data_hora_inicio, 'até', data_hora_fim)
        
        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*')
            .neq('status', 'cancelado')
            .gte('data_hora', data_hora_inicio)
            .lt('data_hora', data_hora_fim)
        
        if (error) {
            console.error('Erro ao buscar agendamentos:', error)
            throw error
        }
        
        return agendamentos || []
    }

    async getAgendamentosByData(data: string) {
        console.log('Buscando agendamentos para data:', data)
        
        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*')
            .neq('status', 'cancelado')
            .gte('data_hora', `${data}T00:00:00`)
            .lt('data_hora', `${data}T23:59:59`)
            .order('data_hora', { ascending: true })
        
        if (error) {
            console.error('Erro ao buscar agendamentos:', error)
            throw error
        }
        
        return agendamentos || []
    }
}

export default new ComercialRepository()