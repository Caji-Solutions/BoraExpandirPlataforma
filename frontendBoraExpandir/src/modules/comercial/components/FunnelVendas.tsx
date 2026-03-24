import React from 'react'
import { TrendingDown } from 'lucide-react'

interface FunilVendasProps {
  leadsCount: number
  agendamentosCount: number
  contratosGeradosCount: number
  contratosAssinadosCount: number
  pagamentosConfirmadosCount: number
}

interface Etapa {
  label: string
  count: number
  color: string
  bgColor: string
  borderColor: string
}

function calcDrop(atual: number, anterior: number): string {
  if (anterior === 0) return '-'
  const drop = Math.round(((anterior - atual) / anterior) * 100)
  return `-${drop}%`
}

export default function FunnelVendas({
  leadsCount,
  agendamentosCount,
  contratosGeradosCount,
  contratosAssinadosCount,
  pagamentosConfirmadosCount,
}: FunilVendasProps) {
  const etapas: Etapa[] = [
    { label: 'Leads', count: leadsCount, color: 'text-blue-700', bgColor: 'bg-blue-500', borderColor: 'border-blue-200' },
    { label: 'Agendamentos', count: agendamentosCount, color: 'text-cyan-700', bgColor: 'bg-cyan-500', borderColor: 'border-cyan-200' },
    { label: 'Contratos Gerados', count: contratosGeradosCount, color: 'text-teal-700', bgColor: 'bg-teal-500', borderColor: 'border-teal-200' },
    { label: 'Contratos Assinados', count: contratosAssinadosCount, color: 'text-emerald-700', bgColor: 'bg-emerald-500', borderColor: 'border-emerald-200' },
    { label: 'Pagamento Confirmado', count: pagamentosConfirmadosCount, color: 'text-green-700', bgColor: 'bg-green-600', borderColor: 'border-green-200' },
  ]

  const maxCount = Math.max(leadsCount, 1)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Funil de Vendas</h2>
      <div className="space-y-3">
        {etapas.map((etapa, index) => {
          const largura = Math.max((etapa.count / maxCount) * 100, etapa.count > 0 ? 4 : 0)
          const drop = index > 0 ? calcDrop(etapa.count, etapas[index - 1].count) : null

          return (
            <div key={etapa.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{etapa.label}</span>
                <div className="flex items-center gap-3">
                  {drop && (
                    <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                      <TrendingDown className="h-3 w-3" />
                      {drop}
                    </span>
                  )}
                  <span className={`text-sm font-bold ${etapa.color}`}>{etapa.count}</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-6 rounded-full transition-all duration-500 ${etapa.bgColor}`}
                  style={{ width: `${largura}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
