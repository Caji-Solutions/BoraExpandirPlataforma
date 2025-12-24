import React, { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  AlertCircle,
  Clock,
} from 'lucide-react'

interface VendedorInfo {
  nome: string
  vendas: number
  meta: number
  comissao: number
  status: 'acima' | 'dentro' | 'abaixo'
}

// Mock data
const mockMetricas = {
  metaVendas: {
    atual: 45000,
    total: 100000,
    percentual: 45,
  },
  novosClientes: {
    mes: 12,
    mesAnterior: 8,
    crescimento: 50,
  },
  faturamentoMensal: {
    valor: 87500,
    mesAnterior: 72000,
    crescimento: 21.5,
  },
  contasReceber: {
    total: 156000,
    vencidas: 24000,
    proximasVencer: 45000,
  },
  comissoes: {
    aRealizar: 8750,
    paga: 65200,
    total: 73950,
  },
  vendedores: [
    { nome: 'João Silva', vendas: 28000, meta: 25000, comissao: 2800, status: 'acima' as const },
    { nome: 'Maria Santos', vendas: 22000, meta: 25000, comissao: 1650, status: 'abaixo' as const },
    { nome: 'Pedro Costa', vendas: 26500, meta: 25000, comissao: 2650, status: 'acima' as const },
    { nome: 'Ana Oliveira', vendas: 11000, meta: 25000, comissao: 825, status: 'abaixo' as const },
  ] as VendedorInfo[],
}

const corPorStatus = {
  acima: 'bg-green-600',
  dentro: 'bg-blue-600',
  abaixo: 'bg-orange-600',
}

const corTextoStatus = {
  acima: 'text-green-200',
  dentro: 'text-blue-200',
  abaixo: 'text-orange-200',
}

const corBarraStatus = {
  acima: 'bg-green-100',
  dentro: 'bg-blue-100',
  abaixo: 'bg-orange-100',
}

export function Dashboard() {
  const [periodo, setPeriodo] = useState('mes')

  // Cálculos
  const percentualMeta = useMemo(() => {
    return Math.round((mockMetricas.metaVendas.atual / mockMetricas.metaVendas.total) * 100)
  }, [])

  const faturamentoPorcentagem = useMemo(() => {
    return (
      ((mockMetricas.faturamentoMensal.valor - mockMetricas.faturamentoMensal.mesAnterior) /
        mockMetricas.faturamentoMensal.mesAnterior) *
      100
    ).toFixed(1)
  }, [])

  const statusMeta = useMemo(() => {
    if (percentualMeta >= 100) return 'acima'
    if (percentualMeta >= 75) return 'dentro'
    return 'abaixo'
  }, [percentualMeta])

  const statusClientesNovos = mockMetricas.novosClientes.crescimento >= 0 ? 'up' : 'down'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriodo('semana')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                periodo === 'semana'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                periodo === 'mes'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setPeriodo('ano')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                periodo === 'ano'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ano
            </button>
          </div>
        </div>
        <p className="text-gray-600">Visão geral das métricas financeiras e desempenho de vendas</p>
      </div>

      {/* Métricas Principais - Grid 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta de Vendas */}
        <div className="bg-green-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-white/90 mb-1">Meta de Vendas</p>
              <h3 className="text-3xl font-bold text-white">
                {mockMetricas.metaVendas.percentual}%
              </h3>
              <p className="text-xs text-white/80 mt-1">
                R$ {mockMetricas.metaVendas.atual.toLocaleString('pt-BR')} de R${' '}
                {mockMetricas.metaVendas.total.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/20">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(percentualMeta, 100)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-medium text-white">
              {statusMeta === 'acima'
                ? '✓ Acima da meta'
                : statusMeta === 'dentro'
                  ? '◐ Dentro da meta'
                  : '⚠ Abaixo da meta'}
            </span>
            <span className="text-xs text-white/80">
              Faltam R$ {(mockMetricas.metaVendas.total - mockMetricas.metaVendas.atual).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Faturamento Mensal */}
        <div className="bg-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-white/90 mb-1">Faturamento Mensal</p>
              <h3 className="text-3xl font-bold text-white">
                R$ {(mockMetricas.faturamentoMensal.valor / 1000).toFixed(1)}k
              </h3>
              <p className="text-xs text-white/80 mt-1">
                Mês anterior: R$ {(mockMetricas.faturamentoMensal.mesAnterior / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/20">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">+{faturamentoPorcentagem}% vs mês anterior</span>
          </div>
        </div>

        {/* Novos Clientes */}
        <div className="bg-purple-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-white/90 mb-1">Novos Clientes</p>
              <h3 className="text-3xl font-bold text-white">
                {mockMetricas.novosClientes.mes}
              </h3>
              <p className="text-xs text-white/80 mt-1">
                Mês anterior: {mockMetricas.novosClientes.mesAnterior} clientes
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/20">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusClientesNovos === 'up' && <TrendingUp className="h-4 w-4 text-white" />}
            {statusClientesNovos === 'down' && <TrendingDown className="h-4 w-4 text-white" />}
            <span className="text-sm font-medium text-white">
              {statusClientesNovos === 'down' ? '' : '+'}{mockMetricas.novosClientes.crescimento}%
            </span>
          </div>
        </div>

        {/* Contas a Receber */}
        <div className="bg-red-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-white/90 mb-1">Contas a Receber</p>
              <h3 className="text-3xl font-bold text-white">
                R$ {(mockMetricas.contasReceber.total / 1000).toFixed(0)}k
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-white/20">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/90 font-medium">Vencidas:</span>
              <span className="font-bold text-white">
                R$ {mockMetricas.contasReceber.vencidas.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/90 font-medium">Próximas vencer:</span>
              <span className="font-bold text-white">
                R$ {mockMetricas.contasReceber.proximasVencer.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comissões e Vendedores - Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comissões */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Comissões</h2>
          <div className="space-y-4">
            <div className="bg-green-600 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white/90">Paga</span>
                <span className="text-sm text-white">✓</span>
              </div>
              <p className="text-2xl font-bold text-white">
                R$ {mockMetricas.comissoes.paga.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-orange-500 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white/90">A Realizar</span>
                <Clock className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                R$ {mockMetricas.comissoes.aRealizar.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mt-4 shadow-sm">
              <p className="text-xs text-white/80 mb-1">Total de Comissões</p>
              <p className="text-2xl font-bold text-white">
                R$ {mockMetricas.comissoes.total.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Top Vendedores */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Vendedores</h2>
          <div className="space-y-3">
            {mockMetricas.vendedores.map((vendedor, idx) => {
              const percentualMeta = (vendedor.vendas / vendedor.meta) * 100
              return (
                <div key={idx} className={`rounded-lg p-4 shadow-sm ${corPorStatus[vendedor.status]}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">{vendedor.nome}</p>
                      <p className={`text-xs font-medium ${corTextoStatus[vendedor.status]}`}>
                        {vendedor.status === 'acima'
                          ? '📈 Acima da meta'
                          : vendedor.status === 'dentro'
                            ? '✓ Dentro da meta'
                            : '⚠ Abaixo da meta'}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {percentualMeta.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-full ${corBarraStatus[vendedor.status]}`}
                      style={{ width: `${Math.min(percentualMeta, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/90">
                    <span>
                      R$ {vendedor.vendas.toLocaleString('pt-BR')} / R$ {vendedor.meta.toLocaleString('pt-BR')}
                    </span>
                    <span className="font-medium text-white">
                      Comissão: R$ {vendedor.comissao.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Alertas e Ações */}
      <div className="border border-orange-200 bg-orange-50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">Atenção</h3>
            <ul className="space-y-1 text-sm text-orange-800">
              <li>• R$ 24.000 em contas vencidas aguardando cobrança</li>
              <li>• 2 vendedores abaixo da meta - considere contato motivacional</li>
              <li>• Meta de vendas em 45% - acelere prospecção</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
