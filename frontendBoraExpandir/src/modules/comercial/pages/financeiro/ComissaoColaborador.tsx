import { useState, useEffect } from 'react'
import { apiClient } from '@/modules/shared/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Badge } from '@/modules/shared/components/ui/badge'
import { TrendingUp, Euro, DollarSign, Target, Users, Calculator, RefreshCw } from 'lucide-react'
import { CurrencyWidget } from '@/modules/shared/components/CurrencyWidget'

interface ComissaoResult {
  nivel: string
  totalVendas: number
  totalFaturadoEur: number
  metaVendasAtingida: number
  totalComissaoEur: number
  totalComissaoBrl: number
  taxaCambio: number
  // C2 extras
  contratosAssessoria?: number
  comissaoAssessoriaEur?: number
  // HEAD extras
  totalSubordinados?: number
  totalVendasEquipe?: number
}

interface ComissaoHistorico {
  id: string
  mes: number
  ano: number
  tipo: string
  total_vendas: number
  total_faturado_eur: number
  meta_atingida: number
  valor_comissao_eur: number
  valor_comissao_brl: number
  taxa_cambio: number
  status: string
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function ComissaoColaborador() {
  const { activeProfile } = useAuth()
  const [comissao, setComissao] = useState<ComissaoResult | null>(null)
  const [historico, setHistorico] = useState<ComissaoHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  const mesAtual = new Date().getMonth() + 1
  const anoAtual = new Date().getFullYear()

  const extractResponseData = <T,>(response: any): T => {
    const payload = response?.data ?? response
    return (payload?.data ?? payload) as T
  }

  useEffect(() => {
    if (activeProfile?.id) {
      fetchData()
    }
  }, [activeProfile?.id])

  async function fetchData() {
    try {
      const [comissaoRes, historicoRes] = await Promise.all([
        apiClient.get<{ data: ComissaoResult }>(`/comercial/comissao/calcular?mes=${mesAtual}&ano=${anoAtual}`),
        apiClient.get<{ data: ComissaoHistorico[] }>(`/comercial/comissao/historico?ano=${anoAtual}`)
      ])

      const comissaoData = extractResponseData<ComissaoResult | null>(comissaoRes)
      const historicoData = extractResponseData<ComissaoHistorico[] | null>(historicoRes)

      setComissao(comissaoData)
      setHistorico(Array.isArray(historicoData) ? historicoData : [])
    } catch (err) {
      console.error('Erro ao buscar comissao:', err)
    } finally {
      setLoading(false)
    }
  }

  async function recalcular() {
    setCalculating(true)
    try {
      const res = await apiClient.get<{ data: ComissaoResult }>(`/comercial/comissao/calcular?mes=${mesAtual}&ano=${anoAtual}`)
      const comissaoData = extractResponseData<ComissaoResult | null>(res)
      setComissao(comissaoData)
    } catch (err) {
      console.error('Erro ao recalcular:', err)
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-neutral-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalVendasComAssessoria = (comissao?.totalVendas || 0) + (comissao?.contratosAssessoria || 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Comissoes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {MESES[mesAtual - 1]} {anoAtual} - Nivel {comissao?.nivel || activeProfile?.nivel || 'C1'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencyWidget />
          <button
            onClick={recalcular}
            disabled={calculating}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${calculating ? 'animate-spin' : ''}`} />
            Recalcular
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Vendas</span>
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalVendasComAssessoria}</p>
            <p className="text-xs text-gray-500 mt-1">Meta {comissao?.metaVendasAtingida || 0} atingida</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Faturamento</span>
              <Euro className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              EUR {(comissao?.totalFaturadoEur || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700 dark:text-green-400">Comissao (EUR)</span>
              <Euro className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              EUR {(comissao?.totalComissaoEur || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700 dark:text-blue-400">Comissao (BRL)</span>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              R$ {(comissao?.totalComissaoBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-blue-500/70 mt-1">
              Taxa: {comissao?.taxaCambio?.toFixed(4) || '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Extras for C2/HEAD */}
      {comissao?.contratosAssessoria !== undefined && (
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-lg">Assessoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Contratos Assinados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{comissao.contratosAssessoria}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Comissao Assessoria</p>
                <p className="text-2xl font-bold text-green-600">
                  EUR {(comissao.comissaoAssessoriaEur || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {comissao?.totalSubordinados !== undefined && (
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Subordinados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{comissao.totalSubordinados}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendas da Equipe</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{comissao.totalVendasEquipe || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historico */}
      <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5" />
            Historico de Comissoes - {anoAtual}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum historico de comissao encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Mes</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Vendas</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Faturado (EUR)</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Meta</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Comissao (EUR)</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Comissao (BRL)</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-neutral-800">
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{MESES[item.mes - 1]}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-xs capitalize">{item.tipo}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{item.total_vendas}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                        {item.total_faturado_eur?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant="secondary">{item.meta_atingida || '-'}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-green-600">
                        {item.valor_comissao_eur?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-blue-600">
                        R$ {item.valor_comissao_brl?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge
                          variant={item.status === 'pago' ? 'default' : item.status === 'fechado' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {item.status === 'pago' ? 'Pago' : item.status === 'fechado' ? 'Fechado' : 'Estimado'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
