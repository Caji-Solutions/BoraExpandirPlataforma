import { supabase } from '../../config/SupabaseClient'
import type { ClienteDTO } from '../../types/parceiro';
import ComercialRepository from '../../repositories/ComercialRepository';
import AdmRepository from '../../repositories/AdmRepository';
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository';
import EmailService from '../../services/EmailService';
import NotificationService from '../../services/NotificationService';
import { normalizeCpf, normalizePhone } from '../../utils/normalizers';
import DNAService from '../../services/DNAService';
import { toUtcFromBrt, toBrtFromUtc } from '../../utils/dateUtils';
import {
    clampQuantidadeParcelas,
    getAnchorDayFromDate,
    normalizeMetodoPagamento,
    parseMoneyInput
} from '../../utils/boletoUtils';


class ComercialController {
    private mergeDraftDados(baseDraft: any, incomingDraft: any) {
        const base = (baseDraft && typeof baseDraft === 'object') ? baseDraft : {}
        const incoming = (incomingDraft && typeof incomingDraft === 'object') ? incomingDraft : {}
        return { ...base, ...incoming }
    }

    private buildErroGeracaoDraft(mensagem: string) {
        return {
            ativo: true,
            etapa: 4,
            mensagem,
            ocorrido_em: new Date().toISOString()
        }
    }

    private extractBoletoPayload(input: Record<string, any> = {}, baseDate?: string | Date) {
        const metodo = normalizeMetodoPagamento(input.metodo_pagamento || input.forma_pagamento)
        if (metodo !== 'boleto') {
            return {
                metodo_pagamento: 'pix',
                boleto_ativo: false,
                boleto_valor_entrada: null,
                boleto_valor_parcela: null,
                boleto_quantidade_parcelas: null,
                boleto_dia_cobranca: null
            }
        }

        const valorEntrada = parseMoneyInput(input.boleto_valor_entrada)
        const valorParcela = parseMoneyInput(input.boleto_valor_parcela)
        const quantidadeParcelas = clampQuantidadeParcelas(input.boleto_quantidade_parcelas)
        const diaCobranca = Number(input.boleto_dia_cobranca) || getAnchorDayFromDate(baseDate || new Date())

        return {
            metodo_pagamento: 'boleto',
            boleto_ativo: true,
            boleto_valor_entrada: valorEntrada,
            boleto_valor_parcela: valorParcela,
            boleto_quantidade_parcelas: quantidadeParcelas,
            boleto_dia_cobranca: Math.max(1, Math.min(31, diaCobranca))
        }
    }

    private validateBoletoPayload(payload: {
        metodo_pagamento?: string | null
        boleto_valor_entrada?: number | null
        boleto_valor_parcela?: number | null
        boleto_quantidade_parcelas?: number | null
    }): string | null {
        if (payload.metodo_pagamento !== 'boleto') return null
        if (!payload.boleto_valor_entrada || payload.boleto_valor_entrada <= 0) {
            return 'Valor da entrada do boleto é obrigatório e deve ser maior que zero.'
        }
        if (!payload.boleto_valor_parcela || payload.boleto_valor_parcela <= 0) {
            return 'Valor das parcelas do boleto é obrigatório e deve ser maior que zero.'
        }
        if (!payload.boleto_quantidade_parcelas || payload.boleto_quantidade_parcelas < 1 || payload.boleto_quantidade_parcelas > 3) {
            return 'Quantidade de parcelas do boleto deve estar entre 1 e 3.'
        }
        return null
    }

    private async notificarClienteContrato(params: {
        clienteId?: string | null
        titulo: string
        mensagem: string
        tipo: 'info' | 'success' | 'warning' | 'error' | 'agendamento'
    }) {
        if (!params.clienteId) return
        try {
            await NotificationService.createNotification({
                clienteId: params.clienteId,
                titulo: params.titulo,
                mensagem: params.mensagem,
                tipo: params.tipo
            })
        } catch (notificationError) {
            console.error('[ComercialController] Erro ao criar notificacao de contrato:', notificationError)
        }
    }

    async createAgendamento(req: any, res: any) {
        console.log('========== CREATE AGENDAMENTO DEBUG ==========')
        console.log('Body completo recebido:', req.body)
        try {
            const {
                nome,
                email,
                telefone,
                data_hora,
                produto_id,
                duracao_minutos,
                status,
                usuario_id,
                cliente_id,
                requer_delegacao,
                pagamento_status,
                metodo_pagamento,
                boleto_valor_entrada,
                boleto_valor_parcela,
                boleto_quantidade_parcelas,
                boleto_dia_cobranca
            } = req.body
            const telefoneNormalizado = normalizePhone(telefone)

            console.log('IDs recebidos:', { usuario_id, cliente_id })

            // Validação básica
            if (!nome || !email || !telefoneNormalizado || !data_hora || !produto_id) {
                console.error('Campos obrigatorios faltando:', { nome, email, telefone, data_hora, produto_id })
                return res.status(400).json({
                    message: 'Campos obrigatórios: nome, email, telefone, data_hora, produto_id'
                })
            }

            // Normaliza data_hora assumindo que veio fuso de Brasília
            const dataHoraIso = toUtcFromBrt(data_hora);
            const boletoPayload = this.extractBoletoPayload({
                metodo_pagamento,
                boleto_valor_entrada,
                boleto_valor_parcela,
                boleto_quantidade_parcelas,
                boleto_dia_cobranca
            }, dataHoraIso)
            const boletoValidationError = this.validateBoletoPayload(boletoPayload)
            if (boletoValidationError) {
                return res.status(400).json({ message: boletoValidationError })
            }

            const diaSemana = new Date(dataHoraIso).getDay()
            if (diaSemana === 0 || diaSemana === 6) {
                return res.status(400).json({ message: 'Agendamentos nao sao permitidos em fins de semana.' })
            }

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
                telefone: telefoneNormalizado,
                data_hora: dataHoraIso,
                produto_id,
                duracao_minutos: duracao,
                status: status || 'agendado',
                pagamento_status: pagamento_status || 'pendente',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                requer_delegacao: requer_delegacao !== undefined ? requer_delegacao : false,
                ...boletoPayload
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

            // Atualizar stage do cliente baseado no novo agendamento
            if (cliente_id) {
                try {
                    const [{ data: clienteAtual }, { data: outrosAgendamentos }] = await Promise.all([
                        supabase.from('clientes').select('stage, status').eq('id', cliente_id).single(),
                        supabase.from('agendamentos').select('id').eq('cliente_id', cliente_id).neq('id', createdData.id)
                    ])
                    const isPrimeiroAgendamento = !outrosAgendamentos || outrosAgendamentos.length === 0

                    if (isPrimeiroAgendamento) {
                        // Task 2: Primeiro agendamento com servico fixo -> aguardando_assessoria
                        const { data: servico } = await supabase
                            .from('catalogo_servicos')
                            .select('tipo')
                            .eq('id', produto_id)
                            .single()

                        if (servico?.tipo === 'fixo') {
                            await supabase.from('clientes').update({
                                stage: 'aguardando_assessoria',
                                status: 'aguardando_assessoria'
                            }).eq('id', cliente_id)
                            console.log(`[ComercialController] Cliente ${cliente_id} movido para aguardando_assessoria (servico fixo, primeiro agendamento)`)
                        }
                    } else if (clienteAtual?.stage === 'clientes_c2') {
                        // Task 1: Cliente em pos-consultoria agendou assessoria -> assessoria_andamento
                        await supabase.from('clientes').update({
                            stage: 'assessoria_andamento',
                            status: 'assessoria_andamento'
                        }).eq('id', cliente_id)
                        console.log(`[ComercialController] Cliente ${cliente_id} movido de clientes_c2 para assessoria_andamento`)
                    } else if (clienteAtual?.stage === 'cancelado') {
                        // Task 3: Cliente que havia cancelado criou novo agendamento -> restaurar stage
                        await supabase.from('clientes').update({
                            stage: 'aguardando_consultoria',
                            status: 'aguardando_consultoria'
                        }).eq('id', cliente_id)
                        console.log(`[ComercialController] Cliente ${cliente_id} restaurado de cancelado para aguardando_consultoria`)
                    }
                } catch (stageErr) {
                    console.warn('[ComercialController] Erro ao atualizar stage do cliente apos agendamento:', stageErr)
                }
            }

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
                if (!avisoFormularioPreenchido && telefoneNormalizado) {
                    const { data: clientePorTel } = await supabase
                        .from('clientes')
                        .select('user_id')
                        .eq('whatsapp', telefoneNormalizado)
                        .maybeSingle()
                    if (clientePorTel?.user_id) avisoFormularioPreenchido = true
                }
            } catch (checkErr) {
                console.warn('Erro ao verificar formulario preenchido do lead:', checkErr)
            }

            if (createdData && createdData.data_hora) {
                createdData.data_hora = toBrtFromUtc(createdData.data_hora);
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
     * Atualiza um agendamento existente
     */
    async updateAgendamento(req: any, res: any) {
        console.log('========== UPDATE AGENDAMENTO (PIX) DEBUG ==========')
        try {
            const { id } = req.params
            const {
                nome,
                email,
                telefone,
                data_hora,
                produto_id,
                produto_nome,
                valor,
                duracao_minutos,
                usuario_id,
                cliente_id,
                metodo_pagamento,
                boleto_valor_entrada,
                boleto_valor_parcela,
                boleto_quantidade_parcelas,
                boleto_dia_cobranca
            } = req.body
            const telefoneNormalizado = normalizePhone(telefone)

            if (!nome || !email || !telefoneNormalizado || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({ message: 'Campos obrigatórios ausentes' })
            }

            const dataHoraIso = toUtcFromBrt(data_hora);
            const duracao = duracao_minutos || 60
            const boletoPayload = this.extractBoletoPayload({
                metodo_pagamento,
                boleto_valor_entrada,
                boleto_valor_parcela,
                boleto_quantidade_parcelas,
                boleto_dia_cobranca
            }, dataHoraIso)
            const boletoValidationError = this.validateBoletoPayload(boletoPayload)
            if (boletoValidationError) {
                return res.status(400).json({ message: boletoValidationError })
            }

            // Se a data/hora mudou e o agendamento já tem um meet_link, atualizar o evento no Google Calendar
            const agendamentoAntigo = await ComercialRepository.getAgendamentoById(id);
            const dataMudou = agendamentoAntigo && agendamentoAntigo.data_hora !== dataHoraIso;

            const inicio = new Date(dataHoraIso);
            const fim = new Date(inicio.getTime() + duracao * 60000);

            // Supabase query is used directly as we need to exclude the current id
            const SupabaseClient = (await import('../../config/SupabaseClient')).supabase;
            const { data: conflitos } = await SupabaseClient
                .from('agendamentos')
                .select('id')
                .neq('id', id)
                .in('status', ['agendado', 'confirmado', 'realizado', 'Conflito'])
                .gte('data_hora', inicio.toISOString())
                .lt('data_hora', fim.toISOString());

            const isConflito = conflitos && conflitos.length > 0;

            const agendamentoAtualizado: any = {
                nome,
                email,
                telefone: telefoneNormalizado,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor,
                duracao_minutos: duracao,
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                conflito_horario: isConflito,
                ...boletoPayload
            }

            if (agendamentoAntigo) {
                if (isConflito) {
                    agendamentoAtualizado.status = 'Conflito';
                } else if (agendamentoAntigo.status === 'Conflito') {
                    agendamentoAtualizado.status = agendamentoAntigo.pagamento_status === 'aprovado' ? 'confirmado' : 'agendado';
                }
            }

            const updatedData = await ComercialRepository.updateAgendamentoFull(id, agendamentoAtualizado)

            // Resiliência Google Meet: Se mudou horário e tem link, atualiza
            if (dataMudou && updatedData.meet_link) {
                try {
                    console.log(`[GoogleMeet] Horario alterado para agendamento ${id}. Atualizando evento...`);
                    const ComposioService = (await import('../../services/ComposioService')).default;
                    const { getSuperAdminId } = await import('../../utils/calendarHelpers');
                    const superAdminId = await getSuperAdminId();
                    
                    // Extrair ID do evento da URL do Meet (se possível) ou se tivéssemos salvo o eventId.
                    // Como não salvamos o eventId separadamente, o ideal seria ter salvado.
                    // Se não tivermos o eventId, o UpdateEvent do Composio pode falhar ou precisar de busca.
                    // Por ora, vamos logar a necessidade de update.
                    console.log(`[GoogleMeet] Necessario atualizar evento para ${dataHoraIso}`);
                } catch (err) {
                    console.error('[GoogleMeet] Erro ao tentar atualizar evento:', err);
                }
            }

            if (updatedData && updatedData.data_hora) {
                updatedData.data_hora = toBrtFromUtc(updatedData.data_hora);
            }

            return res.status(200).json(updatedData)
        } catch (error: any) {
            console.error('Erro ao atualizar agendamento:', error)
            return res.status(500).json({ message: 'Erro ao atualizar agendamento' })
        }
    }

    async verificarDisponibilidade(data_hora: string, duracao_minutos: number) {
        console.log('Verificando disponibilidade para:', data_hora, duracao_minutos)

        // Converte a string de entrada assumindo que seja horário de Brasília para consultar no BD
        const inicioIso = toUtcFromBrt(data_hora);

        const diaSemanaDisp = new Date(inicioIso).getDay()
        if (diaSemanaDisp === 0 || diaSemanaDisp === 6) {
            return { disponivel: false, agendamentos: [], motivo: 'fim_de_semana' }
        }

        const inicio = new Date(inicioIso)
        const fim = new Date(inicio.getTime() + duracao_minutos * 60000)

        const fimIso = fim.toISOString().replace('Z', '')

        // Busca agendamentos conflitantes no repository (intervalo fechado no início, aberto no fim)
        const agendamentos = await ComercialRepository.getAgendamentosByIntervalo(
            inicioIso,
            fimIso
        )

        // Se encontrou algum agendamento, o horário está ocupado
        const disponivel = agendamentos.length === 0

        console.log('Disponibilidade:', disponivel, 'Conflitos:', agendamentos.length)

        // Mapear os agendamentos para retornar em horário de Brasília
        const agendamentosMapeados = agendamentos.map(ag => {
            if (ag.data_hora) {
                return { ...ag, data_hora: toBrtFromUtc(ag.data_hora) };
            }
            return ag;
        });

        return {
            disponivel,
            agendamentos: agendamentosMapeados
        }
    }

    async checkDisponibilidade(req: any, res: any) {
        try {
            const { data_hora, duracao_minutos } = req.query

            if (!data_hora) {
                return res.status(400).json({ message: 'data_hora é obrigatório' })
            }

            // Mantemos a data de entrada local, e ela é validada/convertida no verificarDisponibilidade
            const resultado = await this.verificarDisponibilidade(
                data_hora,
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
                const baseAgendamento = { ...agendamento };
                if (baseAgendamento.data_hora) {
                    baseAgendamento.data_hora = toBrtFromUtc(baseAgendamento.data_hora);
                }
                
                if (baseAgendamento.produto_id) {
                    try {
                        const serviceInfo = await AdmRepository.getServiceById(baseAgendamento.produto_id)
                        return { ...baseAgendamento, produto: serviceInfo }
                    } catch (e) {
                        console.error(`Erro ao buscar servico ${baseAgendamento.produto_id}:`, e)
                    }
                }
                return baseAgendamento
            }))

            return res.status(200).json(enrichedAgendamentos)

        } catch (error: any) {
            console.error('Erro ao buscar agendamentos do usuario:', error)
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
                const baseAgendamento = { ...agendamento };
                if (baseAgendamento.data_hora) {
                    baseAgendamento.data_hora = toBrtFromUtc(baseAgendamento.data_hora);
                }

                if (baseAgendamento.produto_id) {
                    try {
                        const serviceInfo = await AdmRepository.getServiceById(baseAgendamento.produto_id)
                        return { ...baseAgendamento, produto: serviceInfo }
                    } catch (e) {
                        console.error(`Erro ao buscar servico ${baseAgendamento.produto_id}:`, e)
                    }
                }
                return baseAgendamento
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
                const baseAgendamento = { ...agendamento };
                if (baseAgendamento.data_hora) {
                    baseAgendamento.data_hora = toBrtFromUtc(baseAgendamento.data_hora);
                }

                if (baseAgendamento.produto_id) {
                    try {
                        const serviceInfo = await AdmRepository.getServiceById(baseAgendamento.produto_id)
                        return { ...baseAgendamento, produto: serviceInfo }
                    } catch (e) {
                        console.error(`Erro ao buscar servico ${baseAgendamento.produto_id}:`, e)
                    }
                }
                return baseAgendamento
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
     * Confirmação manual de PIX por parte do comercial.
     * Agora apenas marca como 'aguardando_verificacao' â€” a confirmação real
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
            if (agendamento.status === 'confirmado') {
                return res.status(400).json({ message: 'Este agendamento já está confirmado.' });
            }

            // 3. Verifica se tem comprovante
            if (!agendamento.comprovante_url) {
                return res.status(400).json({ message: 'Ã‰ necessário enviar o comprovante antes de confirmar.' });
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
                    console.error(`Erro ao buscar servico ${data.produto_id}:`, e)
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
                console.warn('Erro ao verificar formulario preenchido:', err)
            }

            if (data && data.data_hora) {
                data.data_hora = toBrtFromUtc(data.data_hora);
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
            console.error('Erro ao verificar status do formulario:', error);
            return res.status(500).json({ preenchido: false, error: error.message });
        }
    }

    async getAllAgendamentos(req: any, res: any) {
        try {
            const agendamentos = await ComercialRepository.getAllAgendamentos()
            const agendamentosMapeados = agendamentos.map(ag => {
                if (ag.data_hora) {
                    return { ...ag, data_hora: toBrtFromUtc(ag.data_hora) };
                }
                return ag;
            });
            return res.status(200).json(agendamentosMapeados)
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

            // Task 3: Verificar se o cliente tem outros agendamentos ativos. Se nao, marcar como cancelado
            try {
                if (agendamento.cliente_id) {
                    const { data: outrosAgendamentosAtivos } = await supabase
                        .from('agendamentos')
                        .select('id, status')
                        .eq('cliente_id', agendamento.cliente_id)
                        .neq('id', id)
                        .not('status', 'eq', 'cancelado')

                    if (!outrosAgendamentosAtivos || outrosAgendamentosAtivos.length === 0) {
                        await supabase.from('clientes').update({
                            stage: 'cancelado',
                            status: 'cancelado'
                        }).eq('id', agendamento.cliente_id)
                        console.log(`[ComercialController] Cliente ${agendamento.cliente_id} marcado como cancelado (sem outros agendamentos ativos)`)
                    }
                }
            } catch (cancelStageErr) {
                console.warn('[ComercialController] Erro ao atualizar stage do cliente apos cancelamento:', cancelStageErr)
            }

            // Resiliência Google Meet: Se tiver link, tenta deletar evento
            if (agendamento.meet_link) {
                try {
                    console.log(`[GoogleMeet] Cancelando evento para agendamento ${id}...`);
                    const ComposioService = (await import('../../services/ComposioService')).default;
                    const { getSuperAdminId } = await import('../../utils/calendarHelpers');
                    const superAdminId = await getSuperAdminId();
                    
                    // Como não salvamos o eventId, o delete pode precisar de busca ou o eventId deve ser extraído do link
                    // Por ora, logamos a intenção de deletar.
                    console.log(`[GoogleMeet] Intencao de deletar evento do meet_link: ${agendamento.meet_link}`);
                } catch (err) {
                    console.error('[GoogleMeet] Erro ao tentar deletar evento:', err);
                }
            }

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
     * Cria contrato para serviço fixo e envia email com PDF mock
     */
    async createContratoServico(req: any, res: any) {
        try {
            const { cliente_id, servico_id, usuario_id, subservico_id, subservico_nome } = req.body

            if (!cliente_id || !servico_id) {
                return res.status(400).json({ message: 'cliente_id e servico_id são obrigatórios' })
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
                console.error('[ComercialController] Cliente nao encontrado:', clienteError)
                return res.status(404).json({ message: 'Cliente não encontrado' })
            }

            const ultimoContratoMesmoServico = await ContratoServicoRepository.getUltimoContratoComDados(cliente_id, servico_id)
            const ultimoContratoComDados = ultimoContratoMesmoServico
                || await ContratoServicoRepository.getUltimoContratoComDados(cliente_id)
            const ultimoDraftDados =
                ultimoContratoComDados?.draft_dados && typeof ultimoContratoComDados.draft_dados === 'object'
                    ? ultimoContratoComDados.draft_dados
                    : {}

            const clienteTelefoneNormalizado = normalizePhone(cliente.whatsapp || cliente.telefone)
            const clienteCpfNormalizado = normalizeCpf(cliente.cpf || cliente.documento)
            const tipoServicoPadrao = subservico_nome || servico.nome || 'Assessoria de Imigracao'
            const boletoPrefill = this.extractBoletoPayload({
                metodo_pagamento: ultimoDraftDados?.metodo_pagamento || 'pix',
                boleto_valor_entrada: ultimoDraftDados?.boleto_valor_entrada,
                boleto_valor_parcela: ultimoDraftDados?.boleto_valor_parcela,
                boleto_quantidade_parcelas: ultimoDraftDados?.boleto_quantidade_parcelas,
                boleto_dia_cobranca: ultimoDraftDados?.boleto_dia_cobranca
            }, new Date().toISOString())

            const draftDadosPrefill: any = {
                ...ultimoDraftDados,
                nome: ultimoDraftDados?.nome || cliente.nome || '',
                email: ultimoDraftDados?.email || cliente.email || '',
                telefone: ultimoDraftDados?.telefone || clienteTelefoneNormalizado || '',
                documento: ultimoDraftDados?.documento || clienteCpfNormalizado || '',
                endereco: ultimoDraftDados?.endereco || cliente.endereco || '',
                tipo_servico: tipoServicoPadrao
            }

            if (subservico_nome) {
                draftDadosPrefill.subservico_nome = subservico_nome
            }
            if (subservico_id) {
                draftDadosPrefill.subservico_id = subservico_id
            }

            if (draftDadosPrefill.__erroGeracao) {
                delete draftDadosPrefill.__erroGeracao
            }

            const contratoPayload: any = {
                cliente_id,
                usuario_id: usuario_id || null,
                servico_id,
                servico_nome: servico.nome || null,
                servico_valor: servico.valor || 0,
                cliente_nome: cliente.nome || null,
                cliente_email: cliente.email || null,
                cliente_telefone: clienteTelefoneNormalizado,
                assinatura_status: 'pendente',
                pagamento_status: 'pendente',
                is_draft: true,
                etapa_fluxo: 1,
                draft_dados: draftDadosPrefill,
                ...boletoPrefill
            }

            // Incluir subservico se informado
            if (subservico_id) {
                contratoPayload.subservico_id = subservico_id
            }
            if (subservico_nome) {
                contratoPayload.subservico_nome = subservico_nome
            }

            const contrato = await ContratoServicoRepository.createContrato(contratoPayload)

            // Verificar se e o primeiro contrato/produto do cliente
            const { count: totalContratos } = await supabase
                .from('contratos_servicos')
                .select('id', { count: 'exact', head: true })
                .eq('cliente_id', cliente_id)

            // Se for o primeiro contrato (assessoria), pular timeline para aguardando_assessoria
            if ((totalContratos || 0) <= 1) {
                await supabase.from('clientes').update({ stage: 'aguardando_assessoria', status: 'aguardando_assessoria' }).eq('id', cliente_id);
                const { data: processoAtivo } = await supabase
                    .from('processos')
                    .select('id')
                    .eq('cliente_id', cliente_id)
                    .order('criado_em', { ascending: false })
                    .limit(1)
                    .single();
                if (processoAtivo && processoAtivo.id) {
                   await supabase.from('processos').update({ status: 'aguardando_assessoria' }).eq('id', processoAtivo.id);
                }
            }

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
            const usuarioId = (req.query?.usuario_id || req.query?.usuarioId) as string | undefined
            const isDraftRaw = req.query?.isDraft
            const isDraft =
                isDraftRaw === 'true' ? true
                    : isDraftRaw === 'false' ? false
                        : undefined

            const contratos = await ContratoServicoRepository.getContratos({ clienteId, isDraft, usuarioId })
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
                return res.status(400).json({ message: 'Arquivo do contrato é obrigatório' })
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
                return res.status(400).json({ message: 'Contrato assinado não encontrado' })
            }

            const updated = await ContratoServicoRepository.updateContrato(id, {
                assinatura_status: 'aprovado',
                assinatura_aprovado_por: usuario_id || null,
                assinatura_aprovado_em: new Date().toISOString(),
                assinatura_recusa_nota: null,
                atualizado_em: new Date().toISOString()
            })

            await this.notificarClienteContrato({
                clienteId: updated.cliente_id,
                titulo: 'Contrato aprovado',
                mensagem: 'Seu contrato foi aprovado pelo time comercial. Agora voce ja pode enviar o comprovante de pagamento.',
                tipo: 'success'
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
                assinatura_recusa_nota: nota || 'Contrato recusado sem observação.',
                assinatura_recusado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            })

            await this.notificarClienteContrato({
                clienteId: updated.cliente_id,
                titulo: 'Contrato recusado',
                mensagem: updated.assinatura_recusa_nota || 'Seu contrato precisa de ajustes e reenvio.',
                tipo: 'warning'
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
                return res.status(400).json({ message: 'Arquivo do comprovante é obrigatório' })
            }

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato não encontrado' })
            }

            if (contrato.assinatura_status !== 'aprovado') {
                return res.status(400).json({ message: 'Contrato ainda não aprovado' })
            }

            if (!['pendente', 'recusado'].includes(contrato.pagamento_status)) {
                return res.status(409).json({ message: 'Ja existe um comprovante em analise para este contrato.' })
            }

            const lockTimestamp = new Date().toISOString()
            const { data: lockedContrato, error: lockError } = await supabase
                .from('contratos_servicos')
                .update({
                    pagamento_status: 'em_analise',
                    pagamento_nota_recusa: null,
                    pagamento_comprovante_upload_em: lockTimestamp,
                    atualizado_em: lockTimestamp
                })
                .eq('id', id)
                .in('pagamento_status', ['pendente', 'recusado'])
                .select()
                .maybeSingle()

            if (lockError) {
                console.error('[ComercialController] Erro ao reservar upload de comprovante:', lockError)
                return res.status(500).json({ message: 'Erro ao iniciar envio do comprovante' })
            }

            if (!lockedContrato) {
                return res.status(409).json({ message: 'Comprovante ja enviado por outro usuario. Atualize a tela para ver o status.' })
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
                await ContratoServicoRepository.updateContrato(id, {
                    pagamento_status: contrato.pagamento_status,
                    pagamento_nota_recusa: contrato.pagamento_nota_recusa || null,
                    atualizado_em: new Date().toISOString()
                })
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

            await this.notificarClienteContrato({
                clienteId: updated.cliente_id,
                titulo: 'Comprovante recebido',
                mensagem: 'Recebemos seu comprovante e ele esta em analise do financeiro.',
                tipo: 'info'
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
            const { id } = req.params
            const { etapa_fluxo, draft_dados } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato não encontrado' })
            }
            if (!contrato.is_draft) {
                return res.status(400).json({ message: 'Este contrato ja foi finalizado e enviado.' })
            }

            const etapaNumerica = Number(etapa_fluxo || contrato.etapa_fluxo || 1)
            const mergedDraft = this.mergeDraftDados(contrato.draft_dados, draft_dados)
            const incomingDraft = (draft_dados && typeof draft_dados === 'object') ? draft_dados : {}

            if (Object.prototype.hasOwnProperty.call(incomingDraft, 'telefone')) {
                const telefoneNormalizado = normalizePhone(mergedDraft.telefone)
                mergedDraft.telefone = telefoneNormalizado || ''
            }

            const documentoDigits = String(mergedDraft.documento || '').replace(/\D/g, '')
            if (documentoDigits.length === 11) {
                const cpfNormalizado = normalizeCpf(mergedDraft.documento)
                if (cpfNormalizado) {
                    mergedDraft.documento = cpfNormalizado
                }
            }

            let membrosCount: number | undefined = undefined
            if (mergedDraft.dependentes) {
                try {
                    const deps = typeof mergedDraft.dependentes === 'string' 
                        ? JSON.parse(mergedDraft.dependentes) 
                        : mergedDraft.dependentes
                    
                    if (Array.isArray(deps)) {
                        membrosCount = 1 + deps.length
                    }
                } catch (e) {
                    console.error('[ComercialController] Erro ao parear dependentes para membros_count:', e)
                }
            }

            const payloadUpdate: any = {
                etapa_fluxo: etapaNumerica,
                draft_dados: mergedDraft,
                atualizado_em: new Date().toISOString()
            }

            const boletoPayload = this.extractBoletoPayload({
                metodo_pagamento: mergedDraft.metodo_pagamento || mergedDraft.forma_pagamento || mergedDraft.formaPagamento,
                boleto_valor_entrada: mergedDraft.boleto_valor_entrada,
                boleto_valor_parcela: mergedDraft.boleto_valor_parcela,
                boleto_quantidade_parcelas: mergedDraft.boleto_quantidade_parcelas,
                boleto_dia_cobranca: mergedDraft.boleto_dia_cobranca
            }, contrato.criado_em || new Date().toISOString())
            const boletoValidationError = this.validateBoletoPayload(boletoPayload)
            if (boletoValidationError) {
                return res.status(400).json({ message: boletoValidationError })
            }
            Object.assign(payloadUpdate, boletoPayload)

            if (membrosCount !== undefined) {
                payloadUpdate.membros_count = membrosCount
            }

            const updatedData = await ContratoServicoRepository.updateContrato(id, payloadUpdate)

            if (contrato.cliente_id) {
                await DNAService.mergeDNA(contrato.cliente_id, mergedDraft, 'MEDIUM')

                // Salvar CPF, Email e Estado Civil na tabela clientes
                const clienteUpdate: Record<string, any> = {}
                if (mergedDraft.email) clienteUpdate.email = mergedDraft.email
                if (mergedDraft.estado_civil) clienteUpdate.estado_civil = mergedDraft.estado_civil
                const docDigits = String(mergedDraft.documento || '').replace(/\D/g, '')
                if (docDigits.length === 11) clienteUpdate.cpf = docDigits

                if (Object.keys(clienteUpdate).length > 0) {
                    const { supabase } = await import('../../config/SupabaseClient')
                    await supabase.from('clientes').update(clienteUpdate).eq('id', contrato.cliente_id)
                }
            }

            return res.status(200).json({ data: updatedData })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao atualizar draft:', error)
            return res.status(500).json({ message: 'Erro ao atualizar rascunho', error: error.message })
        }
    }
    /**
     * POST /comercial/contratos/:id/gerar-pdf
     * Gera o PDF com base nos dados preenchidos no draft e retorna a URL.
     */
    async gerarContratoPdf(req: any, res: any) {
        const { id } = req.params

        try {
            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato não encontrado' })
            }

            const HtmlPdfService = (await import('../../services/HtmlPdfService')).default
            const pdfResult = await HtmlPdfService.gerarContratoAssessoria(id, contrato.draft_dados)
            
            let pdfUrl = null;
            let totalPages = 1;
            if (pdfResult) {
                totalPages = pdfResult.totalPages;
                const { supabase } = await import('../../config/SupabaseClient');
                const supabasePath = `contratos-pending/${id}_${Date.now()}.pdf`;
                const { error: uploadError } = await supabase.storage.from('contratos').upload(supabasePath, pdfResult.buffer, { contentType: 'application/pdf' });
                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from('contratos').getPublicUrl(supabasePath);
                    pdfUrl = urlData.publicUrl;
                } else {
                    console.error('[ComercialController] Erro no upload para Supabase:', uploadError);
                }
            }

            if (!pdfUrl) {
                const mensagemErro = 'Falha ao gerar o PDF do contrato.'
                const draftComErro = this.mergeDraftDados(contrato.draft_dados, {
                    __erroGeracao: this.buildErroGeracaoDraft(mensagemErro)
                })

                const updatedWithError = await ContratoServicoRepository.updateContrato(id, {
                    etapa_fluxo: 4,
                    draft_dados: draftComErro,
                    atualizado_em: new Date().toISOString()
                })

                return res.status(500).json({ message: mensagemErro, data: updatedWithError })
            }

            const draftSemErro = this.mergeDraftDados(contrato.draft_dados, {
                __pdfTotalPages: totalPages,
                __pdfSignaturePositions: pdfResult?.signaturePositions || null
            })
            if (draftSemErro.__erroGeracao) {
                delete draftSemErro.__erroGeracao
            }

            console.log(`[ComercialController] PDF gerado com ${totalPages} paginas. Posicoes de assinatura calculadas a partir das dimensoes reais do PDF.`)

            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                contrato_gerado_url: pdfUrl,
                etapa_fluxo: 4,
                draft_dados: draftSemErro,
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({ url: pdfUrl, data: updatedData })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao gerar PDF:', error)

            try {
                const contratoAtual = await ContratoServicoRepository.getContratoById(id)
                if (contratoAtual) {
                    const draftComErro = this.mergeDraftDados(contratoAtual.draft_dados, {
                        __erroGeracao: this.buildErroGeracaoDraft(error.message || 'Erro ao gerar PDF')
                    })

                    await ContratoServicoRepository.updateContrato(id, {
                        etapa_fluxo: 4,
                        draft_dados: draftComErro,
                        atualizado_em: new Date().toISOString()
                    })
                }
            } catch (updateError) {
                console.error('[ComercialController] Erro ao registrar falha de geracao:', updateError)
            }

            return res.status(500).json({ message: 'Erro ao gerar PDF', error: error.message })
        }
    }
    /**
     * POST /comercial/contratos/:id/enviar-assinatura
     * Finaliza o draft e dispara email.
     */
    async enviarContratoAssinatura(req: any, res: any) {
        try {
            const { id } = req.params
            const { email } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato não encontrado' })
            }

            const emailDestino = String(email || contrato.cliente_email || '').trim().toLowerCase()
            if (!emailDestino) {
                return res.status(400).json({ message: 'O e-mail do cliente é obrigatório para enviar o contrato.' })
            }

            const erroGeracaoAtivo = contrato?.draft_dados?.__erroGeracao?.ativo === true
            if (erroGeracaoAtivo) {
                return res.status(409).json({ message: 'Este contrato esta bloqueado por erro de geracao. Gere o contrato novamente antes de enviar.' })
            }

            if (!contrato.contrato_gerado_url) {
                return res.status(400).json({ message: 'Gere o contrato antes de enviar para assinatura.' })
            }

            const contratoUrl = String(contrato.contrato_gerado_url || '')
            if (!contratoUrl) {
                return res.status(400).json({ message: 'O contrato atual nao esta gerado. Gere novamente antes de enviar.' })
            }

            // Obter posicoes de assinatura calculadas durante a geracao do PDF
            const savedPositions = contrato?.draft_dados?.__pdfSignaturePositions
            const totalPages = contrato?.draft_dados?.__pdfTotalPages || 1

            let signaturesData: { cliente: { x: number, y: number, z: number }, empresa: { x: number, y: number, z: number } }

            if (savedPositions?.cliente && savedPositions?.empresa) {
                // Usar posicoes calculadas a partir das dimensoes reais do PDF
                signaturesData = savedPositions
            } else {
                // Fallback: coordenadas padrao para A4 (caso o PDF tenha sido gerado antes desta mudanca)
                console.warn('[ComercialController] Posicoes de assinatura nao encontradas no draft, usando fallback A4')
                signaturesData = {
                    cliente: { x: 28.1, y: 10.6, z: totalPages },
                    empresa: { x: 71.9, y: 10.6, z: totalPages }
                }
            }

            const draftSemErro = this.mergeDraftDados(contrato.draft_dados, {})
            if (draftSemErro.__erroGeracao) {
                delete draftSemErro.__erroGeracao
            }

            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                is_draft: false,
                etapa_fluxo: 4,
                draft_dados: draftSemErro,
                cliente_email: emailDestino,
                assinatura_status: 'pendente',
                atualizado_em: new Date().toISOString()
            })

            try {
                const contratoArquivoUrl = updatedData?.contrato_gerado_url || contrato.contrato_gerado_url

                if (!contratoArquivoUrl) {
                    throw new Error('Contrato gerado nao encontrado para envio.')
                }

                console.log(`[ComercialController] Iniciando envio para Autentique do contrato ${id}...`)

                const AutentiqueService = (await import('../../services/AutentiqueService')).default
                const autentiqueDoc = await AutentiqueService.createDocumentWithCompanySignature(
                    `Contrato: ${contrato.servico_nome || 'Assessoria'} - ${contrato.cliente_nome || 'Cliente'}`,
                    contratoArquivoUrl,
                    contrato.cliente_nome || 'Cliente',
                    emailDestino,
                    signaturesData
                )

                // Salvar o ID do documento da Autentique na coluna dedicada para rastreio e webhook
                if (autentiqueDoc?.id) {
                    const updateAutentique: Record<string, any> = {
                        autentique_document_id: autentiqueDoc.id,
                        empresa_assinado_em: new Date().toISOString(),
                        atualizado_em: new Date().toISOString()
                    }

                    // Se a URL do PDF com assinatura da empresa estiver disponivel,
                    // atualizar contrato_gerado_url para que o comercial ja veja o contrato
                    // com a assinatura do Bora Expandir
                    if (autentiqueDoc.signed_file_url) {
                        updateAutentique.contrato_gerado_url = autentiqueDoc.signed_file_url
                        console.log(`[ComercialController] contrato_gerado_url atualizado com PDF assinado pela empresa.`)
                    }

                    await ContratoServicoRepository.updateContrato(id, updateAutentique)
                }

            } catch (authError) {
                console.error('[ComercialController] Erro ao enviar contrato via Autentique:', authError)
                return res.status(500).json({ message: 'Contrato gerado, mas ocorreu um erro no envio para a Autentique.' })
            }

            const clienteStatus = contrato?.cliente?.status || null
            if (clienteStatus && clienteStatus !== 'LEAD') {
                await this.notificarClienteContrato({
                    clienteId: contrato.cliente_id,
                    titulo: 'Novo contrato disponivel para assinatura',
                    mensagem: 'Seu contrato foi gerado e enviado para assinatura. Acesse a area de contratos para acompanhar o status.',
                    tipo: 'info'
                })
            }

            // Re-buscar o contrato atualizado com a URL do PDF assinado pela empresa
            const contratoFinal = await ContratoServicoRepository.getContratoById(id)

            return res.status(200).json({ message: 'Contrato enviado com sucesso!', data: contratoFinal || updatedData })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao enviar para assinatura:', error)
            return res.status(500).json({ message: 'Erro ao enviar para assinatura', error: error.message })
        }
    }

    // =============================================
    // CANCELAMENTO DE CONTRATOS
    // =============================================

    async cancelarContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { motivo } = req.body
            const canceladoPor = req.userId

            if (!motivo) {
                return res.status(400).json({ message: 'Motivo do cancelamento e obrigatorio' })
            }

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato nao encontrado' })
            }

            const updated = await ContratoServicoRepository.updateContrato(id, {
                status_contrato: 'CANCELADO',
                cancelado_por: canceladoPor,
                cancelado_em: new Date().toISOString(),
                motivo_cancelamento: motivo,
                atualizado_em: new Date().toISOString()
            })

            // Notificar financeiro (usando notificacao genérica)
            await this.notificarClienteContrato({
                clienteId: contrato.cliente_id,
                titulo: 'Contrato Cancelado',
                mensagem: `O contrato #${id.substring(0, 8)} foi cancelado. Motivo: ${motivo}`,
                tipo: 'warning'
            })

            return res.status(200).json({
                message: 'Contrato cancelado com sucesso',
                data: updated
            })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao cancelar contrato:', error)
            return res.status(500).json({ message: 'Erro ao cancelar contrato', error: error.message })
        }
    }

    // =============================================
    // UPLOAD COMPROVANTE DE MULTA
    // =============================================

    async uploadComprovanteMulta(req: any, res: any) {
        try {
            const { id } = req.params
            const file = req.file

            if (!file) {
                return res.status(400).json({ message: 'Arquivo e obrigatorio' })
            }

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato nao encontrado' })
            }

            // Upload para Supabase Storage (pasta multas/)
            const filePath = `multas/${id}/${Date.now()}_${file.originalname}`
            const { error: uploadError } = await supabase.storage
                .from('contratos')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                })

            if (uploadError) {
                console.error('[ComercialController] Erro ao fazer upload da multa:', uploadError)
                return res.status(500).json({ message: 'Erro ao fazer upload do comprovante' })
            }

            const { data: publicUrl } = supabase.storage
                .from('contratos')
                .getPublicUrl(filePath)

            const updated = await ContratoServicoRepository.updateContrato(id, {
                multa_comprovante_url: publicUrl.publicUrl,
                multa_upload_em: new Date().toISOString(),
                multa_status: 'comprovante_enviado',
                atualizado_em: new Date().toISOString()
            })

            // Notificar admin/financeiro
            await this.notificarClienteContrato({
                clienteId: contrato.cliente_id,
                titulo: 'Comprovante de Multa Enviado',
                mensagem: `Comprovante de multa para o contrato #${id.substring(0, 8)} foi enviado e aguarda verificacao.`,
                tipo: 'info'
            })

            return res.status(200).json({
                message: 'Comprovante de multa enviado com sucesso',
                data: updated
            })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao upload comprovante de multa:', error)
            return res.status(500).json({ message: 'Erro ao enviar comprovante', error: error.message })
        }
    }

    // GET /comercial/consultorias-count/:clienteId
    async getConsultoriasCount(req: any, res: any) {
        try {
            const { clienteId } = req.params
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId e obrigatorio' })
            }

            const { count, error } = await supabase
                .from('agendamentos')
                .select('id', { count: 'exact', head: true })
                .eq('cliente_id', clienteId)
                .eq('status', 'realizado')

            if (error) throw error

            const totalConsultorias = count || 0
            const valorDesconto = totalConsultorias * 50

            return res.status(200).json({
                data: {
                    total_consultorias: totalConsultorias,
                    valor_desconto: valorDesconto,
                    valor_por_consultoria: 50
                }
            })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao contar consultorias:', error)
            return res.status(500).json({ message: 'Erro ao contar consultorias', error: error.message })
        }
    }

    // GET /comercial/pos-consultoria
    async getPosConsultoria(req: any, res: any) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ message: 'Nao autenticado' });
            }

            const roleFromToken = String(req.user?.role || '').toLowerCase();
            const nivelFromToken = String(req.user?.nivel || req.user?.cargo || '').toUpperCase();
            let roleDb = '';
            let nivelDb = '';
            let setorDb = '';

            // Tentativa 1: profiles (schema mais atual)
            try {
                const { data: profileDb, error: profileDbError } = await supabase
                    .from('profiles')
                    .select('role, nivel, cargo')
                    .eq('id', userId)
                    .single();

                if (!profileDbError && profileDb) {
                    roleDb = String(profileDb.role || '').toLowerCase();
                    nivelDb = String(profileDb.nivel || profileDb.cargo || '').toUpperCase();
                }
            } catch (profileLookupError) {
                console.warn('[ComercialController] Falha ao buscar permissao em profiles (nao critico):', profileLookupError);
            }

            // Tentativa 2: usuarios (schema legado)
            if (!roleDb || !nivelDb) {
                try {
                    const { data: usuarioDb, error: usuarioDbError } = await supabase
                        .from('usuarios')
                        .select('nivel, setor, role')
                        .eq('id', userId)
                        .single();

                    if (!usuarioDbError && usuarioDb) {
                        roleDb = String(usuarioDb.role || '').toLowerCase();
                        nivelDb = String(usuarioDb.nivel || '').toUpperCase();
                        setorDb = String(usuarioDb.setor || '').toLowerCase();
                    }
                } catch (usuariosLookupError) {
                    console.warn('[ComercialController] Falha ao buscar permissao em usuarios (nao critico):', usuariosLookupError);
                }
            }

            const isSuperAdmin = roleFromToken === 'super_admin' || roleDb === 'super_admin';

            const isC2ComercialFromToken =
                nivelFromToken === 'C2' &&
                (roleFromToken === 'comercial' || roleFromToken === 'super_admin');

            const isC2ComercialFromDb =
                nivelDb === 'C2' &&
                (
                    roleDb === 'comercial' ||
                    roleDb === 'super_admin' ||
                    setorDb === 'comercial'
                );

            if (!isSuperAdmin && !isC2ComercialFromToken && !isC2ComercialFromDb) {
                return res.status(403).json({ message: 'Acesso negado: apenas usuarios C2 do setor comercial podem acessar pos-consultoria' });
            }

            const selectAgendamentoBase = 'id, produto_nome, data_hora, criado_em, cliente_id';
            const isMissingColumnError = (error: any, column: string) => {
                const msg = String(error?.message || error?.details || error?.hint || '').toLowerCase();
                const code = String(error?.code || '');
                return code === '42703' || (msg.includes('column') && msg.includes(column.toLowerCase()));
            };

            let agendamentosDoVendedor: any[] = [];
            const queryVendedorId = await supabase
                .from('agendamentos')
                .select(selectAgendamentoBase)
                .eq('vendedor_id', userId)
                .eq('status', 'realizado')
                .order('data_hora', { ascending: false });

            if (queryVendedorId.error && isMissingColumnError(queryVendedorId.error, 'vendedor_id')) {
                const queryUsuarioId = await supabase
                    .from('agendamentos')
                    .select(selectAgendamentoBase)
                    .eq('usuario_id', userId)
                    .eq('status', 'realizado')
                    .order('data_hora', { ascending: false });

                if (queryUsuarioId.error) {
                    console.warn('[ComercialController] Falha ao buscar agendamentos por usuario_id (nao critico):', queryUsuarioId.error);
                } else {
                    agendamentosDoVendedor = queryUsuarioId.data || [];
                }
            } else if (queryVendedorId.error) {
                console.warn('[ComercialController] Falha ao buscar agendamentos por vendedor_id (nao critico):', queryVendedorId.error);
            } else {
                agendamentosDoVendedor = queryVendedorId.data || [];
            }

            let processosDelegados: any[] = [];
            try {
                const { data, error } = await supabase
                    .from('processos')
                    .select('cliente_id')
                    .eq('responsavel_id', userId)
                    .eq('status', 'clientes_c2');

                if (error) {
                    console.warn('[ComercialController] Falha ao buscar processos delegados (nao critico):', error);
                } else {
                    processosDelegados = data || [];
                }
            } catch (processosDelegadosError) {
                console.warn('[ComercialController] Excecao ao buscar processos delegados (nao critico):', processosDelegadosError);
            }

            const clienteIdsDelegados = [...new Set(
                (processosDelegados || [])
                    .map((proc: any) => proc?.cliente_id)
                    .filter(Boolean)
            )];

            let agendamentosDelegados: any[] = [];

            if (clienteIdsDelegados.length > 0) {
                const { data: agDelegados, error: agDelegadosError } = await supabase
                    .from('agendamentos')
                    .select(selectAgendamentoBase)
                    .in('cliente_id', clienteIdsDelegados)
                    .eq('status', 'realizado')
                    .order('data_hora', { ascending: false });

                if (agDelegadosError) {
                    console.warn('[ComercialController] Falha ao buscar agendamentos delegados (nao critico):', agDelegadosError);
                } else {
                    agendamentosDelegados = agDelegados || [];
                }
            }

            const agendamentosUnificadosMap = new Map<string, any>();
            for (const agendamento of [...(agendamentosDoVendedor || []), ...agendamentosDelegados]) {
                if (agendamento?.id && !agendamentosUnificadosMap.has(agendamento.id)) {
                    agendamentosUnificadosMap.set(agendamento.id, agendamento);
                }
            }

            const agendamentosUnificados = Array.from(agendamentosUnificadosMap.values())
                .sort((a: any, b: any) => {
                    const dataA = a?.data_hora ? new Date(a.data_hora).getTime() : 0;
                    const dataB = b?.data_hora ? new Date(b.data_hora).getTime() : 0;
                    return dataB - dataA;
                });

            const clienteIds = [...new Set(
                agendamentosUnificados
                    .map((ag: any) => ag?.cliente_id)
                    .filter(Boolean)
            )];

            const clientesMap = new Map<string, any>();
            if (clienteIds.length > 0) {
                try {
                    const { data: clientesData, error: clientesError } = await supabase
                        .from('clientes')
                        .select('id, client_id, nome, email, whatsapp')
                        .in('id', clienteIds);

                    if (clientesError) {
                        console.warn('[ComercialController] Falha ao buscar dados de clientes (nao critico):', clientesError);
                    } else {
                        for (const cliente of clientesData || []) {
                            if (cliente?.id) clientesMap.set(cliente.id, cliente);
                        }
                    }
                } catch (clientesFetchError) {
                    console.warn('[ComercialController] Excecao ao buscar dados de clientes (nao critico):', clientesFetchError);
                }
            }

            const agendamentosBrt = agendamentosUnificados.map((ag: any) => ({
                ...ag,
                clientes: ag?.cliente_id ? (clientesMap.get(ag.cliente_id) || null) : null,
                data_hora: ag.data_hora ? toBrtFromUtc(ag.data_hora) : ag.data_hora
            }));

            return res.status(200).json({ data: agendamentosBrt });
        } catch (error: any) {
            console.error('Erro ao buscar pos-consultoria:', error);
            return res.status(500).json({ message: 'Erro ao buscar pos-consultoria', error: error.message });
        }
    }
}

export default new ComercialController()


