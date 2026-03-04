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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ComercialRepository_1 = __importDefault(require("../repositories/ComercialRepository"));
const AdmRepository_1 = __importDefault(require("../repositories/AdmRepository"));
class ComercialController {
    async createAgendamento(req, res) {
        console.log('========== CREATE AGENDAMENTO DEBUG ==========');
        console.log('Body completo recebido:', req.body);
        try {
            const { nome, email, telefone, data_hora, produto_id, duracao_minutos, status, usuario_id, cliente_id } = req.body;
            console.log('IDs recebidos:', { usuario_id, cliente_id });
            // Validação básica
            if (!nome || !email || !telefone || !data_hora || !produto_id) {
                console.error('Campos obrigatórios faltando:', { nome, email, telefone, data_hora, produto_id });
                return res.status(400).json({
                    message: 'Campos obrigatórios: nome, email, telefone, data_hora, produto_id'
                });
            }
            // Normaliza data_hora para UTC (evita falsos negativos na checagem)
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`;
            // Verifica disponibilidade do horário
            const duracao = duracao_minutos || 60;
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao);
            console.log('Disponibilidade verificada:', disponibilidade);
            if (!disponibilidade.disponivel) {
                return res.status(409).json({
                    message: 'Horário indisponível',
                    conflitos: disponibilidade.agendamentos
                });
            }
            const agendamento = {
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                duracao_minutos: duracao,
                status: status || 'agendado',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null
            };
            console.log('Objeto agendamento final para envio ao DB:', agendamento);
            const createdData = await ComercialRepository_1.default.createAgendamento(agendamento);
            console.log('Agendamento criado com sucesso:', createdData);
            return res.status(201).json(createdData);
        }
        catch (error) {
            console.error('Erro ao criar agendamento:', error);
            return res.status(500).json({
                message: 'Erro ao criar agendamento',
                error: error.message
            });
        }
        finally {
            console.log('================================================');
        }
    }
    /**
     * Cria sessão de checkout do MercadoPago e retorna o link
     * O agendamento será criado pelo webhook após confirmação do pagamento
     */
    async createAgendamentoMercadoPago(req, res) {
        console.log('========== CREATE MERCADO PAGO CHECKOUT DEBUG ==========');
        console.log('Body recebido:', req.body);
        try {
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, usuario_id, cliente_id } = req.body;
            console.log('IDs recebidos:', { usuario_id, cliente_id });
            // Validação básica
            if (!nome || !email || !telefone || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({
                    message: 'Campos obrigatórios: nome, email, telefone, data_hora, produto_id, produto_nome, valor'
                });
            }
            // Normaliza data_hora para UTC
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`;
            // Verifica disponibilidade do horário antes de criar o checkout
            const duracao = duracao_minutos || 60;
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao);
            if (!disponibilidade.disponivel) {
                return res.status(409).json({
                    message: 'Horário indisponível',
                    conflitos: disponibilidade.agendamentos
                });
            }
            // 0. Verificar se o serviço requer delegação jurídica
            const catalogoServico = await AdmRepository_1.default.getServiceById(produto_id);
            const requerDelegacao = catalogoServico?.requer_delegacao_juridico || false;
            // 1. Cria o agendamento como PENDENTE no banco
            const agendamentoPendente = {
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor: valor,
                is_euro: false,
                duracao_minutos: duracao,
                status: 'agendado',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                requer_delegacao: requerDelegacao
            };
            const createdAgendamento = await ComercialRepository_1.default.createAgendamento(agendamentoPendente);
            console.log('Agendamento PENDENTE criado no banco:', createdAgendamento.id);
            // 2. Cria a preferência de checkout no MercadoPago
            const MercadoPagoService = (await Promise.resolve().then(() => __importStar(require('../services/MercadoPagoService')))).default;
            const checkout = await MercadoPagoService.createCheckoutPreference({
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor,
                duracao_minutos: duracao,
                usuario_id: usuario_id || undefined,
                cliente_id: cliente_id || undefined,
                agendamento_id: createdAgendamento.id
            });
            console.log('Checkout MercadoPago criado:', checkout.preferenceId);
            // Atualiza com o checkout_url se possível para o cliente ver no dashboard depois
            try {
                await ComercialRepository_1.default.updateAgendamentoCheckoutUrl(createdAgendamento.id, checkout.checkoutUrl);
            }
            catch (err) {
                console.warn('Não foi possível atualizar checkout_url no agendamento:', err);
            }
            return res.status(200).json({
                checkoutUrl: checkout.checkoutUrl,
                preferenceId: checkout.preferenceId,
                agendamentoId: createdAgendamento.id,
                message: 'Agendamento reservado. Aguardando pagamento.'
            });
        }
        catch (error) {
            console.error('Erro ao criar checkout MercadoPago:', error);
            return res.status(500).json({
                message: 'Erro ao criar checkout',
                error: error.message
            });
        }
        finally {
            console.log('========================================================');
        }
    }
    /**
     * Cria sessão de checkout do Stripe e retorna o link
     */
    async createAgendamentoStripe(req, res) {
        console.log('========== CREATE STRIPE CHECKOUT DEBUG ==========');
        try {
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, isEuro, usuario_id, cliente_id } = req.body;
            if (!nome || !email || !telefone || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
            }
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`;
            const duracao = duracao_minutos || 60;
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao);
            if (!disponibilidade.disponivel) {
                return res.status(409).json({ message: 'Horário indisponível' });
            }
            // 0. Verificar se o serviço requer delegação jurídica
            const catalogoServico = await AdmRepository_1.default.getServiceById(produto_id);
            const requerDelegacao = catalogoServico?.requer_delegacao_juridico || false;
            const agendamentoPendente = {
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor,
                is_euro: isEuro ?? true,
                duracao_minutos: duracao,
                status: 'agendado',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                requer_delegacao: requerDelegacao
            };
            const createdAgendamento = await ComercialRepository_1.default.createAgendamento(agendamentoPendente);
            const StripeService = (await Promise.resolve().then(() => __importStar(require('../services/StripeService')))).default;
            const checkout = await StripeService.createCheckoutSession({
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor: Math.round(valor * 100),
                duracao_minutos: duracao,
                isEuro: isEuro ?? true,
                usuario_id: usuario_id || undefined,
                cliente_id: cliente_id || undefined,
                agendamento_id: createdAgendamento.id
            });
            try {
                await ComercialRepository_1.default.updateAgendamentoCheckoutUrl(createdAgendamento.id, checkout.checkoutUrl);
            }
            catch (err) {
                console.warn('Erro ao salvar checkout_url stripe:', err);
            }
            return res.status(200).json({
                checkoutUrl: checkout.checkoutUrl,
                sessionId: checkout.sessionId,
                agendamentoId: createdAgendamento.id
            });
        }
        catch (error) {
            console.error('Erro ao criar checkout Stripe:', error);
            return res.status(500).json({ message: 'Erro ao criar checkout' });
        }
    }
    /**
     * Regenera um checkout para um agendamento existente
     */
    async regenerateCheckout(req, res) {
        try {
            const { id } = req.params;
            const agendamento = await ComercialRepository_1.default.getAgendamentoById(id);
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' });
            }
            if (agendamento.status !== 'agendado') {
                return res.status(400).json({ message: 'Este agendamento já foi processado ou cancelado.' });
            }
            // Assume o valor salvo no banco ou o que veio na criação
            const valor = agendamento.valor || 0;
            const isEuro = agendamento.is_euro !== false; // Default true se não especificado
            let checkoutUrl = '';
            if (isEuro) {
                const StripeService = (await Promise.resolve().then(() => __importStar(require('../services/StripeService')))).default;
                const checkout = await StripeService.createCheckoutSession({
                    nome: agendamento.nome,
                    email: agendamento.email,
                    telefone: agendamento.telefone,
                    data_hora: agendamento.data_hora,
                    produto_id: agendamento.produto_id,
                    produto_nome: agendamento.produto_nome || 'Consultoria',
                    valor: Math.round(valor * 100),
                    duracao_minutos: agendamento.duracao_minutos,
                    isEuro: true,
                    agendamento_id: agendamento.id
                });
                checkoutUrl = checkout.checkoutUrl;
            }
            else {
                const MercadoPagoService = (await Promise.resolve().then(() => __importStar(require('../services/MercadoPagoService')))).default;
                const checkout = await MercadoPagoService.createCheckoutPreference({
                    nome: agendamento.nome,
                    email: agendamento.email,
                    telefone: agendamento.telefone,
                    data_hora: agendamento.data_hora,
                    produto_id: agendamento.produto_id,
                    produto_nome: agendamento.produto_nome || 'Consultoria',
                    valor: valor,
                    duracao_minutos: agendamento.duracao_minutos,
                    agendamento_id: agendamento.id
                });
                checkoutUrl = checkout.checkoutUrl;
            }
            // Salva o novo link
            await ComercialRepository_1.default.updateAgendamentoCheckoutUrl(id, checkoutUrl);
            return res.status(200).json({ checkoutUrl });
        }
        catch (error) {
            console.error('Erro ao regenerar checkout:', error);
            return res.status(500).json({ message: 'Erro ao gerar novo link de pagamento' });
        }
    }
    /**
     * Processa o webhook do Stripe para confirmar agendamento após o pagamento
     */
    async handleStripeWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const StripeService = (await Promise.resolve().then(() => __importStar(require('../services/StripeService')))).default;
        let event;
        try {
            // req.body deve ser o RAW body para validação da assinatura
            event = StripeService.validateWebhookSignature(req.body, sig);
        }
        catch (err) {
            console.error('Erro na validação do Webhook Stripe:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const metadata = session.metadata;
                if (metadata && metadata.tipo === 'agendamento') {
                    try {
                        console.log('========== STRIPE WEBHOOK AGENDAMENTO DEBUG ==========');
                        console.log('Metadata recebido do Stripe:', metadata);
                        const status = 'aprovado'; // Pagamento confirmado para o cliente
                        const agendamentoId = metadata.agendamento_id;
                        if (agendamentoId) {
                            console.log('Atualizando agendamento existente:', agendamentoId);
                            await ComercialRepository_1.default.updateAgendamentoStatus(agendamentoId, status);
                        }
                        else {
                            // Fallback caso não tenha o ID (legado ou erro)
                            console.log('ID não encontrado no metadata, criando novo agendamento...');
                            const agendamento = {
                                nome: metadata.nome,
                                email: metadata.email,
                                telefone: metadata.telefone,
                                data_hora: metadata.data_hora,
                                produto_id: metadata.produto_id,
                                duracao_minutos: parseInt(metadata.duracao_minutos) || 60,
                                status: status,
                                usuario_id: metadata.usuario_id && metadata.usuario_id !== '' ? metadata.usuario_id : null,
                                cliente_id: metadata.cliente_id && metadata.cliente_id !== '' ? metadata.cliente_id : null
                            };
                            await ComercialRepository_1.default.createAgendamento(agendamento);
                        }
                        console.log('Agendamento processado com sucesso via Webhook Stripe');
                    }
                    catch (error) {
                        console.error('Erro ao processar agendamento via Webhook Stripe:', error);
                        return res.status(500).json({ message: 'Erro ao processar agendamento' });
                    }
                    finally {
                        console.log('========================================================');
                    }
                }
                else if (metadata && metadata.tipo === 'orcamento') {
                    try {
                        const documentoIds = metadata.documentoIds?.split(',') || [];
                        console.log('Pagamento Stripe confirmado para orçamentos:', documentoIds);
                        const TraducoesRepository = (await Promise.resolve().then(() => __importStar(require('../repositories/TraducoesRepository')))).default;
                        for (const docId of documentoIds) {
                            const orcamento = await TraducoesRepository.getOrcamentoByDocumento(docId);
                            if (orcamento) {
                                await TraducoesRepository.aprovarOrcamento(orcamento.id, docId);
                            }
                        }
                        console.log('Orçamentos aprovados com sucesso via Webhook Stripe');
                    }
                    catch (error) {
                        console.error('Erro ao aprovar orçamentos via Webhook Stripe:', error);
                        return res.status(500).json({ message: 'Erro ao processar aprovação de orçamentos' });
                    }
                }
                break;
            }
            default:
                console.log(`Evento Stripe não processado: ${event.type}`);
        }
        // Return a 200 response to acknowledge receipt of the event
        res.json({ received: true });
    }
    async verificarDisponibilidade(data_hora, duracao_minutos) {
        console.log('Verificando disponibilidade para:', data_hora, duracao_minutos);
        // Garante parsing em UTC
        const inicioUTC = data_hora.endsWith('Z') ? data_hora : `${data_hora}Z`;
        const inicio = new Date(inicioUTC);
        const fim = new Date(inicio.getTime() + duracao_minutos * 60000);
        const inicioIso = inicio.toISOString();
        const fimIso = fim.toISOString();
        // Busca agendamentos conflitantes no repository (intervalo fechado no início, aberto no fim)
        const agendamentos = await ComercialRepository_1.default.getAgendamentosByIntervalo(inicioIso, fimIso);
        // Se encontrou algum agendamento, o horário está ocupado
        const disponivel = agendamentos.length === 0;
        console.log('Disponibilidade:', disponivel, 'Conflitos:', agendamentos.length);
        return {
            disponivel,
            agendamentos
        };
    }
    async checkDisponibilidade(req, res) {
        try {
            const { data_hora, duracao_minutos } = req.query;
            if (!data_hora) {
                return res.status(400).json({ message: 'data_hora é obrigatório' });
            }
            const dataHoraIso = data_hora?.endsWith('Z')
                ? data_hora
                : `${data_hora}Z`;
            const resultado = await this.verificarDisponibilidade(dataHoraIso, parseInt(duracao_minutos) || 60);
            return res.status(200).json(resultado);
        }
        catch (error) {
            console.error('Erro ao verificar disponibilidade:', error);
            return res.status(500).json({
                message: 'Erro ao verificar disponibilidade',
                error: error.message
            });
        }
    }
    async getAgendamentosByUsuario(req, res) {
        try {
            const { usuarioId } = req.params;
            if (!usuarioId) {
                return res.status(400).json({ message: 'usuarioId é obrigatório' });
            }
            const agendamentos = await ComercialRepository_1.default.getAgendamentosByUsuario(usuarioId);
            return res.status(200).json({
                message: 'Agendamentos recuperados com sucesso',
                data: agendamentos
            });
        }
        catch (error) {
            console.error('Erro ao buscar agendamentos do usuário:', error);
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos do usuário',
                error: error.message
            });
        }
    }
    async getAgendamentosByData(req, res) {
        try {
            const { data } = req.params;
            if (!data) {
                return res.status(400).json({ message: 'data é obrigatório' });
            }
            const agendamentos = await ComercialRepository_1.default.getAgendamentosByData(data);
            return res.status(200).json(agendamentos);
        }
        catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos',
                error: error.message
            });
        }
    }
    async getAgendamentosByCliente(req, res) {
        try {
            const { clienteId } = req.params;
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' });
            }
            const agendamentos = await ComercialRepository_1.default.getAgendamentosByCliente(clienteId);
            return res.status(200).json(agendamentos);
        }
        catch (error) {
            console.error('Erro ao buscar agendamentos do cliente:', error);
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos do cliente',
                error: error.message
            });
        }
    }
    /**
     * Processa o webhook do MercadoPago para confirmar agendamento
     */
    async handleMercadoPagoWebhook(req, res) {
        console.log('========== MERCADO PAGO WEBHOOK DEBUG ==========');
        const { type, data } = req.body;
        console.log('Evento recebido:', { type, resource: data?.id });
        if (type === 'payment' && data?.id) {
            try {
                const MercadoPagoService = (await Promise.resolve().then(() => __importStar(require('../services/MercadoPagoService')))).default;
                const payment = await MercadoPagoService.getPayment(data.id);
                console.log('Status do pagamento:', payment.status);
                if (payment.status === 'approved' && payment.metadata?.tipo === 'agendamento') {
                    const metadata = payment.metadata;
                    console.log('Metadata recuperado:', metadata);
                    const status = 'aprovado';
                    const agendamentoId = metadata.agendamento_id;
                    if (agendamentoId) {
                        console.log('Atualizando agendamento existente via Mercado Pago:', agendamentoId);
                        await ComercialRepository_1.default.updateAgendamentoStatus(agendamentoId, status);
                    }
                    else {
                        // Fallback
                        const agendamento = {
                            nome: metadata.nome,
                            email: metadata.email,
                            telefone: metadata.telefone,
                            data_hora: metadata.data_hora,
                            produto_id: metadata.produto_id,
                            duracao_minutos: parseInt(metadata.duracao_minutos) || 60,
                            status: status,
                            usuario_id: metadata.usuario_id && metadata.usuario_id !== '' ? metadata.usuario_id : null,
                            cliente_id: metadata.cliente_id && metadata.cliente_id !== '' ? metadata.cliente_id : null
                        };
                        await ComercialRepository_1.default.createAgendamento(agendamento);
                    }
                    console.log('Agendamento confirmado via Mercado Pago');
                }
            }
            catch (error) {
                console.error('Erro no processamento do webhook MercadoPago:', error);
            }
            finally {
                console.log('================================================');
            }
        }
        return res.status(200).send('OK');
    }
}
exports.default = new ComercialController();
