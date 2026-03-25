import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { apiClient } from '@/modules/shared/services/api'

interface CotacaoData {
  cotacao: number
  historico: Array<{ valor: number; criado_em: string }>
}

export function CurrencyWidget() {
  const [cotacao, setCotacao] = useState<number | null>(null)
  const [variacao, setVariacao] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCotacao()
    const interval = setInterval(fetchCotacao, 5 * 60 * 1000) // Atualizar a cada 5 min
    return () => clearInterval(interval)
  }, [])

  async function fetchCotacao() {
    try {
      const response = await apiClient.get<{ data: CotacaoData }>('/comercial/comissao/cotacao')
      const data = response.data
      setCotacao(data.cotacao)

      if (data.historico && data.historico.length >= 2) {
        const atual = data.cotacao
        const anterior = parseFloat(String(data.historico[1]?.valor || data.cotacao))
        setVariacao(((atual - anterior) / anterior) * 100)
      }
    } catch (err) {
      console.error('Erro ao buscar cotacao:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 animate-pulse">
        <RefreshCw className="h-3.5 w-3.5 text-gray-400 animate-spin" />
        <span className="text-xs text-gray-400">EUR/BRL...</span>
      </div>
    )
  }

  if (!cotacao) return null

  const isPositive = variacao >= 0

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">EUR/BRL</span>
      <span className="text-sm font-bold text-gray-900 dark:text-white">
        R$ {cotacao.toFixed(4)}
      </span>
      <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {Math.abs(variacao).toFixed(2)}%
      </span>
    </div>
  )
}
