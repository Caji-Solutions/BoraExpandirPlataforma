import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Briefcase,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// TODO: dados mock - usar query real de relatórios comparativos
const dadosMensais = []
const dadosDistribuicao = []
const dadosFaturamento = []

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']

interface MetricaCardProps {
  titulo: string
  valor: number | string
  variacao: number
  icone: React.ElementType
  corFundo: string
  corIcone: string
}

function MetricaCard({ titulo, valor, variacao, icone: Icone, corFundo, corIcone }: MetricaCardProps) {
  const isPositivo = variacao >= 0
  
  return (
    <div className={`${corFundo} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${corIcone}`}>
          <Icone className="h-6 w-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isPositivo ? 'text-green-100' : 'text-red-100'
        }`}>
          {isPositivo ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {Math.abs(variacao)}%
        </div>
      </div>
      <h3 className="text-white/90 text-sm font-medium mb-1">{titulo}</h3>
      <p className="text-3xl font-bold text-white">{valor}</p>
    </div>
  )
}

export function RelatoriosComparativos() {
  const [periodo, setPeriodo] = useState('ano')
  const [tipoVisualizacao, setTipoVisualizacao] = useState('quantidade')

  // Calcular totais
  const totais = useMemo(() => {
    const totalProcessos = dadosMensais.reduce((acc, curr) => acc + curr.processos, 0)
    const totalConsultorias = dadosMensais.reduce((acc, curr) => acc + curr.consultorias, 0)
    const totalAssessorias = dadosMensais.reduce((acc, curr) => acc + curr.assessorias, 0)
    const total = totalProcessos + totalConsultorias + totalAssessorias
    
    return {
      processos: totalProcessos,
      consultorias: totalConsultorias,
      assessorias: totalAssessorias,
      total,
      percentualProcessos: Math.round((totalProcessos / total) * 100),
      percentualConsultorias: Math.round((totalConsultorias / total) * 100),
      percentualAssessorias: Math.round((totalAssessorias / total) * 100),
    }
  }, [])

  // Dados filtrados por período
  const dadosFiltrados = useMemo(() => {
    if (periodo === 'trimestre') {
      return dadosMensais.slice(-3)
    } else if (periodo === 'semestre') {
      return dadosMensais.slice(-6)
    }
    return dadosMensais
  }, [periodo])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Comparativos</h1>
          <p className="text-gray-600 mt-1">
            Análise comparativa: Processos vs. Consultorias vs. Assessorias
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtro de Período */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['trimestre', 'semestre', 'ano'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  periodo === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p === 'trimestre' ? 'Trimestre' : p === 'semestre' ? 'Semestre' : 'Ano'}
              </button>
            ))}
          </div>
          
          {/* Botão Exportar */}
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricaCard
          titulo="Total Geral"
          valor={totais.total.toLocaleString('pt-BR')}
          variacao={12.5}
          icone={TrendingUp}
          corFundo="bg-gradient-to-br from-gray-700 to-gray-900"
          corIcone="bg-white/20"
        />
        <MetricaCard
          titulo="Processos"
          valor={totais.processos.toLocaleString('pt-BR')}
          variacao={15.2}
          icone={FileText}
          corFundo="bg-gradient-to-br from-blue-500 to-blue-600"
          corIcone="bg-white/20"
        />
        <MetricaCard
          titulo="Consultorias"
          valor={totais.consultorias.toLocaleString('pt-BR')}
          variacao={8.7}
          icone={Users}
          corFundo="bg-gradient-to-br from-emerald-500 to-emerald-600"
          corIcone="bg-white/20"
        />
        <MetricaCard
          titulo="Assessorias"
          valor={totais.assessorias.toLocaleString('pt-BR')}
          variacao={22.3}
          icone={Briefcase}
          corFundo="bg-gradient-to-br from-amber-500 to-amber-600"
          corIcone="bg-white/20"
        />
      </div>

      {/* Gráficos - Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Barras - Comparativo Mensal */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Comparativo Mensal</h2>
              <p className="text-sm text-gray-500 mt-1">Quantidade por categoria ao longo do tempo</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">Processos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-600">Consultorias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600">Assessorias</span>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dadosFiltrados} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar 
                dataKey="processos" 
                fill="#3b82f6" 
                name="Processos"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="consultorias" 
                fill="#10b981" 
                name="Consultorias"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="assessorias" 
                fill="#f59e0b" 
                name="Assessorias"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Distribuição */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Distribuição Total</h2>
            <p className="text-sm text-gray-500 mt-1">Proporção entre categorias</p>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dadosDistribuicao}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {dadosDistribuicao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString('pt-BR')}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda customizada */}
          <div className="space-y-3 mt-4">
            {dadosDistribuicao.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({Math.round((item.value / totais.total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela Resumo */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Resumo Detalhado</h2>
          <p className="text-sm text-gray-500 mt-1">Comparativo completo por categoria</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  % do Total
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Média Mensal
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Crescimento
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ticket Médio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-medium text-gray-900">Processos</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                  {totais.processos.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right text-gray-600">
                  {totais.percentualProcessos}%
                </td>
                <td className="px-6 py-4 text-right text-gray-600">
                  {Math.round(totais.processos / 12).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    +15.2%
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  R$ 2.850,00
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-medium text-gray-900">Consultorias</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                  {totais.consultorias.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right text-gray-600">
                  {totais.percentualConsultorias}%
                </td>
                <td className="px-6 py-4 text-right text-gray-600">
                  {Math.round(totais.consultorias / 12).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    +8.7%
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  R$ 4.200,00
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-medium text-gray-900">Assessorias</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                  {totais.assessorias.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right text-gray-600">
                  {totais.percentualAssessorias}%
                </td>
                <td className="px-6 py-4 text-right text-gray-600">
                  {Math.round(totais.assessorias / 12).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    +22.3%
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  R$ 6.500,00
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 font-bold text-gray-900">Total</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  {totais.total.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">100%</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  {Math.round(totais.total / 12).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                    <TrendingUp className="h-4 w-4" />
                    +12.5%
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  R$ 3.850,00
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
