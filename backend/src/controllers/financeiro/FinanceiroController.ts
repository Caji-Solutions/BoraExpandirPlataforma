import { supabase } from '../../config/SupabaseClient'
import ComercialRepository from '../../repositories/ComercialRepository'
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository'
import NotificationService from '../../services/NotificationService'
import DNAService from '../../services/DNAService'
import TraducoesRepository from '../../repositories/TraducoesRepository'
import FinanceiroDashboardRepository from '../../repositories/FinanceiroDashboardRepository'
import BoletoParcelasRepository from '../../repositories/BoletoParcelasRepository'
import bcrypt from 'bcryptjs'
import { toBrtFromUtc } from '../../utils/dateUtils'
import { normalizeMetodoPagamento } from '../../utils/boletoUtils'

function generatePassword(length = 10): string {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$'
    let password = ''
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
}


class FinanceiroController {
    private async notificarClienteContrato(params: {
        clienteId?: string | null
        titulo: string
        mensagem: string
        tipo?: 'info' | 'success' | 'warning' | 'error' | 'agendamento'
    }) {
        if (!params.clienteId) return
        try {
            await NotificationService.createNotification({
                clienteId: params.clienteId,
                titulo: params.titulo,
                mensagem: params.mensagem,
                tipo: params.tipo || 'info'
            })
        } catch (notificationError) {
            console.error('[FinanceiroController] Erro ao criar notificacao de contrato:', notificationError)
        }
    }

    private getHojeBrt(): string {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date())
    }

    private getParcelaStatusVisual(parcela: any): 'pago' | 'em_analise' | 'recusado' | 'atrasado' | 'pendente' {
        if (parcela.status === 'pago') return 'pago'
        if (parcela.status === 'em_analise') return 'em_analise'
        if (parcela.status === 'recusado') return 'recusado'
        if (parcela.status === 'pendente' && parcela.data_vencimento <= this.getHojeBrt()) return 'atrasado'
        return 'pendente'
    }

    private groupContasReceber(rows: any[]): any[] {
        const grouped = new Map<string, any[]>()
        for (const row of rows) {
            const key = `${row.origem_tipo}:${row.origem_id}`
            if (!grouped.has(key)) grouped.set(key, [])
            grouped.get(key)!.push(row)
        }

        return Array.from(grouped.entries()).map(([key, items]) => {
            const parcelasOrdenadas = [...items].sort((a, b) => String(a.data_vencimento).localeCompare(String(b.data_vencimento)))
            const first = parcelasOrdenadas[0]
            const parcelasMapeadas = parcelasOrdenadas.map((p: any) => ({
                id: p.id,
                numero_parcela: p.numero_parcela,
                quantidade_parcelas: p.quantidade_parcelas,
                valor: Number(p.valor || 0),
                data_vencimento: p.data_vencimento,
                status: p.status,
                status_visual: this.getParcelaStatusVisual(p),
                comprovante_url: p.comprovante_url || null,
                nota_recusa: p.nota_recusa || null
            }))

            const parcelasPagas = parcelasMapeadas.filter((p: any) => p.status === 'pago').length
            const proximaParcela = parcelasMapeadas.find((p: any) => p.status !== 'pago') || null
            const hasAtraso = parcelasMapeadas.some((p: any) => p.status_visual === 'atrasado')
            const hasAnalise = parcelasMapeadas.some((p: any) => p.status_visual === 'em_analise')
            const hasRecusa = parcelasMapeadas.some((p: any) => p.status_visual === 'recusado')

            let statusGeral: 'em_dia' | 'atrasado' | 'em_analise' | 'recusado' = 'em_dia'
            if (hasAtraso) statusGeral = 'atrasado'
            else if (hasRecusa) statusGeral = 'recusado'
            else if (hasAnalise) statusGeral = 'em_analise'

            return {
                id: key,
                origem_tipo: first.origem_tipo,
                origem_id: first.origem_id,
                servico_nome: first.servico_nome || 'Serviço',
                pagador_nome: first.pagador_nome || 'Não informado',
                vendedor_nome: first.vendedor_nome || 'Não informado',
                cliente_id: first.cliente_id || null,
                usuario_id: first.usuario_id || null,
                metodo_pagamento: first.metodo_pagamento || 'boleto',
                quantidade_parcelas: first.quantidade_parcelas || parcelasMapeadas.length,
                parcelas_pagas: parcelasPagas,
                valor_entrada: Number(first.valor_entrada || 0),
                valor_parcela: Number(first.valor_parcela || 0),
                dia_cobranca: first.dia_cobranca,
                proxima_parcela: proximaParcela,
                status_geral: statusGeral,
                parcelas: parcelasMapeadas
            }
        })
    }


    /**
     * GET /financeiro/comprovantes/pendentes
     * Lista todos os agendamentos com comprovante enviado aguardando verificação
     */
    async getComprovantesPendentes(_req: any, res: any) {
        try {
            // 1. Buscar comprovantes de agendamentos
            const { data: agendamentos, error: errorAgend } = await supabase
                .from('agendamentos')
                .select('*')
                .not('comprovante_url', 'is', null)
                .eq('pagamento_status', 'em_analise')
                .order('comprovante_upload_em', { ascending: true })

            if (errorAgend) {
                console.error('[FinanceiroController] Erro ao buscar comprovantes de agendamentos:', errorAgend)
                return res.status(500).json({ message: 'Erro ao buscar comprovantes pendentes' })
            }

            // 2. Buscar comprovantes de traduções (orçamentos)
            const { data: orcamentos, error: errorOrc } = await supabase
                .from('orcamentos')
                .select('*, documentos(id, cliente_id, analisado_por, clientes(nome, email, whatsapp))')
                .eq('status', 'pendente_verificacao')
                .order('atualizado_em', { ascending: true })

            if (errorOrc) {
                console.error('[FinanceiroController] Erro ao buscar comprovantes de traducoes:', errorOrc)
            }

            // Buscar nomes dos tradutores (perfis) em massa
            const analistaIds = [...new Set((orcamentos || []).map((o: any) => o.documentos?.analisado_por).filter(id => !!id))]
            let analistas: any[] = []
            if (analistaIds.length > 0) {
                const { data: analistasData } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', analistaIds)
                analistas = analistasData || []
            }

            // 3. Normalizar dados e agrupar por comprovante_url para orçamentos
            const agendamentosMapeados = (agendamentos || []).map(a => ({
                ...a,
                data_hora: a.data_hora ? toBrtFromUtc(a.data_hora) : a.data_hora,
                tipo_comprovante: 'agendamento'
            }))

            // Agrupar orçamentos por comprovante_url
            const genericOrcamentos = (orcamentos || [])
            const groupedOrcs: Record<string, any[]> = {}
            
            genericOrcamentos.forEach((o: any) => {
                const key = o.comprovante_url || `single_${o.id}`
                if (!groupedOrcs[key]) groupedOrcs[key] = []
                groupedOrcs[key].push(o)
            })

            const traducoesMapeadas = Object.values(groupedOrcs).map((group: any[]) => {
                const o = group[0] // Usar o primeiro como referência do grupo
                const isApostila = group.some(item => item.observacoes?.includes('Apostilamento'))
                const analista = analistas.find(a => a.id === o.documentos?.analisado_por)
                
                // Documentos relacionados no grupo
                const docsRelacionados = group.map(item => ({
                    id: item.id,
                    documento_id: item.documento_id,
                    nome: item.documentos?.clientes?.nome,
                    valor: item.preco_atualizado || item.valor_orcamento,
                    observacoes: item.observacoes
                }))

                const valorTotalGrupo = group.reduce((acc, item) => acc + Number(item.preco_atualizado || item.valor_orcamento || 0), 0)
                const valorTradutorTotal = group.reduce((acc, item) => acc + Number(item.valor_orcamento || 0), 0)

                return {
                    id: o.id,
                    ids_grupo: group.map(item => item.id), // Array de IDs para aprovação em lote
                    nome: o.documentos?.clientes?.nome || 'Cliente Desconhecido',
                    email: o.documentos?.clientes?.email || '',
                    telefone: o.documentos?.clientes?.whatsapp || '',
                    produto_id: o.documento_id,
                    produto_nome: isApostila ? 'Apostila' : 'Tradução',
                    valor: valorTotalGrupo,
                    valor_tradutor: valorTradutorTotal,
                    valor_plataforma: valorTotalGrupo,
                    lucro: valorTotalGrupo - valorTradutorTotal,
                    prazo_entrega: o.prazo_entrega,
                    tradutor_nome: analista?.full_name || 'Não atribuído',
                    data_hora: o.atualizado_em,
                    comprovante_url: o.comprovante_url,
                    comprovante_upload_em: o.atualizado_em,
                    pagamento_status: 'em_analise',
                    status: o.status,
                    tipo_comprovante: 'traducao',
                    observacoes: o.observacoes,
                    docs_relacionados: docsRelacionados
                }
            })

            const allComprovantes = [...agendamentosMapeados, ...traducoesMapeadas]
            // Ordenar por data de envio
            allComprovantes.sort((a: any, b: any) => 
                new Date(a.comprovante_upload_em).getTime() - new Date(b.comprovante_upload_em).getTime()
            )

            return res.status(200).json({
                data: allComprovantes,
                total: allComprovantes.length
            })

        } catch (error: any) {
            console.error('[FinanceiroController] Erro geral:', error)
            return res.status(500).json({ message: 'Erro interno', error: error.message })
        }
    }

    /**
     * POST /financeiro/comprovante/:id/aprovar
     * Aprova o comprovante de pagamento e dispara o fluxo de confirmação (SMTP + setup de conta)
     */
    async aprovarComprovante(req: any, res: any) {
        try {
            const { id } = req.params
            const { verificado_por } = req.body

            // 1. Buscar agendamento
            const agendamento = await ComercialRepository.getAgendamentoById(id)
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            // 2. Verificar se tem comprovante
            if (!agendamento.comprovante_url) {
                return res.status(400).json({ message: 'Este agendamento não possui comprovante enviado.' })
            }

            // 3. Verificar se já foi processado
            if (agendamento.pagamento_status === 'aprovado') {
                return res.status(400).json({ message: 'Este comprovante já foi aprovado.' })
            }

            // 4. Verificar conflito de horário
            let conflitoHorario = false
            try {
                const inicio = new Date(agendamento.data_hora)
                const fim = new Date(inicio.getTime() + (agendamento.duracao_minutos || 60) * 60000)
                
                const { data: conflitos } = await supabase
                    .from('agendamentos')
                    .select('id')
                    .neq('id', id)
                    .in('status', ['agendado', 'confirmado', 'realizado'])
                    .gte('data_hora', inicio.toISOString())
                    .lt('data_hora', fim.toISOString())
                    
                if (conflitos && conflitos.length > 0) {
                    conflitoHorario = true
                    console.log(`[FinanceiroController] Conflito de horario detectado ao aprovar agendamento: ${id}`)
                }
            } catch (err) {
                console.error('[FinanceiroController] Erro ao verificar conflito:', err)
            }

            // 5. Atualizar pagamento_status para aprovado e também a flag de conflito
            const { error: updateError } = await supabase
                .from('agendamentos')
                .update({
                    pagamento_status: 'aprovado',
                    pagamento_verificado_por: verificado_por || null,
                    pagamento_verificado_em: new Date().toISOString(),
                    pagamento_nota_recusa: null,
                    conflito_horario: conflitoHorario
                })
                .eq('id', id)

            if (updateError) {
                console.error('[FinanceiroController] Erro ao atualizar pagamento_status:', updateError)
                return res.status(500).json({ message: 'Erro ao aprovar comprovante' })
            }

            try {
                if (normalizeMetodoPagamento((agendamento as any).metodo_pagamento) === 'boleto') {
                    await BoletoParcelasRepository.ensureParcelasPosEntradaAprovada({
                        origemTipo: 'agendamento',
                        origemId: id,
                        clienteId: agendamento.cliente_id || null,
                        usuarioId: agendamento.usuario_id || null,
                        servicoNome: agendamento.produto_nome || 'Consultoria',
                        pagadorNome: agendamento.nome || null,
                        metodoPagamento: (agendamento as any).metodo_pagamento || 'boleto',
                        valorEntrada: (agendamento as any).boleto_valor_entrada,
                        valorParcela: (agendamento as any).boleto_valor_parcela,
                        quantidadeParcelas: (agendamento as any).boleto_quantidade_parcelas,
                        diaCobranca: (agendamento as any).boleto_dia_cobranca,
                        dataBase: (agendamento as any).created_at || (agendamento as any).criado_em || agendamento.data_hora || new Date().toISOString(),
                        comprovanteUrlEntrada: agendamento.comprovante_url || null,
                        verificadoPor: verificado_por || null,
                        verificadoEm: new Date().toISOString()
                    })

                    await supabase
                        .from('agendamentos')
                        .update({
                            boleto_entrada_aprovada_em: new Date().toISOString(),
                            boleto_ativo: true
                        })
                        .eq('id', id)
                }
            } catch (parcelasError) {
                console.error('[FinanceiroController] Erro ao criar parcelas de boleto (agendamento):', parcelasError)
            }

            // Recalcular comissão do usuário comercial associado ao agendamento
            if (agendamento.usuario_id) {
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('cargo')
                        .eq('id', agendamento.usuario_id)
                        .single()

                    if (profile) {
                        const dataAgend = new Date(agendamento.data_hora)
                        const mes = dataAgend.getMonth() + 1
                        const ano = dataAgend.getFullYear()
                        
                        const ComissaoService = (await import('../../services/ComissaoService')).default
                        await ComissaoService.calcularComissao(agendamento.usuario_id, profile.cargo || 'C1', mes, ano)
                        console.log(`[FinanceiroController] Comissao recalculada para usuario ${agendamento.usuario_id} (Agendamento aprovado)`)
                    }
                } catch (errComissao) {
                    console.error('[FinanceiroController] Erro ao recalcular comissao (Agendamento):', errComissao)
                }
            }

            if (agendamento.cliente_id) {
                const { data: clienteBanco } = await supabase
                    .from('clientes')
                    .select('status')
                    .eq('id', agendamento.cliente_id)
                    .single()
                    
                if (clienteBanco && String(clienteBanco.status).toUpperCase() === 'LEAD') {
                    const { error: clienteUpdateError } = await supabase
                        .from('clientes')
                        .update({ status: 'cliente', atualizado_em: new Date().toISOString() })
                        .eq('id', agendamento.cliente_id)

                    if (clienteUpdateError) {
                        console.error('[FinanceiroController] Erro ao converter lead em cliente (agendamento):', clienteUpdateError)
                    } else {
                        console.log(`[FinanceiroController] Lead convertido em cliente (agendamento aprovado): ${agendamento.cliente_id}`)
                        try {
                            await DNAService.mergeDNA(agendamento.cliente_id, {
                                servico_inicial: agendamento.produto_nome || null
                            }, 'HIGH')
                            console.log(`[FinanceiroController] DNA atualizado com servico_inicial: ${agendamento.produto_nome}`)
                        } catch (dnaErr) {
                            console.error('[FinanceiroController] Erro ao atualizar DNA com servico:', dnaErr)
                        }
                    }
                }
            }

            // 5. Verificar se o formulário já foi preenchido (via formularios_cliente)
            let formularioPreenchido = false
            const { data: formData } = await supabase
                .from('formularios_cliente')
                .select('id')
                .eq('agendamento_id', id)
                .maybeSingle()
            
            if (formData) {
                formularioPreenchido = true
            }

            // 6. Só marca 'confirmado' se pagamento E formulário estiverem OK, e se NÃO houver conflito
            let novoStatus = formularioPreenchido ? 'confirmado' : 'agendado'
            if (conflitoHorario) {
                novoStatus = 'Conflito'
            }
            await ComercialRepository.updateAgendamentoStatus(id, novoStatus)
            console.log(`[FinanceiroController] Status do agendamento atualizado para: ${novoStatus} (formulario: ${formularioPreenchido ? 'sim' : 'nao'})`)

            // 7. Se status virou 'confirmado' (formulario ja preenchido), gera link Meet e dispara email de boas-vindas
            if (novoStatus === 'confirmado') {
                // 7a. Gerar link do Meet se ainda nao existe
                if (!agendamento.meet_link) {
                    try {
                        console.log(`[GoogleMeet] Agendamento ${id} confirmado via Financeiro. Gerando link...`)
                        const ComposioService = (await import('../../services/ComposioService')).default
                        const { getSuperAdminId } = await import('../../utils/calendarHelpers')
                        const superAdminId = await getSuperAdminId()
                        const calendarUserId = superAdminId || 'default'
                        const eventResult = await ComposioService.createCalendarEvent(
                            calendarUserId,
                            {
                                summary: `Consultoria - ${agendamento.nome}`,
                                description: `Consultoria confirmada via PIX.\nTelefone: ${agendamento.telefone}\nEmail: ${agendamento.email}`,
                                startTime: new Date(agendamento.data_hora),
                                endTime: new Date(new Date(agendamento.data_hora).getTime() + (agendamento.duracao_minutos || 60) * 60000),
                                attendees: [agendamento.email],
                                location: 'Google Meet'
                            }
                        )
                        if (eventResult.success && eventResult.eventLink) {
                            await ComercialRepository.updateMeetLink(id, eventResult.eventLink)
                            console.log('[GoogleMeet] Link salvo:', eventResult.eventLink)
                        }
                    } catch (errMeet) {
                        console.error('[GoogleMeet] Erro ao gerar link:', errMeet)
                    }
                }

                // 7b. Disparar email de boas-vindas com novas credenciais de acesso
                if (agendamento.email) {
                    try {
                        // Buscar profile do cliente para obter o user_id
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('id')
                            .ilike('email', agendamento.email)
                            .maybeSingle()

                        if (profileData?.id) {
                            // Gerar nova senha e atualizar o hash no profile
                            const senhaGerada = generatePassword()
                            const salt = await bcrypt.genSalt(10)
                            const password_hash = await bcrypt.hash(senhaGerada, salt)

                            await supabase
                                .from('profiles')
                                .update({ password_hash })
                                .eq('id', profileData.id)

                            const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
                            const EmailService = (await import('../../services/EmailService')).default
                            await EmailService.sendWelcomeEmail({
                                to: agendamento.email,
                                clientName: agendamento.nome || 'Cliente',
                                loginUrl: `${frontendUrl}/login`,
                                email: agendamento.email,
                                senha: senhaGerada
                            })
                            console.log(`[FinanceiroController] Email de boas-vindas enviado para ${agendamento.email}`)
                        } else {
                            console.warn(`[FinanceiroController] Profile nao encontrado para email ${agendamento.email}. Email de boas-vindas nao enviado.`)
                        }
                    } catch (emailError: any) {
                        console.error('[FinanceiroController] Erro ao enviar email de boas-vindas:', emailError)
                    }
                }

                return res.status(200).json({
                    success: true,
                    message: 'Comprovante aprovado e agendamento confirmado! Email de boas-vindas enviado ao cliente.'
                })
            }

            // 8. Formulario ainda nao preenchido: enviar email com link do formulario
            if (!agendamento.email) {
                return res.status(200).json({
                    success: true,
                    message: 'Comprovante aprovado, mas agendamento sem email para envio.'
                })
            }

            try {
                const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
                const params = new URLSearchParams()
                if (agendamento.nome) params.set('nome', agendamento.nome)
                if (agendamento.email) params.set('email', agendamento.email)
                if (agendamento.telefone) params.set('telefone', agendamento.telefone)
                const formularioLink = `${frontendUrl}/formulario/consultoria/${id}?${params.toString()}`

                const EmailService = (await import('../../services/EmailService')).default
                await EmailService.sendFormularioEmail({
                    to: agendamento.email,
                    clientName: agendamento.nome || 'Cliente',
                    formularioLink,
                    email: agendamento.email
                })
                console.log(`[FinanceiroController] Email com link do formulario enviado para ${agendamento.email}`)

                return res.status(200).json({
                    success: true,
                    message: 'Comprovante aprovado e email com formulário enviado com sucesso!',
                    formulario_link: formularioLink
                })
            } catch (emailError: any) {
                console.error('[FinanceiroController] Erro ao enviar email:', emailError)
                return res.status(200).json({
                    success: true,
                    message: 'Comprovante aprovado, mas houve um erro ao enviar o email com formulário.',
                    warning: emailError.message
                })
            }

        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao aprovar comprovante:', error)
            return res.status(500).json({ message: 'Erro ao aprovar comprovante', error: error.message })
        }
    }

    /**
     * POST /financeiro/comprovante/:id/recusar
     * Recusa o comprovante de pagamento com uma nota explicativa
     */
    async recusarComprovante(req: any, res: any) {
        try {
            const { id } = req.params
            const { nota, verificado_por } = req.body

            // 1. Buscar agendamento
            const agendamento = await ComercialRepository.getAgendamentoById(id)
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            // 2. Verificar se tem comprovante
            if (!agendamento.comprovante_url) {
                return res.status(400).json({ message: 'Este agendamento não possui comprovante enviado.' })
            }

            // 3. Atualizar pagamento_status para recusado + nota
            const { error: updateError } = await supabase
                .from('agendamentos')
                .update({
                    pagamento_status: 'recusado',
                    pagamento_nota_recusa: nota || 'Comprovante recusado sem observação.',
                    pagamento_verificado_por: verificado_por || null,
                    pagamento_verificado_em: new Date().toISOString()
                })
                .eq('id', id)

            if (updateError) {
                console.error('[FinanceiroController] Erro ao recusar comprovante:', updateError)
                return res.status(500).json({ message: 'Erro ao recusar comprovante' })
            }

            console.log(`[FinanceiroController] Comprovante recusado para agendamento ${id}. Nota: ${nota}`)

            return res.status(200).json({
                success: true,
                message: 'Comprovante recusado com sucesso. A nota foi registrada.'
            })

        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao recusar comprovante:', error)
            return res.status(500).json({ message: 'Erro ao recusar comprovante', error: error.message })
        }
    }

    /**

     * GET /financeiro/contratos/comprovantes/pendentes
     * Lista contratos com comprovante enviado aguardando verificação
     */
    async getComprovantesContratosPendentes(_req: any, res: any) {
        try {
            const { data, error } = await supabase
                .from('contratos_servicos')
                .select(`
                    *,
                    cliente:clientes(id, nome, email, whatsapp, perfil_unificado),
                    servico:catalogo_servicos(id, nome, valor, tipo)
                `)
                .not('pagamento_comprovante_url', 'is', null)
                .eq('pagamento_status', 'em_analise')
                .order('pagamento_comprovante_upload_em', { ascending: true })

            if (error) {
                console.error('[FinanceiroController] Erro ao buscar comprovantes de contrato:', error)
                return res.status(500).json({ message: 'Erro ao buscar comprovantes de contrato' })
            }

            return res.status(200).json({
                data: data || [],
                total: (data || []).length
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro geral:', error)
            return res.status(500).json({ message: 'Erro interno', error: error.message })
        }
    }

    /**
     * POST /financeiro/contratos/comprovante/:id/aprovar
     */
    async aprovarComprovanteContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { verificado_por } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato não encontrado' })
            }

            if (!contrato.pagamento_comprovante_url) {
                return res.status(400).json({ message: 'Este contrato não possui comprovante enviado.' })
            }

            if (contrato.pagamento_status === 'aprovado') {
                return res.status(400).json({ message: 'Este comprovante já foi aprovado.' })
            }

            const updated = await ContratoServicoRepository.updateContrato(id, {
                pagamento_status: 'aprovado',
                pagamento_verificado_por: verificado_por || null,
                pagamento_verificado_em: new Date().toISOString(),
                pagamento_nota_recusa: null,
                atualizado_em: new Date().toISOString()
            })

            try {
                if (normalizeMetodoPagamento((contrato as any).metodo_pagamento) === 'boleto') {
                    await BoletoParcelasRepository.ensureParcelasPosEntradaAprovada({
                        origemTipo: 'contrato',
                        origemId: id,
                        clienteId: contrato.cliente_id || null,
                        usuarioId: contrato.usuario_id || null,
                        servicoNome: (contrato as any).servico_nome || contrato.servico?.nome || 'Contrato',
                        pagadorNome: (contrato as any).cliente_nome || contrato.cliente?.nome || null,
                        metodoPagamento: (contrato as any).metodo_pagamento || 'boleto',
                        valorEntrada: (contrato as any).boleto_valor_entrada,
                        valorParcela: (contrato as any).boleto_valor_parcela,
                        quantidadeParcelas: (contrato as any).boleto_quantidade_parcelas,
                        diaCobranca: (contrato as any).boleto_dia_cobranca,
                        dataBase: (contrato as any).criado_em || (contrato as any).created_at || new Date().toISOString(),
                        comprovanteUrlEntrada: (contrato as any).pagamento_comprovante_url || null,
                        verificadoPor: verificado_por || null,
                        verificadoEm: new Date().toISOString()
                    })

                    await ContratoServicoRepository.updateContrato(id, {
                        boleto_entrada_aprovada_em: new Date().toISOString(),
                        boleto_ativo: true
                    })
                }
            } catch (parcelasError) {
                console.error('[FinanceiroController] Erro ao criar parcelas de boleto (contrato):', parcelasError)
            }

            // Recalcular comissão do usuário comercial associado ao contrato
            if (contrato.usuario_id) {
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('cargo')
                        .eq('id', contrato.usuario_id)
                        .single()

                    if (profile) {
                        const dataCriacao = new Date(contrato.criado_em || new Date())
                        const mes = dataCriacao.getMonth() + 1
                        const ano = dataCriacao.getFullYear()
                        
                        const ComissaoService = (await import('../../services/ComissaoService')).default
                        await ComissaoService.calcularComissao(contrato.usuario_id, profile.cargo || 'C1', mes, ano)
                        console.log(`[FinanceiroController] Comissao recalculada para usuario ${contrato.usuario_id} (Contrato aprovado)`)
                    }
                } catch (errComissao) {
                    console.error('[FinanceiroController] Erro ao recalcular comissao (Contrato):', errComissao)
                }
            }

            const clienteStatusAtual = String(contrato?.cliente?.status || '').toUpperCase()
            if (clienteStatusAtual === 'LEAD' && contrato.cliente_id) {
                const { error: clienteUpdateError } = await supabase
                    .from('clientes')
                    .update({
                        status: 'cliente',
                        atualizado_em: new Date().toISOString()
                    })
                    .eq('id', contrato.cliente_id)

                if (clienteUpdateError) {
                    console.error('[FinanceiroController] Erro ao converter lead em cliente:', clienteUpdateError)
                } else {
                    try {
                        await DNAService.mergeDNA(contrato.cliente_id, {
                            servico_inicial: (contrato as any).servico_nome || null
                        }, 'HIGH')
                        console.log(`[FinanceiroController] DNA atualizado com servico_inicial: ${(contrato as any).servico_nome}`)
                    } catch (dnaErr) {
                        console.error('[FinanceiroController] Erro ao atualizar DNA com servico:', dnaErr)
                    }
                }
            }

            await this.notificarClienteContrato({
                clienteId: contrato.cliente_id,
                titulo: 'Pagamento aprovado',
                mensagem: 'Seu comprovante foi aprovado. Seu contrato esta confirmado e o processo pode seguir.',
                tipo: 'success'
            })

            return res.status(200).json({
                success: true,
                message: 'Comprovante aprovado com sucesso!',
                data: updated
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao aprovar comprovante de contrato:', error)
            return res.status(500).json({ message: 'Erro ao aprovar comprovante', error: error.message })
        }
    }

    /**
     * POST /financeiro/traducao/comprovante/:id/aprovar
     */
    async aprovarComprovanteTraducao(req: any, res: any) {
        try {
            const { id } = req.params
            const { verificado_por, ids_grupo } = req.body

            // IDs para aprovação (pode ser um grupo ou apenas o ID individual)
            const idsParaAprovar = Array.isArray(ids_grupo) ? ids_grupo : [id]

            // Buscar orçamentos para verificar se existem e se já foram aprovados
            const { data: orcamentos, error: orcError } = await supabase
                .from('orcamentos')
                .select('id, status')
                .in('id', idsParaAprovar)

            if (orcError || !orcamentos || orcamentos.length === 0) {
                return res.status(404).json({ message: 'Orçamento(s) não encontrado(s)' })
            }

            if (orcamentos.some(o => o.status === 'aprovado')) {
                return res.status(400).json({ message: 'Um ou mais orçamentos deste lote já foram aprovados.' })
            }

            // Usar o método existente no repositório para aprovar em lote
            await TraducoesRepository.aprovarOrcamento(idsParaAprovar)

            // Registrar verificador para todos
            await supabase
                .from('orcamentos')
                .update({
                    pagamento_verificado_por: verificado_por || null,
                    pagamento_verificado_em: new Date().toISOString()
                })
                .in('id', idsParaAprovar)

            return res.status(200).json({
                success: true,
                message: idsParaAprovar.length > 1 
                    ? `Lote de ${idsParaAprovar.length} pagamentos aprovado com sucesso!`
                    : 'Pagamento de tradução aprovado com sucesso!'
            })

        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao aprovar comprovante de traducao:', error)

            return res.status(500).json({ message: 'Erro ao aprovar comprovante', error: error.message })
        }
    }

    /**
     * POST /financeiro/contratos/comprovante/:id/recusar
     */
    async recusarComprovanteContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { nota, verificado_por } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato não encontrado' })
            }

            if (!contrato.pagamento_comprovante_url) {
                return res.status(400).json({ message: 'Este contrato não possui comprovante enviado.' })
            }

            const updated = await ContratoServicoRepository.updateContrato(id, {
                pagamento_status: 'recusado',
                pagamento_nota_recusa: nota || 'Comprovante recusado sem observação.',
                pagamento_verificado_por: verificado_por || null,
                pagamento_verificado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            })

            await this.notificarClienteContrato({
                clienteId: contrato.cliente_id,
                titulo: 'Comprovante recusado',
                mensagem: updated.pagamento_nota_recusa || 'Seu comprovante foi recusado. Envie um novo arquivo para continuar.',
                tipo: 'warning'
            })


            return res.status(200).json({
                success: true,
                message: 'Comprovante recusado com sucesso. A nota foi registrada.',
                data: updated
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao recusar comprovante de contrato:', error)
            return res.status(500).json({ message: 'Erro ao recusar comprovante', error: error.message })
        }
    }

    /**
     * POST /financeiro/traducao/comprovante/:id/recusar
     */
    async recusarComprovanteTraducao(req: any, res: any) {
        try {
            const { id } = req.params
            const { nota, verificado_por } = req.body

            // Buscar orçamento
            const { data: orcamento, error: orcError } = await supabase
                .from('orcamentos')
                .select('id, documento_id')
                .eq('id', id)
                .single()

            if (orcError || !orcamento) {
                return res.status(404).json({ message: 'Orçamento não encontrado' })
            }

            // Atualizar status para recusado
            const { error: updateError } = await supabase
                .from('orcamentos')
                .update({
                    status: 'recusado',
                    pagamento_nota_recusa: nota || 'Comprovante recusado sem observação.',
                    pagamento_verificado_por: verificado_por || null,
                    pagamento_verificado_em: new Date().toISOString()
                })
                .eq('id', id)

            if (updateError) {
                console.error('[FinanceiroController] Erro ao recusar comprovante de traducao:', updateError)
                return res.status(500).json({ message: 'Erro ao recusar comprovante' })
            }

            // Voltar o status do documento para que o cliente possa reenviar
            await supabase
                .from('documentos')
                .update({ status: 'WAITING_QUOTE_APPROVAL' })
                .eq('id', orcamento.documento_id)

            return res.status(200).json({
                success: true,
                message: 'Comprovante de tradução recusado com sucesso.'
            })

        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao recusar comprovante de traducao:', error)

            return res.status(500).json({ message: 'Erro ao recusar comprovante', error: error.message })
        }
    }

    /**
     * GET /financeiro/contas-receber
     * Lista processos com parcelas de boleto para "Contas a Receber".
     */
    async getContasReceber(_req: any, res: any) {
        try {
            const rows = await BoletoParcelasRepository.getContasReceber()
            const grouped = this.groupContasReceber(rows)
            return res.status(200).json({
                data: grouped,
                total: grouped.length
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao buscar contas a receber:', error)
            return res.status(500).json({ message: 'Erro ao buscar contas a receber', error: error.message })
        }
    }

    /**
     * GET /financeiro/parcelas/comprovantes/pendentes
     * Lista comprovantes de parcelas (boleto) aguardando validação.
     */
    async getComprovantesParcelasPendentes(_req: any, res: any) {
        try {
            const data = await BoletoParcelasRepository.getParcelasComprovantesPendentes()
            return res.status(200).json({
                data,
                total: data.length
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao buscar comprovantes pendentes de parcelas:', error)
            return res.status(500).json({ message: 'Erro ao buscar comprovantes de parcelas', error: error.message })
        }
    }

    /**
     * POST /financeiro/parcelas/comprovante/:id/aprovar
     */
    async aprovarComprovanteParcela(req: any, res: any) {
        try {
            const { id } = req.params
            const { verificado_por } = req.body

            const parcela = await BoletoParcelasRepository.getParcelaById(id)
            if (!parcela) {
                return res.status(404).json({ message: 'Parcela não encontrada' })
            }

            if (!parcela.comprovante_url) {
                return res.status(400).json({ message: 'Esta parcela não possui comprovante enviado.' })
            }

            if (parcela.status === 'pago') {
                return res.status(400).json({ message: 'Este comprovante de parcela já foi aprovado.' })
            }

            const updated = await BoletoParcelasRepository.updateParcela(id, {
                status: 'pago',
                nota_recusa: null,
                verificado_por: verificado_por || null,
                verificado_em: new Date().toISOString()
            })

            await this.notificarClienteContrato({
                clienteId: updated.cliente_id,
                titulo: 'Parcela aprovada',
                mensagem: `O pagamento da parcela ${updated.numero_parcela}/${updated.quantidade_parcelas} foi aprovado.`,
                tipo: 'success'
            })

            return res.status(200).json({
                success: true,
                message: 'Comprovante da parcela aprovado com sucesso.',
                data: updated
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao aprovar comprovante de parcela:', error)
            return res.status(500).json({ message: 'Erro ao aprovar comprovante da parcela', error: error.message })
        }
    }

    /**
     * POST /financeiro/parcelas/comprovante/:id/recusar
     */
    async recusarComprovanteParcela(req: any, res: any) {
        try {
            const { id } = req.params
            const { nota, verificado_por } = req.body

            const parcela = await BoletoParcelasRepository.getParcelaById(id)
            if (!parcela) {
                return res.status(404).json({ message: 'Parcela não encontrada' })
            }

            if (!parcela.comprovante_url) {
                return res.status(400).json({ message: 'Esta parcela não possui comprovante enviado.' })
            }

            const updated = await BoletoParcelasRepository.updateParcela(id, {
                status: 'recusado',
                nota_recusa: nota || 'Comprovante recusado sem observação.',
                verificado_por: verificado_por || null,
                verificado_em: new Date().toISOString()
            })

            await this.notificarClienteContrato({
                clienteId: updated.cliente_id,
                titulo: 'Comprovante da parcela recusado',
                mensagem: updated.nota_recusa || 'Seu comprovante de parcela foi recusado. Envie um novo arquivo para regularizar o acesso.',
                tipo: 'warning'
            })

            return res.status(200).json({
                success: true,
                message: 'Comprovante da parcela recusado com sucesso.',
                data: updated
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao recusar comprovante de parcela:', error)
            return res.status(500).json({ message: 'Erro ao recusar comprovante da parcela', error: error.message })
        }
    }
    // =============================================
    // MULTAS DE CONTRATOS
    // =============================================

    async registrarMulta(req: any, res: any) {
        try {
            const { id } = req.params
            const { valor } = req.body

            if (!valor || valor <= 0) {
                return res.status(400).json({ message: 'Valor da multa e obrigatorio e deve ser positivo' })
            }

            const updated = await ContratoServicoRepository.updateContrato(id, {
                status_contrato: 'MULTADO',
                multa_valor: valor,
                multa_status: 'pendente',
                atualizado_em: new Date().toISOString()
            })

            // Notificar cliente
            if (updated.cliente_id) {
                await this.notificarClienteContrato({
                    clienteId: updated.cliente_id,
                    titulo: 'Multa Registrada',
                    mensagem: `Uma multa de EUR ${valor} foi registrada para o contrato #${id.substring(0, 8)}. Envie o comprovante de pagamento.`,
                    tipo: 'warning'
                })
            }

            return res.status(200).json({
                message: 'Multa registrada com sucesso',
                data: updated
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao registrar multa:', error)
            return res.status(500).json({ message: 'Erro ao registrar multa', error: error.message })
        }
    }

    async aprovarComprovanteMulta(req: any, res: any) {
        try {
            const { id } = req.params

            const updated = await ContratoServicoRepository.updateContrato(id, {
                multa_status: 'pago',
                atualizado_em: new Date().toISOString()
            })

            if (updated.cliente_id) {
                await this.notificarClienteContrato({
                    clienteId: updated.cliente_id,
                    titulo: 'Comprovante de Multa Aprovado',
                    mensagem: `O comprovante de multa do contrato #${id.substring(0, 8)} foi aprovado.`,
                    tipo: 'success'
                })
            }

            return res.status(200).json({
                message: 'Comprovante de multa aprovado',
                data: updated
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao aprovar comprovante de multa:', error)
            return res.status(500).json({ message: 'Erro ao aprovar comprovante', error: error.message })
        }
    }

    /**
     * GET /financeiro/dashboard/metricas
     * Retorna métricas do dashboard (faturamento, novos clientes, contas receber, comissões)
     */
    async getDashboardMetricas(_req: any, res: any) {
        try {
            const agora = new Date()
            const mes = agora.getMonth() + 1
            const ano = agora.getFullYear()

            const [faturamento, novosClientes, contasReceber, comissoes] = await Promise.all([
                FinanceiroDashboardRepository.getFaturamento(mes, ano),
                FinanceiroDashboardRepository.getNovosClientes(mes, ano),
                FinanceiroDashboardRepository.getContasReceber(),
                FinanceiroDashboardRepository.getComissoes(mes, ano)
            ])

            const resposta = {
                faturamento,
                novos_clientes: novosClientes,
                contas_receber: contasReceber,
                comissoes
            }

            return res.status(200).json(resposta)
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao buscar métricas do dashboard:', error)
            return res.status(500).json({ message: 'Erro ao buscar métricas do dashboard', error: error.message })
        }
    }

    /**
     * GET /financeiro/dashboard/vendedores
     * Retorna ranking de vendedores do mês atual
     */
    async getDashboardVendedores(_req: any, res: any) {
        try {
            const agora = new Date()
            const mes = agora.getMonth() + 1
            const ano = agora.getFullYear()

            const vendedores = await FinanceiroDashboardRepository.getVendedoresRanking(mes, ano)

            const vendedoresMapeados = vendedores.map((v: any) => ({
                id: v.id,
                nome: v.nome,
                vendas: v.vendas,
                meta: null,
                comissao: v.comissao,
                status: v.meta_atingida > 0 ? 'acima' : 'abaixo',
                servico: null
            }))

            return res.status(200).json({ data: vendedoresMapeados })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao buscar ranking de vendedores:', error)
            return res.status(500).json({ message: 'Erro ao buscar ranking de vendedores', error: error.message })
        }
    }

    /**
     * GET /financeiro/titularidades
     * TODO: endpoint em desenvolvimento
     */
    async getTitularidades(_req: any, res: any) {
        try {
            return res.status(200).json({
                data: [],
                message: 'Em desenvolvimento'
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao buscar titularidades:', error)
            return res.status(500).json({ message: 'Erro ao buscar titularidades', error: error.message })
        }
    }
}

export default new FinanceiroController()
