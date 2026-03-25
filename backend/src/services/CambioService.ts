import { supabase } from '../config/SupabaseClient'

class CambioService {
  private cachedRate: { valor: number; timestamp: number } | null = null
  private CACHE_TTL = 30 * 60 * 1000 // 30 minutos

  async fetchCotacao(): Promise<number> {
    try {
      const response = await fetch('https://economia.awesomeapi.com.br/json/last/EUR-BRL')
      if (!response.ok) {
        throw new Error(`AwesomeAPI retornou status ${response.status}`)
      }

      const data = await response.json()
      const cotacao = parseFloat(data.EURBRL.bid)

      if (isNaN(cotacao) || cotacao <= 0) {
        throw new Error('Cotacao invalida recebida da API')
      }

      // Persistir no banco
      await this.salvarHistorico(cotacao)

      // Atualizar cache
      this.cachedRate = { valor: cotacao, timestamp: Date.now() }

      console.log(`[CambioService] Cotacao EUR/BRL atualizada: ${cotacao}`)
      return cotacao
    } catch (error) {
      console.error('[CambioService] Erro ao buscar cotacao:', error)

      // Fallback: usar ultima cotacao do banco
      const ultima = await this.getUltimaCotacao()
      if (ultima) return ultima

      throw error
    }
  }

  private async salvarHistorico(valor: number) {
    const { error } = await supabase
      .from('historico_cambio')
      .insert([{
        moeda_origem: 'EUR',
        moeda_destino: 'BRL',
        valor,
        criado_em: new Date().toISOString()
      }])

    if (error) {
      console.error('[CambioService] Erro ao salvar historico de cambio:', error)
    }
  }

  async getUltimaCotacao(): Promise<number | null> {
    const { data, error } = await supabase
      .from('historico_cambio')
      .select('valor')
      .eq('moeda_origem', 'EUR')
      .eq('moeda_destino', 'BRL')
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[CambioService] Erro ao buscar ultima cotacao:', error)
      return null
    }

    return data ? parseFloat(data.valor) : null
  }

  async getCotacaoAtual(): Promise<number> {
    // Verificar cache
    if (this.cachedRate && (Date.now() - this.cachedRate.timestamp) < this.CACHE_TTL) {
      return this.cachedRate.valor
    }

    // Tentar buscar nova cotacao
    try {
      return await this.fetchCotacao()
    } catch {
      // Fallback: buscar do banco
      const ultima = await this.getUltimaCotacao()
      if (ultima) return ultima

      // Fallback final: taxa padrao
      console.warn('[CambioService] Usando taxa de cambio padrao (6.0)')
      return 6.0
    }
  }

  async getHistorico(limit: number = 30) {
    const { data, error } = await supabase
      .from('historico_cambio')
      .select('*')
      .eq('moeda_origem', 'EUR')
      .eq('moeda_destino', 'BRL')
      .order('criado_em', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[CambioService] Erro ao buscar historico:', error)
      throw error
    }

    return data || []
  }

  convertEurToBrl(valorEur: number, taxa: number): number {
    return Math.round(valorEur * taxa * 100) / 100
  }
}

export default new CambioService()
