import { useMemo, useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Calendar, Award, Filter, X, User, Bot } from 'lucide-react'
import { Badge } from '@/modules/shared/components/ui/badge'
import { TimeRangeFilter, filterByTimeRange, type TimeRange } from '@/components/ui/TimeRangeFilter'
import { SortControl, sortData, type SortDirection, type SortOption } from '@/components/ui/SortControl'
import { calcularComissao, getLabelOrigem, type OrigemVenda } from '../../../../services/comissaoService'
import { useAuth } from '../../../../contexts/AuthContext'
import MetaComissaoCard from '../../components/MetaComissaoCard'
import RecordsPessoaisCard from '../../components/RecordsPessoaisCard'
import AlertaComissoesRisco from '../../components/AlertaComissoesRisco'
import comercialService from '../../services/comercialService'

const META_MENSAL_PADRAO = 2000

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

const statusConfig = {
  pago: { variant: 'success' as const, label: 'Pago' },
  pendente: { variant: 'warning' as const, label: 'Pendente' },
  processando: { variant: 'default' as const, label: 'Processando' },
  cancelado: { variant: 'destructive' as const, label: 'Cancelado' },
}

const sortOptions: SortOption[] = [
  { value: 'data_venda', label: 'Data da Venda' },
  { value: 'valor_comissao', label: 'Valor da Comissão' },
  { value: 'cliente_nome', label: 'Nome do Cliente' },
  { value: 'status', label: 'Status' },
]

function mapAgendamentoStatus(agendamento: any): string {
  if (agendamento.status === 'cancelado') return 'cancelado'
  if (agendamento.pagamento_status === 'aprovado') return 'pago'
  if (agendamento.pagamento_status === 'em_analise') return 'processando'
  return 'pendente'
}

function mapContratoStatus(contrato: any): string {
  if (contrato.pagamento_status === 'aprovado') return 'pago'
  if (contrato.pagamento_status === 'em_analise') return 'processando'
  return 'pendente'
}

export default function Ganhos() {
  const { activeProfile } = useAuth()
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('current_month')
  const [sortBy, setSortBy] = useState('data_venda')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!activeProfile?.id) return

    const fetchVendas = async () => {
      setLoading(true)
      try {
        const [agendamentosRes, contratos] = await Promise.all([
          fetch(`${API_BASE_URL}/comercial/agendamentos/usuario/${activeProfile.id}`),
          comercialService.getContratosServicos(undefined, false),
        ])

        const agendamentosData = agendamentosRes.ok ? await agendamentosRes.json() : []

        const agendamentos: any[] = Array.isArray(agendamentosData) ? agendamentosData : []
        const contratosSeguros: any[] = Array.isArray(contratos) ? contratos : []

        const vendasDeAgendamentos = agendamentos
          .filter((a: any) => a.valor && Number(a.valor) > 0)
          .map((a: any) => ({
            id: a.id,
            cliente_nome: a.cliente?.nome || a.nome || 'Cliente',
            servico: a.produto_nome || 'Serviço',
            valor_servico: Number(a.valor) || 0,
            origem_venda: 'propria' as OrigemVenda,
            status: mapAgendamentoStatus(a),
            data_venda: a.data_hora || a.created_at,
            data_pagamento: a.pagamento_verificado_em || null,
            created_at: a.created_at,
          }))

        const vendasDeContratos = contratosSeguros
          .filter((c: any) => Number(c.servico_valor || c.servico?.valor) > 0)
          .map((c: any) => ({
            id: c.id,
            cliente_nome: c.cliente_nome || c.cliente?.nome || 'Cliente',
            servico: c.servico_nome || c.servico?.nome || 'Serviço',
            valor_servico: Number(c.servico_valor || c.servico?.valor) || 0,
            origem_venda: 'propria' as OrigemVenda,
            status: mapContratoStatus(c),
            data_venda: c.criado_em,
            data_pagamento: c.pagamento_aprovado_em || null,
            created_at: c.criado_em,
          }))

        setVendas([...vendasDeAgendamentos, ...vendasDeContratos])
      } catch (err) {
        console.error('Erro ao buscar ganhos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVendas()
  }, [activeProfile?.id])

  // Transforma vendas em comissões calculadas automaticamente
  const comissoesComCalculo = useMemo(() => {
    return vendas.map(venda => {
      const { percentual, valorComissao } = calcularComissao(venda.valor_servico, venda.origem_venda)
      return {
        ...venda,
        percentual_comissao: percentual,
        valor_comissao: valorComissao,
        origem_label: getLabelOrigem(venda.origem_venda)
      }
    })
  }, [vendas])

  const filteredComissoes = useMemo(() => {
    let filtered = filterByTimeRange(comissoesComCalculo, timeRange)
    return sortData(filtered, sortBy, sortDirection)
  }, [comissoesComCalculo, timeRange, sortBy, sortDirection])

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy)
    setSortDirection(newDirection)
  }

  // Dados para MetaComissaoCard (sempre mês atual)
  const metaComissaoData = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthComissoes = comissoesComCalculo.filter(c => {
      const d = new Date(c.data_venda)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const comissaoAtual = currentMonthComissoes
      .filter(c => c.status === 'pago')
      .reduce((acc: number, c: any) => acc + c.valor_comissao, 0)

    const comissaoPendente = currentMonthComissoes
      .filter(c => c.status === 'pendente' || c.status === 'processando')
      .reduce((acc: number, c: any) => acc + c.valor_comissao, 0)

    // Agrupar todos os meses (excluindo cancelados)
    const byMonth: Record<string, number> = {}
    comissoesComCalculo
      .filter((c: any) => c.status !== 'cancelado')
      .forEach((c: any) => {
        const d = new Date(c.data_venda)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        byMonth[key] = (byMonth[key] || 0) + c.valor_comissao
      })

    // Melhor mês histórico
    let bestKey = ''
    let bestValue = 0
    Object.entries(byMonth).forEach(([key, value]) => {
      if (value > bestValue) { bestKey = key; bestValue = value }
    })

    const mesMelhorMes = bestKey
      ? (() => {
          const [y, m] = bestKey.split('-')
          return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        })()
      : ''

    // Meses anteriores ao atual
    const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
    const mesesAnteriores = Object.entries(byMonth)
      .filter(([key]) => key < currentKey)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, comissao]) => {
        const [y, m] = key.split('-')
        return {
          mes: new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          comissao,
        }
      })

    return { comissaoAtual, comissaoPendente, melhorMesHistorico: bestValue, mesMelhorMes, mesesAnteriores }
  }, [comissoesComCalculo])

  // Dados para RecordsPessoaisCard
  const recordsPessoaisData = useMemo(() => {
    const byMonth: Record<string, { mes: string; valor: number }> = {}
    comissoesComCalculo
      .filter((c: any) => c.status !== 'cancelado')
      .forEach((c: any) => {
        const d = new Date(c.data_venda)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (!byMonth[key]) {
          byMonth[key] = {
            mes: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            valor: 0,
          }
        }
        byMonth[key].valor += c.valor_comissao
      })

    const sortedMonths = Object.values(byMonth).sort((a, b) => b.valor - a.valor)
    const melhorMes = sortedMonths[0] || { mes: '-', valor: 0 }

    // Sequência de meses positivos consecutivos
    const now = new Date()
    let sequencia = 0
    let checkMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    for (let i = 0; i < 24; i++) {
      const key = `${checkMonth.getFullYear()}-${String(checkMonth.getMonth() + 1).padStart(2, '0')}`
      if (byMonth[key] && byMonth[key].valor >= META_MENSAL_PADRAO) {
        sequencia++
        checkMonth = new Date(checkMonth.getFullYear(), checkMonth.getMonth() - 1, 1)
      } else {
        break
      }
    }

    const top3 = comissoesComCalculo
      .filter((c: any) => c.status !== 'cancelado')
      .sort((a: any, b: any) => b.valor_comissao - a.valor_comissao)
      .slice(0, 3)
      .map((c: any) => ({
        id: c.id,
        cliente_nome: c.cliente_nome,
        servico: c.servico,
        valor_comissao: c.valor_comissao,
        data_venda: c.data_venda,
      }))

    return { melhorMes, mesesPositivosSequencia: sequencia, top3MaioresComissoes: top3 }
  }, [comissoesComCalculo])

  // Comissões canceladas no mês atual para AlertaComissoesRisco
  const comissoesCanceladas = useMemo(() => {
    const now = new Date()
    return comissoesComCalculo
      .filter((c: any) => {
        if (c.status !== 'cancelado') return false
        const d = new Date(c.data_venda)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .map((c: any) => ({
        id: c.id,
        cliente_nome: c.cliente_nome,
        servico: c.servico,
        valor_comissao: c.valor_comissao,
        data_venda: c.data_venda,
      }))
  }, [comissoesComCalculo])

  // Calcular totais
  const totais = useMemo(() => {
    const total = filteredComissoes.reduce((acc, c) => acc + c.valor_comissao, 0)
    const pago = filteredComissoes
      .filter(c => c.status === 'pago')
      .reduce((acc, c) => acc + c.valor_comissao, 0)
    const pendente = filteredComissoes
      .filter(c => c.status === 'pendente' || c.status === 'processando')
      .reduce((acc, c) => acc + c.valor_comissao, 0)
    const totalVendas = filteredComissoes.reduce((acc, c) => acc + c.valor_servico, 0)

    return { total, pago, pendente, totalVendas, quantidade: filteredComissoes.length }
  }, [filteredComissoes])

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Título e Botão de Filtros */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ganhos e Comissões</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe suas comissões e ganhos por vendas realizadas
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors whitespace-nowrap ${
            showFilters
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300'
              : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
          }`}
        >
          {showFilters ? (
            <>
              <X className="h-5 w-5" />
              <span className="hidden sm:inline">Fechar</span>
            </>
          ) : (
            <>
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filtros</span>
            </>
          )}
        </button>
      </div>

      {/* MetaComissaoCard + RecordsPessoaisCard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetaComissaoCard
          metaMensal={META_MENSAL_PADRAO}
          comissaoAtual={metaComissaoData.comissaoAtual}
          comissaoPendente={metaComissaoData.comissaoPendente}
          melhorMesHistorico={metaComissaoData.melhorMesHistorico}
          mesMelhorMes={metaComissaoData.mesMelhorMes}
          mesesAnteriores={metaComissaoData.mesesAnteriores}
        />
        <RecordsPessoaisCard
          melhorMes={recordsPessoaisData.melhorMes}
          mesesPositivosSequencia={recordsPessoaisData.mesesPositivosSequencia}
          top3MaioresComissoes={recordsPessoaisData.top3MaioresComissoes}
        />
      </div>

      {/* Alerta de Comissões Canceladas */}
      <AlertaComissoesRisco comissoesCanceladas={comissoesCanceladas} />

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-emerald-600 dark:bg-emerald-600 rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-white">Total de Comissões</h2>
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            R$ {totais.total.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-white/80">
            {totais.quantidade} vendas no período
          </p>
        </div>

        <div className="bg-blue-600 dark:bg-blue-600 rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-white">Comissões Pagas</h2>
            <div className="p-2 bg-white/20 rounded-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            R$ {totais.pago.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-white/80">
            Já recebido
          </p>
        </div>

        <div className="bg-amber-500 dark:bg-amber-500 rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-white">A Receber</h2>
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            R$ {totais.pendente.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-white/80">
            Pendente/Processando
          </p>
        </div>

        <div className="bg-purple-600 dark:bg-purple-600 rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-white">Total em Vendas</h2>
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            R$ {totais.totalVendas.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-white/80">
            Valor total vendido
          </p>
        </div>
      </div>

      {/* Painel de Filtros Colapsável */}
      {showFilters && (
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-800/50 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimeRangeFilter
              value={timeRange}
              onChange={setTimeRange}
            />
            <SortControl
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              options={sortOptions}
            />
          </div>
        </div>
      )}

      {/* Tabela de Comissões */}
      <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Comissões</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              Carregando...
            </div>
          ) : filteredComissoes.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              Nenhuma comissão encontrada no período selecionado.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor Venda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Comissão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data Venda
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {filteredComissoes.map((comissao) => {
                  const statusInfo = statusConfig[comissao.status as keyof typeof statusConfig]
                  return (
                    <tr key={comissao.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {comissao.cliente_nome}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {comissao.servico}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {comissao.origem_venda === 'propria' ? (
                            <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                          <span className={`text-sm font-medium ${
                            comissao.origem_venda === 'propria'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {comissao.origem_label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        R$ {comissao.valor_servico.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        R$ {comissao.valor_comissao.toFixed(2)}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({comissao.percentual_comissao}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(comissao.data_venda).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Contador */}
      {!loading && filteredComissoes.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Exibindo {filteredComissoes.length} de {vendas.length} comissões
        </div>
      )}
    </div>
  )
}
