import { supabase } from '../config/SupabaseClient'
import {
    calcularDataVencimentoBoleto,
    clampQuantidadeParcelas,
    getAnchorDayFromDate,
    normalizeMetodoPagamento,
    parseMoneyInput
} from '../utils/boletoUtils'

type OrigemTipo = 'agendamento' | 'contrato'

type EnsureParcelasInput = {
    origemTipo: OrigemTipo
    origemId: string
    clienteId?: string | null
    usuarioId?: string | null
    servicoNome?: string | null
    pagadorNome?: string | null
    vendedorNome?: string | null
    metodoPagamento?: string | null
    valorEntrada?: any
    valorParcela?: any
    quantidadeParcelas?: any
    diaCobranca?: any
    dataBase: string | Date
    comprovanteUrlEntrada?: string | null
    verificadoPor?: string | null
    verificadoEm?: string | null
}

class BoletoParcelasRepository {
    private async resolvePagadorNome(clienteId?: string | null, fallback?: string | null): Promise<string | null> {
        if (fallback) return fallback
        if (!clienteId) return null

        const { data } = await supabase
            .from('clientes')
            .select('nome')
            .eq('id', clienteId)
            .maybeSingle()

        return data?.nome || null
    }

    private async resolveVendedorNome(usuarioId?: string | null, fallback?: string | null): Promise<string | null> {
        if (fallback) return fallback
        if (!usuarioId) return null

        const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', usuarioId)
            .maybeSingle()

        return data?.full_name || null
    }

    async ensureParcelasPosEntradaAprovada(input: EnsureParcelasInput): Promise<{ created: number; skipped: boolean }> {
        const metodo = normalizeMetodoPagamento(input.metodoPagamento)
        if (metodo !== 'boleto') return { created: 0, skipped: true }

        const quantidadeParcelas = clampQuantidadeParcelas(input.quantidadeParcelas)
        const valorEntrada = parseMoneyInput(input.valorEntrada)
        const valorParcela = parseMoneyInput(input.valorParcela)

        if (quantidadeParcelas < 1 || !valorEntrada || !valorParcela) {
            return { created: 0, skipped: true }
        }

        const diaCobranca = Math.max(
            1,
            Math.min(
                31,
                Number(input.diaCobranca) || getAnchorDayFromDate(input.dataBase)
            )
        )

        const pagadorNome = await this.resolvePagadorNome(input.clienteId, input.pagadorNome || null)
        const vendedorNome = await this.resolveVendedorNome(input.usuarioId, input.vendedorNome || null)

        const { data: existingRows, error: existingError } = await supabase
            .from('parcelas_servicos')
            .select('id, tipo_parcela, numero_parcela')
            .eq('origem_tipo', input.origemTipo)
            .eq('origem_id', input.origemId)

        if (existingError) {
            console.error('[BoletoParcelasRepository] Erro ao verificar parcelas existentes:', existingError)
            throw existingError
        }

        const existingKey = new Set((existingRows || []).map((row: any) => `${row.tipo_parcela}:${row.numero_parcela}`))
        const payloads: any[] = []

        // Registro histórico da entrada
        if (!existingKey.has('entrada:0')) {
            payloads.push({
                origem_tipo: input.origemTipo,
                origem_id: input.origemId,
                cliente_id: input.clienteId || null,
                usuario_id: input.usuarioId || null,
                servico_nome: input.servicoNome || null,
                pagador_nome: pagadorNome,
                vendedor_nome: vendedorNome,
                metodo_pagamento: 'boleto',
                tipo_parcela: 'entrada',
                numero_parcela: 0,
                quantidade_parcelas: quantidadeParcelas,
                valor_entrada: valorEntrada,
                valor_parcela: valorParcela,
                valor: valorEntrada,
                dia_cobranca: diaCobranca,
                data_vencimento: calcularDataVencimentoBoleto(input.dataBase, 0, diaCobranca),
                status: 'pago',
                comprovante_url: input.comprovanteUrlEntrada || null,
                verificado_por: input.verificadoPor || null,
                verificado_em: input.verificadoEm || new Date().toISOString(),
                criado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            })
        }

        // Parcelas futuras (1..N)
        for (let parcela = 1; parcela <= quantidadeParcelas; parcela += 1) {
            const key = `parcela:${parcela}`
            if (existingKey.has(key)) continue

            payloads.push({
                origem_tipo: input.origemTipo,
                origem_id: input.origemId,
                cliente_id: input.clienteId || null,
                usuario_id: input.usuarioId || null,
                servico_nome: input.servicoNome || null,
                pagador_nome: pagadorNome,
                vendedor_nome: vendedorNome,
                metodo_pagamento: 'boleto',
                tipo_parcela: 'parcela',
                numero_parcela: parcela,
                quantidade_parcelas: quantidadeParcelas,
                valor_entrada: valorEntrada,
                valor_parcela: valorParcela,
                valor: valorParcela,
                dia_cobranca: diaCobranca,
                data_vencimento: calcularDataVencimentoBoleto(input.dataBase, parcela, diaCobranca),
                status: 'pendente',
                criado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            })
        }

        if (payloads.length === 0) {
            return { created: 0, skipped: false }
        }

        const { error: insertError } = await supabase
            .from('parcelas_servicos')
            .insert(payloads)

        if (insertError) {
            console.error('[BoletoParcelasRepository] Erro ao criar parcelas:', insertError)
            throw insertError
        }

        return { created: payloads.length, skipped: false }
    }

    async getContasReceber(): Promise<any[]> {
        const { data, error } = await supabase
            .from('parcelas_servicos')
            .select('*')
            .eq('tipo_parcela', 'parcela')
            .neq('status', 'cancelado')
            .order('data_vencimento', { ascending: true })

        if (error) {
            console.error('[BoletoParcelasRepository] Erro ao buscar contas a receber:', error)
            throw error
        }

        return data || []
    }

    async getParcelasComprovantesPendentes(): Promise<any[]> {
        const { data, error } = await supabase
            .from('parcelas_servicos')
            .select('*')
            .eq('tipo_parcela', 'parcela')
            .eq('status', 'em_analise')
            .not('comprovante_url', 'is', null)
            .order('comprovante_upload_em', { ascending: true })

        if (error) {
            console.error('[BoletoParcelasRepository] Erro ao buscar comprovantes pendentes de parcelas:', error)
            throw error
        }

        return data || []
    }

    async getParcelaById(id: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('parcelas_servicos')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (error) {
            console.error('[BoletoParcelasRepository] Erro ao buscar parcela:', error)
            throw error
        }

        return data || null
    }

    async updateParcela(id: string, payload: Record<string, any>): Promise<any> {
        const { data, error } = await supabase
            .from('parcelas_servicos')
            .update({
                ...payload,
                atualizado_em: new Date().toISOString()
            })
            .eq('id', id)
            .select('*')
            .single()

        if (error) {
            console.error('[BoletoParcelasRepository] Erro ao atualizar parcela:', error)
            throw error
        }

        return data
    }

    async getBloqueiosAtivosByCliente(clienteId: string): Promise<any[]> {
        const hojeBrt = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date())

        const { data, error } = await supabase
            .from('parcelas_servicos')
            .select('*')
            .eq('cliente_id', clienteId)
            .eq('tipo_parcela', 'parcela')
            .in('status', ['pendente', 'recusado', 'em_analise'])
            .lte('data_vencimento', hojeBrt)
            .order('data_vencimento', { ascending: true })

        if (error) {
            console.error('[BoletoParcelasRepository] Erro ao buscar bloqueios por cliente:', error)
            throw error
        }

        return data || []
    }
}

export default new BoletoParcelasRepository()
