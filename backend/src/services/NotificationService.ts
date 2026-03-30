import { supabase } from '../config/SupabaseClient'

export interface CreateNotificationParams {
    clienteId?: string
    usuarioId?: string
    criadorId?: string
    titulo: string
    mensagem: string
    tipo?: 'info' | 'success' | 'warning' | 'error' | 'agendamento'
    prazo?: number // prazo em dias
    dataPrazo?: string
    lida?: boolean
}

class NotificationService {
    /**
     * Cria uma nova notificação para um cliente ou usuário (funcionário)
     */
    async createNotification(params: CreateNotificationParams) {
        let dataPrazo = params.dataPrazo

        // Se não foi passada uma data específica mas foi passado um prazo em dias, calcula a data
        if (!dataPrazo && params.prazo) {
            const data = new Date()
            data.setDate(data.getDate() + params.prazo)
            dataPrazo = data.toISOString()
        }

        const notificationData: any = {
            criador_id: params.criadorId,
            titulo: params.titulo,
            mensagem: params.mensagem,
            tipo: params.tipo || 'info',
            lida: params.lida || false,
            data_prazo: dataPrazo,
            criado_em: new Date().toISOString()
        }

        // Adicionar cliente_id ou usuario_id (constraint do banco exige um dos dois)
        if (params.usuarioId) {
            notificationData.usuario_id = params.usuarioId
            notificationData.cliente_id = null
        } else if (params.clienteId) {
            notificationData.cliente_id = params.clienteId
            notificationData.usuario_id = null
        } else {
            throw new Error('NotificationService: clienteId ou usuarioId é obrigatório')
        }

        console.log('NotificationService: Criando notificacao...', notificationData)

        const { data, error } = await supabase
            .from('notificacoes')
            .insert([notificationData])
            .select()
            .single()

        if (error) {
            console.error('NotificationService: Erro ao criar notificacao:', error)
            throw error
        }

        return data
    }

    /**
     * Busca notificações de um cliente
     */
    async getNotificationsByCliente(clienteId: string) {
        console.log('[NotificationService.getNotificationsByCliente] Iniciando...')
        console.log('[NotificationService] clienteId:', clienteId)
        console.log('[NotificationService] Tentando buscar de notificacoes table...')

        const { data, error } = await supabase
            .from('notificacoes')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('criado_em', { ascending: false })

        console.log('[NotificationService] Resposta do Supabase:')
        console.log('[NotificationService] - data:', data ? `${data.length} registros` : 'null')
        console.log('[NotificationService] - error:', error ? `${error.code}: ${error.message}` : 'null')

        if (error) {
            console.error('[NotificationService] ❌ Erro ao buscar notificacoes:', {
                code: error.code,
                message: error.message,
                details: error.details,
                status: error.status
            })
            throw error
        }

        console.log('[NotificationService] ✅ Notificações recuperadas com sucesso')
        return data || []
    }

    /**
     * Atualiza o status de leitura de uma notificação
     */
    async updateStatus(notificacaoId: string, lida: boolean) {
        const { data, error } = await supabase
            .from('notificacoes')
            .update({ lida })
            .eq('id', notificacaoId)
            .select()
            .single()

        if (error) {
            console.error('NotificationService: Erro ao atualizar status:', error)
            throw error
        }

        return data
    }

    /**
     * Marca todas as notificações de um cliente como lidas
     */
    async markAllAsRead(clienteId: string) {
        const { data, error } = await supabase
            .from('notificacoes')
            .update({ lida: true })
            .eq('cliente_id', clienteId)
            .eq('lida', false)

        if (error) {
            console.error('NotificationService: Erro ao marcar todas como lidas:', error)
            throw error
        }

        return data
    }

    /**
     * Busca notificações de um usuário (funcionário/profile)
     */
    async getNotificationsByUsuario(usuarioId: string) {
        console.log('[NotificationService.getNotificationsByUsuario] Iniciando...')
        console.log('[NotificationService] usuarioId:', usuarioId)
        console.log('[NotificationService] Tentando buscar de notificacoes table...')

        const { data, error } = await supabase
            .from('notificacoes')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('criado_em', { ascending: false })

        console.log('[NotificationService] Resposta do Supabase:')
        console.log('[NotificationService] - data:', data ? `${data.length} registros` : 'null')
        console.log('[NotificationService] - error:', error ? `${error.code}: ${error.message}` : 'null')

        if (error) {
            console.error('[NotificationService] ❌ Erro ao buscar notificacoes por usuario:', {
                code: error.code,
                message: error.message,
                details: error.details,
                status: error.status
            })
            throw error
        }

        console.log('[NotificationService] ✅ Notificações de usuário recuperadas com sucesso')
        return data || []
    }

    /**
     * Marca todas as notificações de um usuário como lidas
     */
    async markAllAsReadByUsuario(usuarioId: string) {
        console.log('[NotificationService.markAllAsReadByUsuario] Iniciando...')
        console.log('[NotificationService] usuarioId:', usuarioId)

        const { data, error } = await supabase
            .from('notificacoes')
            .update({ lida: true })
            .eq('usuario_id', usuarioId)
            .eq('lida', false)

        if (error) {
            console.error('[NotificationService] ❌ Erro ao marcar notificações como lidas:', error)
            throw error
        }

        console.log('[NotificationService] ✅ Notificações marcadas como lidas')
        return data
    }
}

export default new NotificationService()
