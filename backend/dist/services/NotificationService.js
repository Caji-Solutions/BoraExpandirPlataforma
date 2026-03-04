"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SupabaseClient_1 = require("../config/SupabaseClient");
class NotificationService {
    /**
     * Cria uma nova notificação para um cliente
     */
    async createNotification(params) {
        let dataPrazo = params.dataPrazo;
        // Se não foi passada uma data específica mas foi passado um prazo em dias, calcula a data
        if (!dataPrazo && params.prazo) {
            const data = new Date();
            data.setDate(data.getDate() + params.prazo);
            dataPrazo = data.toISOString();
        }
        const notificationData = {
            cliente_id: params.clienteId,
            criador_id: params.criadorId,
            titulo: params.titulo,
            mensagem: params.mensagem,
            tipo: params.tipo || 'info',
            lida: params.lida || false,
            data_prazo: dataPrazo,
            criado_em: new Date().toISOString()
        };
        console.log('NotificationService: Criando notificação...', notificationData);
        const { data, error } = await SupabaseClient_1.supabase
            .from('notificacoes')
            .insert([notificationData])
            .select()
            .single();
        if (error) {
            console.error('NotificationService: Erro ao criar notificação:', error);
            throw error;
        }
        return data;
    }
    /**
     * Busca notificações de um cliente
     */
    async getNotificationsByCliente(clienteId) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('notificacoes')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('criado_em', { ascending: false });
        if (error) {
            console.error('NotificationService: Erro ao buscar notificações:', error);
            throw error;
        }
        return data || [];
    }
    /**
     * Atualiza o status de leitura de uma notificação
     */
    async updateStatus(notificacaoId, lida) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('notificacoes')
            .update({ lida })
            .eq('id', notificacaoId)
            .select()
            .single();
        if (error) {
            console.error('NotificationService: Erro ao atualizar status:', error);
            throw error;
        }
        return data;
    }
    /**
     * Marca todas as notificações de um cliente como lidas
     */
    async markAllAsRead(clienteId) {
        const { data, error } = await SupabaseClient_1.supabase
            .from('notificacoes')
            .update({ lida: true })
            .eq('cliente_id', clienteId)
            .eq('lida', false);
        if (error) {
            console.error('NotificationService: Erro ao marcar todas como lidas:', error);
            throw error;
        }
        return data;
    }
}
exports.default = new NotificationService();
