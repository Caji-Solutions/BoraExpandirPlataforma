import { supabase } from '../config/SupabaseClient'
import ComercialRepository from '../repositories/ComercialRepository'
import TraducoesRepository from '../repositories/TraducoesRepository'

class FinanceiroController {

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
                console.error('[FinanceiroController] Erro ao buscar comprovantes de traduções:', errorOrc)
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
                    .in('status', ['agendado', 'confirmado', 'aprovado', 'realizado'])
                    .gte('data_hora', inicio.toISOString())
                    .lt('data_hora', fim.toISOString())
                    
                if (conflitos && conflitos.length > 0) {
                    conflitoHorario = true
                    console.log(`[FinanceiroController] Conflito de horário detectado ao aprovar agendamento: ${id}`)
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

            // 6. Só marca 'confirmado' se pagamento E formulário estiverem OK
            const novoStatus = formularioPreenchido ? 'confirmado' : 'agendado'
            await ComercialRepository.updateAgendamentoStatus(id, novoStatus)
            console.log(`[FinanceiroController] Status do agendamento atualizado para: ${novoStatus} (formulário: ${formularioPreenchido ? 'sim' : 'não'})`)

            // 7. Se formulário ainda não preenchido, enviar email com link do formulário
            if (!agendamento.email) {
                return res.status(200).json({
                    success: true,
                    message: 'Comprovante aprovado, mas agendamento sem email para envio.'
                })
            }

            if (!formularioPreenchido) {
                try {
                    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
                    const params = new URLSearchParams()
                    if (agendamento.nome) params.set('nome', agendamento.nome)
                    if (agendamento.email) params.set('email', agendamento.email)
                    if (agendamento.telefone) params.set('telefone', agendamento.telefone)
                    const formularioLink = `${frontendUrl}/formulario/consultoria/${id}?${params.toString()}`

                    const EmailService = (await import('../services/EmailService')).default
                    await EmailService.sendFormularioEmail({
                        to: agendamento.email,
                        clientName: agendamento.nome || 'Cliente',
                        formularioLink,
                        email: agendamento.email
                    })
                    console.log(`[FinanceiroController] Email com link do formulário enviado para ${agendamento.email}`)

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
            }

            return res.status(200).json({
                success: true,
                message: 'Comprovante aprovado e agendamento confirmado com sucesso!'
            })

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
            console.error('[FinanceiroController] Erro ao aprovar comprovante de tradução:', error)
            return res.status(500).json({ message: 'Erro ao aprovar comprovante', error: error.message })
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
                console.error('[FinanceiroController] Erro ao recusar comprovante de tradução:', updateError)
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
            console.error('[FinanceiroController] Erro ao recusar comprovante de tradução:', error)
            return res.status(500).json({ message: 'Erro ao recusar comprovante', error: error.message })
        }
    }
}

export default new FinanceiroController()
