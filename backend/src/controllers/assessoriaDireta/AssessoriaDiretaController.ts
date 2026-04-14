import { supabase } from '../../config/SupabaseClient'
import NotificationService from '../../services/NotificationService'

/**
 * Maps client stage to assessoria direta status
 */
function mapStageToStatus(stage: string | null): string {
    switch (stage) {
        case 'assessoria_andamento': return 'em_andamento'
        case 'assessoria_finalizada': return 'realizado'
        default: return 'em_espera'
    }
}

/**
 * Parses a currency value from draft_dados (can be number, string with commas, or text like "1000 (mil euros)")
 * Same logic as ComprovantesPage.parseCurrencyValue on the frontend.
 */
function parseCurrencyValue(value: unknown): number {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0
    if (typeof value !== 'string') return 0

    const compact = value.replace(/\s/g, '')
    let normalized = compact
    if (compact.includes('.') && compact.includes(',')) {
        normalized = compact.replace(/\./g, '').replace(',', '.')
    } else if (compact.includes(',') && !compact.includes('.')) {
        normalized = compact.replace(',', '.')
    }

    const match = normalized.match(/-?\d+(?:\.\d+)?/)
    if (!match) return 0

    const parsed = Number(match[0])
    return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Calculates the real contract value from draft_dados, using the same priority
 * as the Financeiro ComprovantesPage.calculateContratoValor:
 * 1. draft_dados.valor_final (if > 0)
 * 2. draft_dados.valor_desconto - draft_dados.valor_consultoria
 * 3. draft_dados.valor_pavao
 * 4. servico_valor (catalog fallback)
 */
function calculateContratoValor(contrato: any): number {
    const dd = contrato?.draft_dados
    const valorFinalDraft = parseCurrencyValue(dd?.valor_final)
    const valorComDesconto = parseCurrencyValue(dd?.valor_desconto)
    const valorTabela = parseCurrencyValue(dd?.valor_pavao)
    const valorServico = parseCurrencyValue(contrato?.servico_valor)
    const descontoConsultoria = parseCurrencyValue(dd?.valor_consultoria)

    if (valorFinalDraft > 0) {
        if (descontoConsultoria > 0 && valorComDesconto > 0 && Math.abs(valorFinalDraft - valorComDesconto) < 0.01) {
            return Math.max(valorComDesconto - descontoConsultoria, 0)
        }
        return valorFinalDraft
    }

    if (valorComDesconto > 0 && descontoConsultoria > 0) {
        return Math.max(valorComDesconto - descontoConsultoria, 0)
    }

    return valorComDesconto || valorTabela || valorServico || 0
}

class AssessoriaDiretaController {

    // GET /comercial/assessoria-direta
    // Lists non-schedulable services for the logged-in commercial user
    async getComercial(req: any, res: any) {
        try {
            const userId = req.userId
            if (!userId) {
                return res.status(401).json({ message: 'Usuario nao autenticado' })
            }

            // Fetch contratos_servicos where the linked service is nao_agendavel
            const { data: contratos, error } = await supabase
                .from('contratos_servicos')
                .select(`
                    id,
                    cliente_id,
                    cliente_nome,
                    servico_id,
                    servico_nome,
                    servico_valor,
                    draft_dados,
                    assinatura_status,
                    pagamento_status,
                    criado_em
                `)
                .eq('usuario_id', userId)
                .order('criado_em', { ascending: false })

            if (error) throw error

            // Get all nao_agendavel service IDs
            const { data: servicos, error: servError } = await supabase
                .from('catalogo_servicos')
                .select('id')
                .eq('nao_agendavel', true)
                .eq('tipo', 'fixo')

            if (servError) throw servError

            const naoAgendavelIds = new Set((servicos || []).map((s: any) => s.id))

            // Filter contracts to only those with nao_agendavel services
            // AND assinatura_status = aprovado AND pagamento_status = aprovado
            const filtered = (contratos || []).filter((c: any) =>
                naoAgendavelIds.has(c.servico_id) &&
                c.assinatura_status === 'aprovado' &&
                c.pagamento_status === 'aprovado'
            )

            // Fetch client stages for status mapping
            const clienteIds = [...new Set(filtered.map((c: any) => c.cliente_id).filter(Boolean))]
            let clienteStages: Record<string, string> = {}

            if (clienteIds.length > 0) {
                const { data: clientes } = await supabase
                    .from('clientes')
                    .select('id, stage')
                    .in('id', clienteIds)

                if (clientes) {
                    clienteStages = Object.fromEntries(clientes.map((c: any) => [c.id, c.stage]))
                }
            }

            const result = filtered.map((c: any) => ({
                id: c.id,
                clienteId: c.cliente_id,
                clienteNome: c.cliente_nome || 'Cliente',
                servicoNome: c.servico_nome || 'Servico',
                valor: calculateContratoValor(c),
                status: mapStageToStatus(clienteStages[c.cliente_id] || null),
                criadoEm: c.criado_em,
            }))

            return res.status(200).json({ data: result })
        } catch (error: any) {
            console.error('Erro ao buscar assessorias diretas (comercial):', error)
            return res.status(500).json({ message: 'Erro ao buscar assessorias diretas', error: error.message })
        }
    }

    // GET /juridico/assessoria-direta
    // Lists ALL non-schedulable services (with optional status filter)
    async getJuridico(req: any, res: any) {
        try {
            const { status } = req.query

            // Get all nao_agendavel service IDs
            const { data: servicos, error: servError } = await supabase
                .from('catalogo_servicos')
                .select('id')
                .eq('nao_agendavel', true)
                .eq('tipo', 'fixo')

            if (servError) throw servError

            const naoAgendavelIds = new Set((servicos || []).map((s: any) => s.id))

            if (naoAgendavelIds.size === 0) {
                return res.status(200).json({ data: [] })
            }

            // Fetch all contracts for these services
            const { data: contratos, error } = await supabase
                .from('contratos_servicos')
                .select(`
                    id,
                    cliente_id,
                    cliente_nome,
                    usuario_id,
                    servico_id,
                    servico_nome,
                    servico_valor,
                    draft_dados,
                    assinatura_status,
                    pagamento_status,
                    contrato_assinado_url,
                    criado_em
                `)
                .eq('assinatura_status', 'aprovado')
                .eq('pagamento_status', 'aprovado')
                .order('criado_em', { ascending: false })

            if (error) throw error

            const filtered = (contratos || []).filter((c: any) => naoAgendavelIds.has(c.servico_id))

            // Fetch client stages
            const clienteIds = [...new Set(filtered.map((c: any) => c.cliente_id).filter(Boolean))]
            let clienteStages: Record<string, string> = {}

            if (clienteIds.length > 0) {
                const { data: clientes } = await supabase
                    .from('clientes')
                    .select('id, stage')
                    .in('id', clienteIds)

                if (clientes) {
                    clienteStages = Object.fromEntries(clientes.map((c: any) => [c.id, c.stage]))
                }
            }

            // Fetch commercial user names
            const usuarioIds = [...new Set(filtered.map((c: any) => c.usuario_id).filter(Boolean))]
            let usuarioNomes: Record<string, string> = {}

            if (usuarioIds.length > 0) {
                const { data: usuarios } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', usuarioIds)

                if (usuarios) {
                    usuarioNomes = Object.fromEntries(usuarios.map((u: any) => [u.id, u.full_name]))
                }
            }

            let result = filtered.map((c: any) => ({
                id: c.id,
                clienteId: c.cliente_id,
                clienteNome: c.cliente_nome || 'Cliente',
                servicoNome: c.servico_nome || 'Servico',
                valor: calculateContratoValor(c),
                comercialNome: usuarioNomes[c.usuario_id] || 'N/A',
                status: mapStageToStatus(clienteStages[c.cliente_id] || null),
                criadoEm: c.criado_em,
            }))

            // Apply status filter if provided
            if (status && status !== 'todos') {
                result = result.filter((r: any) => r.status === status)
            }

            return res.status(200).json({ data: result })
        } catch (error: any) {
            console.error('Erro ao buscar assessorias diretas (juridico):', error)
            return res.status(500).json({ message: 'Erro ao buscar assessorias diretas', error: error.message })
        }
    }

    // GET /juridico/assessoria-direta/:id
    // Get details of a specific non-schedulable service contract
    async getDetail(req: any, res: any) {
        try {
            const { id } = req.params

            const { data: contrato, error } = await supabase
                .from('contratos_servicos')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            if (!contrato) return res.status(404).json({ message: 'Contrato nao encontrado' })

            // Get client stage
            let clienteStage = null
            if (contrato.cliente_id) {
                const { data: cliente } = await supabase
                    .from('clientes')
                    .select('id, nome, email, whatsapp, stage, status')
                    .eq('id', contrato.cliente_id)
                    .single()

                if (cliente) {
                    clienteStage = cliente.stage
                    ;(contrato as any).cliente = cliente
                }
            }

            // Get commercial user name
            if (contrato.usuario_id) {
                const { data: usuario } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .eq('id', contrato.usuario_id)
                    .single()

                if (usuario) {
                    ;(contrato as any).comercial = usuario
                }
            }

            // Get assessoria data if exists — for assessoria direta there is no agendamento_id,
            // so we query by cliente_id filtering only rows where agendamento_id is null.
            const { data: assessoria } = await supabase
                .from('assessorias_juridico')
                .select('id, criado_em, respostas, observacoes')
                .eq('cliente_id', contrato.cliente_id)
                .is('agendamento_id', null)
                .order('criado_em', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (assessoria) {
                ;(contrato as any).assessoria = assessoria
            }

            return res.status(200).json({
                data: {
                    ...contrato,
                    valorCalculado: calculateContratoValor(contrato),
                    statusAssessoria: mapStageToStatus(clienteStage),
                }
            })
        } catch (error: any) {
            console.error('Erro ao buscar detalhe da assessoria direta:', error)
            return res.status(500).json({ message: 'Erro ao buscar detalhe', error: error.message })
        }
    }

    // POST /juridico/assessoria-direta/:id/iniciar
    // Start service - update client stage to assessoria_andamento
    async iniciar(req: any, res: any) {
        try {
            const { id } = req.params

            // Find the contrato
            const { data: contrato, error: fetchError } = await supabase
                .from('contratos_servicos')
                .select('id, cliente_id')
                .eq('id', id)
                .single()

            if (fetchError || !contrato) {
                return res.status(404).json({ message: 'Contrato nao encontrado' })
            }

            if (!contrato.cliente_id) {
                return res.status(400).json({ message: 'Contrato sem cliente vinculado' })
            }

            // Update client stage to assessoria_andamento
            const { error: updateError } = await supabase
                .from('clientes')
                .update({
                    stage: 'assessoria_andamento',
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', contrato.cliente_id)

            if (updateError) {
                console.error('Erro ao atualizar stage do cliente:', updateError)
                throw updateError
            }

            return res.status(200).json({ success: true, message: 'Assessoria direta iniciada.' })
        } catch (error: any) {
            console.error('Erro ao iniciar assessoria direta:', error)
            return res.status(500).json({ message: 'Erro ao iniciar assessoria direta', error: error.message })
        }
    }

    // POST /juridico/assessoria-direta/:id/finalizar
    // Finalize service - update client stage to assessoria_finalizada
    async finalizar(req: any, res: any) {
        try {
            const { id } = req.params

            // Find the contrato
            const { data: contrato, error: fetchError } = await supabase
                .from('contratos_servicos')
                .select('id, cliente_id')
                .eq('id', id)
                .single()

            if (fetchError || !contrato) {
                return res.status(404).json({ message: 'Contrato nao encontrado' })
            }

            if (!contrato.cliente_id) {
                return res.status(400).json({ message: 'Contrato sem cliente vinculado' })
            }

            // Update client stage to assessoria_finalizada
            const { error: updateError } = await supabase
                .from('clientes')
                .update({
                    stage: 'assessoria_finalizada',
                    status: 'assessoria_finalizada',
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', contrato.cliente_id)

            if (updateError) {
                console.error('Erro ao atualizar stage do cliente:', updateError)
                throw updateError
            }

            // Mark any open agendamentos as realizado (same as finalizarAssessoriaByCliente)
            await supabase
                .from('agendamentos')
                .update({ status: 'realizado' })
                .eq('cliente_id', contrato.cliente_id)
                .in('status', ['confirmado', 'agendado', 'em_consultoria'])

            // Notify client
            try {
                await NotificationService.createNotification({
                    clienteId: contrato.cliente_id,
                    titulo: 'Assessoria Tecnica Concluida',
                    mensagem: 'Sua assessoria juridica foi finalizada com sucesso.',
                    tipo: 'success'
                })
            } catch (notifError: any) {
                console.error('[assessoriaDireta.finalizar] Erro ao notificar:', notifError?.message || notifError)
            }

            return res.status(200).json({ success: true, message: 'Assessoria direta finalizada.' })
        } catch (error: any) {
            console.error('Erro ao finalizar assessoria direta:', error)
            return res.status(500).json({ message: 'Erro ao finalizar assessoria direta', error: error.message })
        }
    }
}

export default new AssessoriaDiretaController()
