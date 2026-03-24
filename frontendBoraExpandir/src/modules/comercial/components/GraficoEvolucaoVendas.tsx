import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ContratoServico } from '../../../types/comercial'

interface GraficoEvolucaoVendasProps {
  contratos: ContratoServico[]
  tipoVisualizacao?: 'semanal' | 'mensal'
}

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface DadoMes {
  mes: string
  valor: number
  mesRef: string
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-sm text-blue-600 font-bold">{formatarReais(payload[0].value)}</p>
    </div>
  )
}

export default function GraficoEvolucaoVendas({ contratos }: GraficoEvolucaoVendasProps) {
  const dados = useMemo<DadoMes[]>(() => {
    const hoje = new Date()
    const meses: DadoMes[] = []

    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mesRef = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      meses.push({
        mes: MESES_PT[data.getMonth()],
        mesRef,
        valor: 0,
      })
    }

    const contratosAssinados = contratos.filter(c => c.assinatura_status === 'aprovado')

    for (const contrato of contratosAssinados) {
      const dataRef = contrato.atualizado_em || contrato.criado_em
      if (!dataRef) continue
      const d = new Date(dataRef)
      const mesRef = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const entrada = meses.find(m => m.mesRef === mesRef)
      if (entrada) {
        entrada.valor += contrato.servico_valor ?? 0
      }
    }

    return meses
  }, [contratos])

  const temDados = dados.some(d => d.valor > 0)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Evolucao de Vendas</h2>

      {!temDados ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Nenhuma venda registrada nos ultimos 6 meses
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dados} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `R$ ${(v / 1000).toFixed(0)}k` : `R$ ${v}`
              }
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
