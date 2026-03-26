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
            const { nome, email, telefone, data_hora, produto_id, duracao_minutos, status, usuario_id, cliente_id, requer_delegacao, pagamento_status } = req.body
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
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, usuario_id, cliente_id, metodo_pagamento } = req.body
            const telefoneNormalizado = normalizePhone(telefone)

            if (!nome || !email || !telefoneNormalizado || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({ message: 'Campos obrigatórios ausentes' })
            }

            const dataHoraIso = toUtcFromBrt(data_hora);
            const duracao = duracao_minutos || 60

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
                metodo_pagamento: metodo_pagamento || 'pix',
                conflito_horario: isConflito
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
                    const ComposioService = (await import('../services/ComposioService')).default;
                    const { getSuperAdminId } = await import('../utils/calendarHelpers');
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

            // Resiliência Google Meet: Se tiver link, tenta deletar evento
            if (agendamento.meet_link) {
                try {
                    console.log(`[GoogleMeet] Cancelando evento para agendamento ${id}...`);
                    const ComposioService = (await import('../services/ComposioService')).default;
                    const { getSuperAdminId } = await import('../utils/calendarHelpers');
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
                draft_dados: draftDadosPrefill
            }

            // Incluir subservico se informado
            if (subservico_id) {
                contratoPayload.subservico_id = subservico_id
            }
            if (subservico_nome) {
                contratoPayload.subservico_nome = subservico_nome
            }

            const contrato = await ContratoServicoRepository.createContrato(contratoPayload)

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

                        const updatedData = await ContratoServicoRepository.updateContrato(id, {
                etapa_fluxo: etapaNumerica,
                draft_dados: mergedDraft,
                atualizado_em: new Date().toISOString()
            })

            if (contrato.cliente_id) {
                await DNAService.mergeDNA(contrato.cliente_id, mergedDraft, 'MEDIUM')
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

            const HtmlPdfService = (await import('../services/HtmlPdfService')).default
            const pdfBuffer = await HtmlPdfService.gerarContratoAssessoria(id, contrato.draft_dados)
            
            let pdfUrl = null;
            if (pdfBuffer) {
                const { supabase } = await import('../../config/SupabaseClient');
                const supabasePath = `contratos-pending/${id}_${Date.now()}.pdf`;
                const { error: uploadError } = await supabase.storage.from('contratos').upload(supabasePath, pdfBuffer, { contentType: 'application/pdf' });
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

            const draftSemErro = this.mergeDraftDados(contrato.draft_dados, {})
            if (draftSemErro.__erroGeracao) {
                delete draftSemErro.__erroGeracao
            }

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

                const AutentiqueService = (await import('../services/AutentiqueService')).default
                const autentiqueDoc = await AutentiqueService.createDocumentWithCompanySignature(
                    `Contrato: ${contrato.servico_nome || 'Assessoria'} - ${contrato.cliente_nome || 'Cliente'}`,
                    contratoArquivoUrl,
                    contrato.cliente_nome || 'Cliente',
                    emailDestino
                )

                // Salvar o ID do documento da Autentique na coluna dedicada para rastreio e webhook
                if (autentiqueDoc?.id) {
                    await ContratoServicoRepository.updateContrato(id, {
                        autentique_document_id: autentiqueDoc.id,
                        empresa_assinado_em: new Date().toISOString(),
                        atualizado_em: new Date().toISOString()
                    })
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

            return res.status(200).json({ message: 'Contrato enviado com sucesso!', data: updatedData })
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
}

export default new ComercialController()


