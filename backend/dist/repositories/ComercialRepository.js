"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const SupabaseClient_1 = require("../config/SupabaseClient");
class ComercialRepository {
    async createAgendamento(agendamento) {
        console.log('Tentando criar agendamento no banco:', agendamento);
        const { data: createdData, error } = await SupabaseClient_1.supabase
            .from('agendamentos')
            .insert([agendamento])
            .select()
            .single();
        if (error) {
            console.error('Erro do Supabase ao criar agendamento:', error);
            throw error;
        }
        console.log('Agendamento criou com sucesso:', createdData);
        return createdData;
    }
    async updateAgendamentoStatus(id, status) {
        console.log('Atualizando status do agendamento:', { id, status });
        const { data, error } = await SupabaseClient_1.supabase
            .from('agendamentos')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Erro ao atualizar status do agendamento:', error);
            throw error;
        }
        // Se o status for aprovado, verifica se o serviço requer delegação jurídica
        if (status === 'aprovado' && data) {
            try {
                // 1. Verificar no catálogo se este serviço requer delegação
                const { data: service } = await SupabaseClient_1.supabase
                    .from('catalogo_servicos')
                    .select('requer_delegacao_juridico, nome')
                    .eq('id', data.produto_id)
                    .single();
                if (service?.requer_delegacao_juridico) {
                    console.log(`Serviço "${service.nome}" requer delegação jurídica. Verificando processo...`);
                    const JuridicoRepository = (await Promise.resolve().then(() => __importStar(require('./JuridicoRepository')))).default;
                    const existingProcess = await JuridicoRepository.getProcessoByClienteId(data.cliente_id);
                    if (!existingProcess) {
                        console.log('Nenhum processo ativo encontrado. Criando novo processo vago...');
                        await JuridicoRepository.createProcess({
                            clienteId: data.cliente_id,
                            tipoServico: service.nome,
                            status: 'waiting_delegation',
                            etapaAtual: 1,
                            responsavelId: undefined
                        });
                        console.log('Processo vago criado com sucesso.');
                    }
                    else {
                        console.log('Processo já existente para este cliente.');
                    }
                }
            }
            catch (err) {
                console.error('Erro ao processar delegação jurídica automática:', err);
            }
        }
        // Se o status for aprovado, cria uma notificação para o cliente
        if (status === 'aprovado' && data && data.cliente_id) {
            try {
                const NotificationService = (await Promise.resolve().then(() => __importStar(require('../services/NotificationService')))).default;
                await NotificationService.createNotification({
                    clienteId: data.cliente_id,
                    titulo: 'Agendamento Confirmado',
                    mensagem: `Seu agendamento de "${data.produto_nome || 'Consultoria'}" para o dia ${new Date(data.data_hora).toLocaleDateString('pt-BR')} às ${new Date(data.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} foi confirmado com sucesso!`,
                    tipo: 'agendamento',
                    dataPrazo: data.data_hora // O "prazo" da notificação é a própria data do agendamento
                });
            }
            catch (notifError) {
                console.error('Erro ao criar notificação de agendamento aprovado:', notifError);
            }
        }
        return data;
    }
    async getAgendamentosByUsuario(usuarioId) {
        console.log('Buscando agendamentos para o usuário:', usuarioId);
        const { data: agendamentos, error } = await SupabaseClient_1.supabase
            .from('agendamentos')
            .select('*')
            .eq('usuario_id', usuarioId)
            .neq('status', 'cancelado')
            .order('data_hora', { ascending: true });
        if (error) {
            console.error('Erro ao buscar agendamentos por usuário:', error);
            throw error;
        }
        return agendamentos || [];
    }
    async getAgendamentosByIntervalo(data_hora_inicio, data_hora_fim) {
        console.log('Buscando agendamentos no intervalo:', data_hora_inicio, 'até', data_hora_fim);
        const { data: agendamentos, error } = await SupabaseClient_1.supabase
            .from('agendamentos')
            .select('*')
            .neq('status', 'cancelado')
            .gte('data_hora', data_hora_inicio)
            .lt('data_hora', data_hora_fim);
        if (error) {
            console.error('Erro ao buscar agendamentos:', error);
            throw error;
        }
        return agendamentos || [];
    }
    async getAgendamentosByData(data) {
        console.log('Buscando agendamentos para data:', data);
        const { data: agendamentos, error } = await SupabaseClient_1.supabase
            .from('agendamentos')
            .select('*')
            .neq('status', 'cancelado')
            .gte('data_hora', `${data}T00:00:00`)
            .lt('data_hora', `${data}T23:59:59`)
            .order('data_hora', { ascending: true });
        if (error) {
            console.error('Erro ao buscar agendamentos:', error);
            throw error;
        }
        return agendamentos || [];
    }
    async getAgendamentosByCliente(clienteId) {
        console.log('Buscando agendamentos para o cliente:', clienteId);
        const { data: agendamentos, error } = await SupabaseClient_1.supabase
            .from('agendamentos')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('data_hora', { ascending: true });
        if (error) {
            console.error('Erro ao buscar agendamentos por cliente:', error);
            throw error;
        }
        return agendamentos || [];
    }
    async getAgendamentoById(id) {
        console.log('Buscando agendamento por ID:', id);
        const { data, error } = await SupabaseClient_1.supabase
            .from('agendamentos')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Erro ao buscar agendamento por ID:', error);
            throw error;
        }
        return data;
    }
    async updateAgendamentoCheckoutUrl(id, checkoutUrl) {
        console.log('Salvando checkout_url no agendamento:', { id, checkoutUrl });
        const { data, error } = await SupabaseClient_1.supabase
            .from('agendamentos')
            .update({ checkout_url: checkoutUrl })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Erro ao atualizar checkout_url do agendamento:', error);
            throw error;
        }
        return data;
    }
}
exports.default = new ComercialRepository();
