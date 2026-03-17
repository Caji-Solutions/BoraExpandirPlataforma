import { supabase } from '../config/SupabaseClient'
import type { ClienteDTO } from '../types/parceiro';
import ComercialRepository from '../repositories/ComercialRepository';
import AdmRepository from '../repositories/AdmRepository';
import ContratoServicoRepository from '../repositories/ContratoServicoRepository';
import EmailService from '../services/EmailService';


class ComercialController {
    async createAgendamento(req: any, res: any) {
        console.log('========== CREATE AGENDAMENTO DEBUG ==========')
        console.log('Body completo recebido:', req.body)
        try {
            const { nome, email, telefone, data_hora, produto_id, duracao_minutos, status, usuario_id, cliente_id, requer_delegacao, pagamento_status } = req.body

            console.log('IDs recebidos:', { usuario_id, cliente_id })

            // Validação básica
            if (!nome || !email || !telefone || !data_hora || !produto_id) {
                console.error('Campos obrigatórios faltando:', { nome, email, telefone, data_hora, produto_id })
                return res.status(400).json({
                    message: 'Campos obrigatórios: nome, email, telefone, data_hora, produto_id'
                })
            }

            // Normaliza data_hora para UTC (evita falsos negativos na checagem)
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`

            // Verifica disponibilidade do horário
            const duracao = duracao_minutos || 60
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao)
            console.log('Disponibilidade verificada:', disponibilidade)

            if (!disponibilidade.disponivel) {
                return res.status(409).json({
                    message: 'Horário indisponível',
                    conflitos: disponibilidade.agendamentos
                })
            }

            const agendamento = {
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                duracao_minutos: duracao,
                status: status || 'agendado',
                pagamento_status: pagamento_status || 'pendente',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                requer_delegacao: requer_delegacao !== undefined ? requer_delegacao : false
            }

            // Fallback: se o frontend não enviou requer_delegacao, tenta buscar do catálogo
            if (requer_delegacao === undefined && produto_id) {
                try {
                    const servico = await AdmRepository.getServiceById(produto_id)
                    if (servico && servico.requer_delegacao_juridico) {
                        agendamento.requer_delegacao = true;
                        console.log('Fallbakc: requer_delegacao atribuido via catalogo para produto:', produto_id);
                    }
                } catch (err) {
                    console.error('Erro no fallback de requer_delegacao:', err);
                }
            }

            console.log('Objeto agendamento final para envio ao DB:', agendamento)
            const createdData = await ComercialRepository.createAgendamento(agendamento)
            console.log('Agendamento criado com sucesso:', createdData)

            // Verificar se o lead já preencheu o formulário em outro agendamento
            let avisoFormularioPreenchido = false
            try {
                if (email) {
                    const { data: clienteExistente } = await supabase
                        .from('clientes')
                        .select('user_id')
                        .eq('email', email)
                        .maybeSingle()
                    if (clienteExistente?.user_id) avisoFormularioPreenchido = true
                }
                if (!avisoFormularioPreenchido && telefone) {
                    const { data: clientePorTel } = await supabase
                        .from('clientes')
                        .select('user_id')
                        .eq('whatsapp', telefone)
                        .maybeSingle()
                    if (clientePorTel?.user_id) avisoFormularioPreenchido = true
                }
            } catch (checkErr) {
                console.warn('Erro ao verificar formulário preenchido do lead:', checkErr)
            }

            return res.status(201).json({ ...createdData, aviso_formulario_preenchido: avisoFormularioPreenchido })

        } catch (error: any) {
            console.error('Erro ao criar agendamento:', error)
            return res.status(500).json({
                message: 'Erro ao criar agendamento',
                error: error.message
            })
        } finally {
            console.log('================================================')
        }
    }

    /**
     * Cria sessão de checkout do MercadoPago e retorna o link
     * O agendamento será criado pelo webhook após confirmação do pagamento
     */
    async createAgendamentoMercadoPago(req: any, res: any) {
        console.log('========== CREATE MERCADO PAGO CHECKOUT DEBUG ==========')
        console.log('Body recebido:', req.body)
        try {
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, usuario_id, cliente_id } = req.body

            console.log('IDs recebidos:', { usuario_id, cliente_id })

            // Validação básica
            if (!nome || !email || !telefone || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({
                    message: 'Campos obrigatórios: nome, email, telefone, data_hora, produto_id, produto_nome, valor'
                })
            }

            // Normaliza data_hora para UTC
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`

            // Verifica disponibilidade do horário antes de criar o checkout
            const duracao = duracao_minutos || 60
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao)

            if (!disponibilidade.disponivel) {
                return res.status(409).json({
                    message: 'Horário indisponível',
                    conflitos: disponibilidade.agendamentos
                })
            }

            // 0. Verificar se o serviço requer delegação jurídica
            const catalogoServico = await AdmRepository.getServiceById(produto_id)
            const requerDelegacao = catalogoServico?.requer_delegacao_juridico || false

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
            }

            const createdAgendamento = await ComercialRepository.createAgendamento(agendamentoPendente)
            console.log('Agendamento PENDENTE criado no banco:', createdAgendamento.id)

            // 2. Cria a preferência de checkout no MercadoPago
            const MercadoPagoService = (await import('../services/MercadoPagoService')).default
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
            })

            console.log('Checkout MercadoPago criado:', checkout.preferenceId)

            // Atualiza com o checkout_url se possível para o cliente ver no dashboard depois
            try {
                await ComercialRepository.updateAgendamentoCheckoutUrl(createdAgendamento.id, checkout.checkoutUrl)
            } catch (err) {
                console.warn('Não foi possível atualizar checkout_url no agendamento:', err)
            }

            return res.status(200).json({
                checkoutUrl: checkout.checkoutUrl,
                preferenceId: checkout.preferenceId,
                agendamentoId: createdAgendamento.id,
                message: 'Agendamento reservado. Aguardando pagamento.'
            })

        } catch (error: any) {
            console.error('Erro ao criar checkout MercadoPago:', error)
            return res.status(500).json({
                message: 'Erro ao criar checkout',
                error: error.message
            })
        } finally {
            console.log('========================================================')
        }
    }

    /**
     * Atualiza um agendamento existente
     */
    async updateAgendamento(req: any, res: any) {
        console.log('========== UPDATE AGENDAMENTO (PIX) DEBUG ==========')
        try {
            const { id } = req.params
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, usuario_id, cliente_id, metodo_pagamento } = req.body

            if (!nome || !email || !telefone || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({ message: 'Campos obrigatórios ausentes' })
            }

            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`
            const duracao = duracao_minutos || 60

            // Opcional: verificar disponibilidade novamente se a data/hora mudou,
            // mas para simplificar, permitimos a edição por ser uma ação do consultor

            const agendamentoAtualizado = {
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor,
                duracao_minutos: duracao,
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                metodo_pagamento: metodo_pagamento || 'pix'
            }

            const updatedData = await ComercialRepository.updateAgendamentoFull(id, agendamentoAtualizado)

            return res.status(200).json(updatedData)
        } catch (error: any) {
            console.error('Erro ao atualizar agendamento:', error)
            return res.status(500).json({ message: 'Erro ao atualizar agendamento' })
        }
    }

    /**
     * Cria sessão de checkout do Stripe e retorna o link
     */
    async createAgendamentoStripe(req: any, res: any) {
        console.log('========== CREATE STRIPE CHECKOUT DEBUG ==========')
        try {
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, isEuro, usuario_id, cliente_id } = req.body

            if (!nome || !email || !telefone || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({ message: 'Campos obrigatórios ausentes' })
            }

            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`
            const duracao = duracao_minutos || 60
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao)

            if (!disponibilidade.disponivel) {
                return res.status(409).json({ message: 'Horário indisponível' })
            }

            // 0. Verificar se o serviço requer delegação jurídica
            const catalogoServico = await AdmRepository.getServiceById(produto_id)
            const requerDelegacao = catalogoServico?.requer_delegacao_juridico || false

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
            }

            const createdAgendamento = await ComercialRepository.createAgendamento(agendamentoPendente)

            const StripeService = (await import('../services/StripeService')).default
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
            })

            try {
                await ComercialRepository.updateAgendamentoCheckoutUrl(createdAgendamento.id, checkout.checkoutUrl)
            } catch (err) {
                console.warn('Erro ao salvar checkout_url stripe:', err)
            }

            return res.status(200).json({
                checkoutUrl: checkout.checkoutUrl,
                sessionId: checkout.sessionId,
                agendamentoId: createdAgendamento.id
            })

        } catch (error: any) {
            console.error('Erro ao criar checkout Stripe:', error)
            return res.status(500).json({ message: 'Erro ao criar checkout' })
        }
    }

    /**
     * Regenera um checkout para um agendamento existente
     */
    async regenerateCheckout(req: any, res: any) {
        try {
            const { id } = req.params
            const agendamento = await ComercialRepository.getAgendamentoById(id)

            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            if (agendamento.status !== 'agendado') {
                return res.status(400).json({ message: 'Este agendamento já foi processado ou cancelado.' })
            }

            // Assume o valor salvo no banco ou o que veio na criação
            const valor = agendamento.valor || 0
            const isEuro = agendamento.is_euro !== false // Default true se não especificado

            let checkoutUrl = ''

            if (isEuro) {
                const StripeService = (await import('../services/StripeService')).default
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
                })
                checkoutUrl = checkout.checkoutUrl
            } else {
                const MercadoPagoService = (await import('../services/MercadoPagoService')).default
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
                })
                checkoutUrl = checkout.checkoutUrl
            }

            // Salva o novo link
            await ComercialRepository.updateAgendamentoCheckoutUrl(id, checkoutUrl)

            return res.status(200).json({ checkoutUrl })

        } catch (error: any) {
            console.error('Erro ao regenerar checkout:', error)
            return res.status(500).json({ message: 'Erro ao gerar novo link de pagamento' })
        }
    }

    /**
     * Processa o webhook do Stripe para confirmar agendamento após o pagamento
     */
    async handleStripeWebhook(req: any, res: any) {
        const sig = req.headers['stripe-signature']
        const StripeService = (await import('../services/StripeService')).default

        let event

        try {
            // req.body deve ser o RAW body para validação da assinatura
            event = StripeService.validateWebhookSignature(req.body, sig)
        } catch (err: any) {
            console.error('Erro na validação do Webhook Stripe:', err.message)
            return res.status(400).send(`Webhook Error: ${err.message}`)
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any
                const metadata = session.metadata

                if (metadata && metadata.tipo === 'agendamento') {
                    try {
                        console.log('========== STRIPE WEBHOOK AGENDAMENTO DEBUG ==========')
                        console.log('Metadata recebido do Stripe:', metadata)

                        const status = 'aprovado'; // Pagamento confirmado para o cliente
                        const agendamentoId = metadata.agendamento_id;

                        if (agendamentoId) {
                            console.log('Atualizando agendamento existente:', agendamentoId)
                            await ComercialRepository.updateAgendamentoStatus(agendamentoId, status)
                        } else {
                            // Fallback caso não tenha o ID (legado ou erro)
                            console.log('ID não encontrado no metadata, criando novo agendamento...')
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
                            }
                            await ComercialRepository.createAgendamento(agendamento)
                        }

                        console.log('Agendamento processado com sucesso via Webhook Stripe')
                    } catch (error: any) {
                        console.error('Erro ao processar agendamento via Webhook Stripe:', error)
                        return res.status(500).json({ message: 'Erro ao processar agendamento' })
                    } finally {
                        console.log('========================================================')
                    }
                }
                else if (metadata && metadata.tipo === 'orcamento') {
                    try {
                        const documentoIds = metadata.documentoIds?.split(',') || []
                        console.log('Pagamento Stripe confirmado para orçamentos:', documentoIds)

                        const TraducoesRepository = (await import('../repositories/TraducoesRepository')).default

                        for (const docId of documentoIds) {
                            const orcamento = await TraducoesRepository.getOrcamentoByDocumento(docId)
                            if (orcamento) {
                                await TraducoesRepository.aprovarOrcamento(orcamento.id, docId)
                            }
                        }
                        console.log('Orçamentos aprovados com sucesso via Webhook Stripe')
                    } catch (error: any) {
                        console.error('Erro ao aprovar orçamentos via Webhook Stripe:', error)
                        return res.status(500).json({ message: 'Erro ao processar aprovação de orçamentos' })
                    }
                }
                break
            }
            default:
                console.log(`Evento Stripe não processado: ${event.type}`)
        }

        // Return a 200 response to acknowledge receipt of the event
        res.json({ received: true })
    }

    async verificarDisponibilidade(data_hora: string, duracao_minutos: number) {
        console.log('Verificando disponibilidade para:', data_hora, duracao_minutos)

        // Garante parsing em UTC
        const inicioUTC = data_hora.endsWith('Z') ? data_hora : `${data_hora}Z`
        const inicio = new Date(inicioUTC)
        const fim = new Date(inicio.getTime() + duracao_minutos * 60000)

        const inicioIso = inicio.toISOString()
        const fimIso = fim.toISOString()

        // Busca agendamentos conflitantes no repository (intervalo fechado no início, aberto no fim)
        const agendamentos = await ComercialRepository.getAgendamentosByIntervalo(
            inicioIso,
            fimIso
        )

        // Se encontrou algum agendamento, o horário está ocupado
        const disponivel = agendamentos.length === 0

        console.log('Disponibilidade:', disponivel, 'Conflitos:', agendamentos.length)

        return {
            disponivel,
            agendamentos
        }
    }

    async checkDisponibilidade(req: any, res: any) {
        try {
            const { data_hora, duracao_minutos } = req.query

            if (!data_hora) {
                return res.status(400).json({ message: 'data_hora é obrigatório' })
            }

            const dataHoraIso = (data_hora as string)?.endsWith('Z')
                ? (data_hora as string)
                : `${data_hora as string}Z`

            const resultado = await this.verificarDisponibilidade(
                dataHoraIso,
                parseInt(duracao_minutos as string) || 60
            )

            return res.status(200).json(resultado)

        } catch (error: any) {
            console.error('Erro ao verificar disponibilidade:', error)
            return res.status(500).json({
                message: 'Erro ao verificar disponibilidade',
                error: error.message
            })
        }
    }

    async getAgendamentosByUsuario(req: any, res: any) {
        try {
            const { usuarioId } = req.params

            if (!usuarioId) {
                return res.status(400).json({ message: 'usuarioId é obrigatório' })
            }

            const agendamentos = await ComercialRepository.getAgendamentosByUsuario(usuarioId)

            // Buscar informações do catálogo para cada agendamento
            const enrichedAgendamentos = await Promise.all(agendamentos.map(async (agendamento: any) => {
                if (agendamento.produto_id) {
                    try {
                        const serviceInfo = await AdmRepository.getServiceById(agendamento.produto_id)
                        return { ...agendamento, produto: serviceInfo }
                    } catch (e) {
                        console.error(`Erro ao buscar serviço ${agendamento.produto_id}:`, e)
                    }
                }
                return agendamento
            }))

            return res.status(200).json(enrichedAgendamentos)

        } catch (error: any) {
            console.error('Erro ao buscar agendamentos do usuário:', error)
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos do usuário',
                error: error.message
            })
        }
    }

    async getAgendamentosByData(req: any, res: any) {
        try {
            const { data } = req.params

            if (!data) {
                return res.status(400).json({ message: 'data é obrigatório' })
            }

            const agendamentos = await ComercialRepository.getAgendamentosByData(data)

            // Buscar informações do catálogo para cada agendamento
            const enrichedAgendamentos = await Promise.all(agendamentos.map(async (agendamento: any) => {
                if (agendamento.produto_id) {
                    try {
                        const serviceInfo = await AdmRepository.getServiceById(agendamento.produto_id)
                        return { ...agendamento, produto: serviceInfo }
                    } catch (e) {
                        console.error(`Erro ao buscar serviço ${agendamento.produto_id}:`, e)
                    }
                }
                return agendamento
            }))

            return res.status(200).json(enrichedAgendamentos)

        } catch (error: any) {
            console.error('Erro ao buscar agendamentos:', error)
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos',
                error: error.message
            })
        }
    }

    async getAgendamentosByCliente(req: any, res: any) {
        try {
            const { clienteId } = req.params

            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }

            const agendamentos = await ComercialRepository.getAgendamentosByCliente(clienteId)

            // Buscar informações do catálogo para cada agendamento
            const enrichedAgendamentos = await Promise.all(agendamentos.map(async (agendamento: any) => {
                if (agendamento.produto_id) {
                    try {
                        const serviceInfo = await AdmRepository.getServiceById(agendamento.produto_id)
                        return { ...agendamento, produto: serviceInfo }
                    } catch (e) {
                        console.error(`Erro ao buscar serviço ${agendamento.produto_id}:`, e)
                    }
                }
                return agendamento
            }))

            return res.status(200).json(enrichedAgendamentos)

        } catch (error: any) {
            console.error('Erro ao buscar agendamentos do cliente:', error)
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos do cliente',
                error: error.message
            })
        }
    }

    /**
     * Processa o webhook do MercadoPago para confirmar agendamento
     */
    async handleMercadoPagoWebhook(req: any, res: any) {
        console.log('========== MERCADO PAGO WEBHOOK DEBUG ==========')
        const { type, data } = req.body
        console.log('Evento recebido:', { type, resource: data?.id })

        if (type === 'payment' && data?.id) {
            try {
                const MercadoPagoService = (await import('../services/MercadoPagoService')).default
                const payment = await MercadoPagoService.getPayment(data.id)
                console.log('Status do pagamento:', payment.status)

                if (payment.status === 'approved' && payment.metadata?.tipo === 'agendamento') {
                    const metadata = payment.metadata
                    console.log('Metadata recuperado:', metadata)

                    const status = 'aprovado';
                    const agendamentoId = metadata.agendamento_id;

                    if (agendamentoId) {
                        console.log('Atualizando agendamento existente via Mercado Pago:', agendamentoId)
                        await ComercialRepository.updateAgendamentoStatus(agendamentoId, status)
                    } else {
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
                        }
                        await ComercialRepository.createAgendamento(agendamento)
                    }
                    console.log('Agendamento confirmado via Mercado Pago')
                }
            } catch (error: any) {
                console.error('Erro no processamento do webhook MercadoPago:', error)
            } finally {
                console.log('================================================')
            }
        }

        return res.status(200).send('OK')
    }

    /**
     * Confirmação manual de PIX por parte do comercial.
     * Agora apenas marca como 'aguardando_verificacao' — a confirmação real
     * e o envio de SMTP são feitos pelo setor financeiro (FinanceiroController).
     */
    async confirmarPix(req: any, res: any) {
        try {
            const { id } = req.params;

            // 1. Get agendamento
            const agendamento = await ComercialRepository.getAgendamentoById(id);
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' });
            }

            // 2. Verifica se já está confirmado
            if (agendamento.status === 'confirmado' || agendamento.status === 'aprovado') {
                return res.status(400).json({ message: 'Este agendamento já está confirmado.' });
            }

            // 3. Verifica se tem comprovante
            if (!agendamento.comprovante_url) {
                return res.status(400).json({ message: 'É necessário enviar o comprovante antes de confirmar.' });
            }

            // 4. Update status para aguardando_verificacao (financeiro irá aprovar/recusar)
            await ComercialRepository.updateAgendamentoStatus(id, 'aguardando_verificacao');

            // 5. Garantir que pagamento_status esteja como 'pendente' para o financeiro
            const { error: updateError } = await supabase
                .from('agendamentos')
                .update({ pagamento_status: 'em_analise' })
                .eq('id', id);

            if (updateError) {
                console.error('[ComercialController] Erro ao atualizar pagamento_status:', updateError);
            }

            return res.status(200).json({
                success: true,
                message: 'Comprovante enviado para verificação pelo setor financeiro.'
            });

        } catch (error: any) {
            console.error('Erro ao confirmar PIX manualmente:', error);
            return res.status(500).json({ message: 'Erro ao confirmar PIX', error: error.message });
        }
    }

    /**
     * Buscar um agendamento específico por ID
     */
    async getAgendamentoById(req: any, res: any) {
        try {
            const { id } = req.params

            const data = await ComercialRepository.getAgendamentoById(id)

            if (!data) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            // Enriquecer com dados do catálogo
            if (data.produto_id) {
                try {
                    const serviceInfo = await AdmRepository.getServiceById(data.produto_id)
                    data.produto = serviceInfo
                } catch (e) {
                    console.error(`Erro ao buscar serviço ${data.produto_id}:`, e)
                }
            }

            // Enriquecer com dados do formulário
            let formulario_preenchido = false
            try {
                const { data: formEnviado } = await supabase
                    .from('formularios_cliente')
                    .select('id')
                    .eq('agendamento_id', id)
                    .maybeSingle()

                if (formEnviado) {
                    formulario_preenchido = true
                }
            } catch (err) {
                console.warn('Erro ao verificar formulário preenchido:', err)
            }

            return res.status(200).json({
                ...data,
                formulario_preenchido
            })
        } catch (error: any) {
            console.error('Erro ao buscar agendamento por ID:', error)
            return res.status(500).json({ message: 'Erro ao buscar agendamento', error: error.message })
        }
    }

    /**
     * Verifica se o formulário foi preenchido pelo cliente (Lead -> Cadastro)
     */
    async verificarStatusFormulario(req: any, res: any) {
        try {
            const { id } = req.params;

            // 1. Get agendamento
            const agendamento = await ComercialRepository.getAgendamentoById(id);
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' });
            }

            // 2. Verifica se o cliente já virou user_id
            if (agendamento.cliente_id) {
                const { data: cliente, error } = await supabase
                    .from('clientes')
                    .select('user_id')
                    .eq('id', agendamento.cliente_id)
                    .single()

                if (!error && cliente?.user_id) {
                    return res.status(200).json({ preenchido: true })
                }
            }

            // Alternativa: ver se já existe email atrelado à tabela clientes que virou user_id
            if (agendamento.email) {
                const { data: clientePorEmail, error: errEmail } = await supabase
                    .from('clientes')
                    .select('user_id')
                    .eq('email', agendamento.email)
                    .maybeSingle()

                if (!errEmail && clientePorEmail?.user_id) {
                    return res.status(200).json({ preenchido: true })
                }
            }

            return res.status(200).json({ preenchido: false });

        } catch (error: any) {
            console.error('Erro ao verificar status do formulário:', error);
            return res.status(500).json({ preenchido: false, error: error.message });
        }
    }

    async getAllAgendamentos(req: any, res: any) {
        try {
            const agendamentos = await ComercialRepository.getAllAgendamentos()
            return res.status(200).json(agendamentos)
        } catch (error: any) {
            console.error('Erro ao buscar todos os agendamentos:', error)
            return res.status(500).json({
                message: 'Erro ao buscar todos os agendamentos',
                error: error.message
            })
        }
    }

    /**
     * Cancelar um agendamento
     * POST /comercial/agendamento/:id/cancelar
     */
    async cancelarAgendamento(req: any, res: any) {
        try {
            const { id } = req.params

            const agendamento = await ComercialRepository.getAgendamentoById(id)
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            if (agendamento.status === 'cancelado') {
                return res.status(400).json({ message: 'Este agendamento já está cancelado.' })
            }

            if (agendamento.status === 'realizado') {
                return res.status(400).json({ message: 'Não é possível cancelar um agendamento já realizado.' })
            }

            await ComercialRepository.updateAgendamentoStatus(id, 'cancelado')

            console.log(`[ComercialController] Agendamento ${id} cancelado com sucesso.`)

            return res.status(200).json({
                success: true,
                message: 'Agendamento cancelado com sucesso.'
            })

        } catch (error: any) {
            console.error('Erro ao cancelar agendamento:', error)
            return res.status(500).json({ message: 'Erro ao cancelar agendamento', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos
     * Cria contrato para serviÃ§o fixo e envia email com PDF mock
     */
    async createContratoServico(req: any, res: any) {
        try {
            const { cliente_id, servico_id, usuario_id } = req.body

            if (!cliente_id || !servico_id) {
                return res.status(400).json({ message: 'cliente_id e servico_id sÃ£o obrigatÃ³rios' })
            }

            const servico = await AdmRepository.getServiceById(servico_id)
            if (!servico) {
                return res.status(404).json({ message: 'Serviço não encontrado' })
            }

            const servicoTipo = servico.tipo || 'agendavel'
            if (servicoTipo !== 'fixo') {
                return res.status(400).json({ message: 'Serviço não é do tipo fixo' })
            }

            const { data: cliente, error: clienteError } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', cliente_id)
                .single()

            if (clienteError || !cliente) {
                console.error('[ComercialController] Cliente nÃ£o encontrado:', clienteError)
                return res.status(404).json({ message: 'Cliente nÃ£o encontrado' })
            }

            const contratoPayload = {
                cliente_id,
                usuario_id: usuario_id || null,
                servico_id,
                servico_nome: servico.nome || null,
                servico_valor: servico.valor || 0,
                cliente_nome: cliente.nome || null,
                cliente_email: cliente.email || null,
                cliente_telefone: cliente.whatsapp || cliente.telefone || null,
                assinatura_status: 'pendente',
                pagamento_status: 'pendente',
                is_draft: true,
                etapa_fluxo: 1,
                draft_dados: {}
            }

            const contrato = await ContratoServicoRepository.createContrato(contratoPayload)

            let emailEnviado = false
            // Email is now sent via /enviar-assinatura endpoint after generating PDF.

            const contratoCompleto = await ContratoServicoRepository.getContratoById(contrato.id)

            return res.status(201).json({ data: contratoCompleto, is_draft: true })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao criar contrato:', error)
            return res.status(500).json({ message: 'Erro ao criar contrato', error: error.message })
        }
    }

    /**
     * GET /comercial/contratos
     */
    async getContratosServicos(req: any, res: any) {
        try {
            const clienteId = (req.query?.cliente_id || req.query?.clienteId) as string | undefined
            const contratos = await ContratoServicoRepository.getContratos({ clienteId })
            return res.status(200).json({ data: contratos })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao listar contratos:', error)
            return res.status(500).json({ message: 'Erro ao listar contratos', error: error.message })
        }
    }

    /**
     * GET /comercial/contratos/:id
     */
    async getContratoServicoById(req: any, res: any) {
        try {
            const { id } = req.params
            const contrato = await ContratoServicoRepository.getContratoById(id)
            return res.status(200).json({ data: contrato })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao buscar contrato:', error)
            return res.status(500).json({ message: 'Erro ao buscar contrato', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos/:id/upload
     * Upload direto do contrato assinado pelo comercial
     */
    async uploadContratoAssinado(req: any, res: any) {
        try {
            const { id } = req.params
            const { usuario_id } = req.body
            const file = req.file

            if (!file) {
                return res.status(400).json({ message: 'Arquivo do contrato Ã© obrigatÃ³rio' })
            }

            await ContratoServicoRepository.getContratoById(id)

            const timestamp = Date.now()
            const ext = file.originalname.split('.').pop() || 'pdf'
            const filePath = `contratos/${id}/${timestamp}_contrato_assinado.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('documentos')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                })

            if (uploadError) {
                console.error('[ComercialController] Erro no upload do contrato:', uploadError)
                return res.status(500).json({ message: 'Erro ao fazer upload do contrato' })
            }

            const { data: urlData } = supabase.storage
                .from('documentos')
                .getPublicUrl(filePath)

            const updated = await ContratoServicoRepository.updateContrato(id, {
                contrato_assinado_url: urlData.publicUrl,
                contrato_assinado_path: filePath,
                contrato_assinado_nome_original: file.originalname,
                assinatura_status: 'aprovado',
                assinatura_upload_origem: 'comercial',
                assinatura_upload_por: usuario_id || null,
                assinatura_upload_em: new Date().toISOString(),
                assinatura_aprovado_por: usuario_id || null,
                assinatura_aprovado_em: new Date().toISOString(),
                assinatura_recusa_nota: null,
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({ data: updated })
        } catch (error: any) {
            console.error('[ComercialController] Erro no upload do contrato:', error)
            return res.status(500).json({ message: 'Erro ao fazer upload do contrato', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos/:id/aprovar
     */
    async aprovarContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { usuario_id } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato?.contrato_assinado_url) {
                return res.status(400).json({ message: 'Contrato assinado nÃ£o encontrado' })
            }

            const updated = await ContratoServicoRepository.updateContrato(id, {
                assinatura_status: 'aprovado',
                assinatura_aprovado_por: usuario_id || null,
                assinatura_aprovado_em: new Date().toISOString(),
                assinatura_recusa_nota: null,
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({ data: updated })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao aprovar contrato:', error)
            return res.status(500).json({ message: 'Erro ao aprovar contrato', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos/:id/recusar
     */
    async recusarContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { nota } = req.body

            const updated = await ContratoServicoRepository.updateContrato(id, {
                assinatura_status: 'recusado',
                assinatura_recusa_nota: nota || 'Contrato recusado sem observaÃ§Ã£o.',
                assinatura_recusado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({ data: updated })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao recusar contrato:', error)
            return res.status(500).json({ message: 'Erro ao recusar contrato', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos/:id/comprovante
     */
    async uploadComprovanteContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const file = req.file

            if (!file) {
                return res.status(400).json({ message: 'Arquivo do comprovante Ã© obrigatÃ³rio' })
            }

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato nÃ£o encontrado' })
            }

            if (contrato.assinatura_status !== 'aprovado') {
                return res.status(400).json({ message: 'Contrato ainda nÃ£o aprovado' })
            }

            const timestamp = Date.now()
            const ext = file.originalname.split('.').pop() || 'pdf'
            const filePath = `contratos-comprovantes/${id}/${timestamp}_comprovante.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('documentos')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                })

            if (uploadError) {
                console.error('[ComercialController] Erro no upload do comprovante:', uploadError)
                return res.status(500).json({ message: 'Erro ao fazer upload do comprovante' })
            }

            const { data: urlData } = supabase.storage
                .from('documentos')
                .getPublicUrl(filePath)

            const updated = await ContratoServicoRepository.updateContrato(id, {
                pagamento_status: 'em_analise',
                pagamento_comprovante_url: urlData.publicUrl,
                pagamento_comprovante_path: filePath,
                pagamento_comprovante_nome_original: file.originalname,
                pagamento_comprovante_upload_em: new Date().toISOString(),
                pagamento_nota_recusa: null,
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({ data: updated })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao enviar comprovante:', error)
            return res.status(500).json({ message: 'Erro ao enviar comprovante', error: error.message })
        }
    }

    /**
     * PUT /comercial/contratos/:id/draft
     * Atualiza o rascunho do formulário.
     */
    async updateContratoDraft(req: any, res: any) {
        try {
            const { id } = req.params;
            const { etapa_fluxo, draft_dados } = req.body;

            const contrato = await ContratoServicoRepository.getContratoById(id);
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato não encontrado' });
            }
            if (!contrato.is_draft) {
                return res.status(400).json({ message: 'Este contrato já foi finalizado e enviado.' });
            }

            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                etapa_fluxo,
                draft_dados,
                atualizado_em: new Date().toISOString()
            });

            return res.status(200).json({ data: updatedData });
        } catch (error: any) {
            console.error('[ComercialController] Erro ao atualizar draft:', error);
            return res.status(500).json({ message: 'Erro ao atualizar rascunho', error: error.message });
        }
    }

    /**
     * POST /comercial/contratos/:id/gerar-pdf
     * Gera o PDF com base nos dados preenchidos no draft e retorna a URL.
     */
    async gerarContratoPdf(req: any, res: any) {
        try {
            const { id } = req.params;

            const contrato = await ContratoServicoRepository.getContratoById(id);
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato não encontrado' });
            }

            const PdfService = (await import('../services/PdfService')).default;
            
            // Em vez de passar um payload qualquer, você pode extrair do draft_dados
            const pdfUrl = await PdfService.gerarContratoAssessoria(id, contrato.draft_dados);

            if (!pdfUrl) {
                return res.status(500).json({ message: 'Falha ao gerar o PDF do contrato.' });
            }

            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                contrato_gerado_url: pdfUrl,
                atualizado_em: new Date().toISOString()
            });

            return res.status(200).json({ url: pdfUrl, data: updatedData });
        } catch (error: any) {
            console.error('[ComercialController] Erro ao gerar PDF:', error);
            return res.status(500).json({ message: 'Erro ao gerar PDF', error: error.message });
        }
    }

    /**
     * POST /comercial/contratos/:id/enviar-assinatura
     * Finaliza o draft e dispara email.
     */
    async enviarContratoAssinatura(req: any, res: any) {
        try {
            const { id } = req.params;
            const { email } = req.body;

            const contrato = await ContratoServicoRepository.getContratoById(id);
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato não encontrado' });
            }

            const emailDestino = email || contrato.cliente_email;
            if (!emailDestino) {
                return res.status(400).json({ message: 'O e-mail do cliente é obrigatório para enviar o contrato.' });
            }

            // Atualiza contrato para NÃO draft mais
            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                is_draft: false,
                cliente_email: emailDestino, // Se for um novo e-mail passado, atualiza
                assinatura_status: 'pendente',
                atualizado_em: new Date().toISOString()
            });

            // Envia o e-mail
            try {
                const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
                const contratoLink = `${frontendUrl}/cliente/contratos` // Em teoria, pode ter link direto pro Storage do mock

                await EmailService.sendContratoEmail({
                    to: emailDestino,
                    clientName: contrato.cliente_nome || 'Cliente',
                    contratoLink: contrato.contrato_gerado_url || contratoLink,
                    servicoNome: contrato.servico_nome || 'Assessoria'
                })
            } catch (emailError) {
                console.error('[ComercialController] Erro ao enviar email de contrato:', emailError)
                return res.status(500).json({ message: 'Contrato finalizado, mas ocorreu um erro no envio do e-mail.' });
            }

            return res.status(200).json({ message: 'Contrato enviado com sucesso!', data: updatedData });
        } catch (error: any) {
            console.error('[ComercialController] Erro ao enviar para assinatura:', error);
            return res.status(500).json({ message: 'Erro ao enviar para assinatura', error: error.message });
        }
    }

}

export default new ComercialController()

