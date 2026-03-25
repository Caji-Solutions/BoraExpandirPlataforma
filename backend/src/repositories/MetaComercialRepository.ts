import { supabase } from '../config/SupabaseClient'

export interface MetaComercial {
  id?: string
  nivel: 'C1' | 'C2' | 'HEAD'
  meta_num: number
  min_vendas: number
  max_vendas: number | null
  valor_comissao_eur: number
  min_faturamento_eur: number
  max_faturamento_eur: number | null
  pct_comissao_faturamento: number
}

class MetaComercialRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('metas_comerciais')
      .select('*')
      .order('nivel')
      .order('meta_num')

    if (error) {
      console.error('[MetaComercialRepository] Erro ao buscar metas:', error)
      throw error
    }

    return data || []
  }

  async getByNivel(nivel: string) {
    const { data, error } = await supabase
      .from('metas_comerciais')
      .select('*')
      .eq('nivel', nivel)
      .order('meta_num')

    if (error) {
      console.error('[MetaComercialRepository] Erro ao buscar metas por nivel:', error)
      throw error
    }

    return data || []
  }

  async upsert(meta: MetaComercial) {
    const payload = {
      nivel: meta.nivel,
      meta_num: meta.meta_num,
      min_vendas: meta.min_vendas,
      max_vendas: meta.max_vendas,
      valor_comissao_eur: meta.valor_comissao_eur,
      min_faturamento_eur: meta.min_faturamento_eur,
      max_faturamento_eur: meta.max_faturamento_eur,
      pct_comissao_faturamento: meta.pct_comissao_faturamento,
      atualizado_em: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('metas_comerciais')
      .upsert(payload, { onConflict: 'nivel,meta_num' })
      .select()
      .single()

    if (error) {
      console.error('[MetaComercialRepository] Erro ao upsert meta:', error)
      throw error
    }

    return data
  }

  async upsertBatch(metas: MetaComercial[]) {
    const payloads = metas.map(meta => ({
      nivel: meta.nivel,
      meta_num: meta.meta_num,
      min_vendas: meta.min_vendas,
      max_vendas: meta.max_vendas,
      valor_comissao_eur: meta.valor_comissao_eur,
      min_faturamento_eur: meta.min_faturamento_eur,
      max_faturamento_eur: meta.max_faturamento_eur,
      pct_comissao_faturamento: meta.pct_comissao_faturamento,
      atualizado_em: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('metas_comerciais')
      .upsert(payloads, { onConflict: 'nivel,meta_num' })
      .select()

    if (error) {
      console.error('[MetaComercialRepository] Erro ao upsert batch metas:', error)
      throw error
    }

    return data || []
  }

  async delete(id: string) {
    const { error } = await supabase
      .from('metas_comerciais')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[MetaComercialRepository] Erro ao deletar meta:', error)
      throw error
    }
  }
}

export default new MetaComercialRepository()
