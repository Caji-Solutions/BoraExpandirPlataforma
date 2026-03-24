import { useMemo } from 'react'
import { TrendingUp, Trophy } from 'lucide-react'

interface MetaComissaoCardProps {
  metaMensal: number
  comissaoAtual: number
  comissaoPendente: number
  melhorMesHistorico: number
  mesMelhorMes: string
  mesesAnteriores: { mes: string; comissao: number }[]
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function MetaComissaoCard({
  metaMensal,
  comissaoAtual,
  comissaoPendente,
  melhorMesHistorico,
  mesMelhorMes,
  mesesAnteriores,
}: MetaComissaoCardProps) {
  const totalAtual = comissaoAtual + comissaoPendente
  const progresso = metaMensal > 0 ? Math.min((totalAtual / metaMensal) * 100, 100) : 0

  const projecao = useMemo(() => {
    if (mesesAnteriores.length === 0) return totalAtual
    const ultimos3 = mesesAnteriores.slice(-3)
    const media = ultimos3.reduce((acc, m) => acc + m.comissao, 0) / ultimos3.length
    return media
  }, [mesesAnteriores, totalAtual])

  const projecaoPercentual = metaMensal > 0 ? Math.round((projecao / metaMensal) * 100) : 0
  const percentualRecorde = melhorMesHistorico > 0 ? Math.round((totalAtual / melhorMesHistorico) * 100) : 0

  const progressoColor =
    progresso >= 100
      ? 'bg-emerald-500'
      : progresso >= 70
      ? 'bg-blue-500'
      : progresso >= 40
      ? 'bg-amber-500'
      : 'bg-red-500'

  return (
    <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Meta de Comissão do Mês</h3>
        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">Progresso</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{Math.round(progresso)}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${progressoColor}`}
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* Valores */}
      <div className="mb-3">
        <span className="text-xl font-bold text-gray-900 dark:text-white">{formatBRL(totalAtual)}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400"> de {formatBRL(metaMensal)}</span>
      </div>

      {/* Linha separadora */}
      <div className="border-t border-gray-100 dark:border-neutral-700 pt-3 space-y-2">
        {/* Projeção */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Projeção mensal</span>
          <span className={`font-medium ${projecaoPercentual >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {formatBRL(projecao)} ({projecaoPercentual}% da meta)
          </span>
        </div>

        {/* Recorde */}
        {melhorMesHistorico > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Recorde: {mesMelhorMes}</span>
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatBRL(melhorMesHistorico)}
              {percentualRecorde > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({percentualRecorde}%)</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
