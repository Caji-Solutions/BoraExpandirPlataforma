import { Trophy, Flame, Star } from 'lucide-react'

interface RecordsPessoaisCardProps {
  melhorMes: { mes: string; valor: number }
  mesesPositivosSequencia: number
  top3MaioresComissoes: {
    id: string
    cliente_nome: string
    servico: string
    valor_comissao: number
    data_venda: string
  }[]
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const medalColors = [
  'text-amber-500',
  'text-gray-400 dark:text-gray-500',
  'text-orange-600 dark:text-orange-500',
]

export default function RecordsPessoaisCard({
  melhorMes,
  mesesPositivosSequencia,
  top3MaioresComissoes,
}: RecordsPessoaisCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Records Pessoais</h3>
        <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
          <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Melhor mês */}
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-100 dark:border-amber-500/20">
          <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Melhor mês histórico</p>
            <p className="text-base font-bold text-amber-800 dark:text-amber-300">{formatBRL(melhorMes.valor)}</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 truncate">{melhorMes.mes}</p>
          </div>
        </div>

        {/* Sequência de meses positivos */}
        <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-100 dark:border-orange-500/20">
          <Flame className="h-5 w-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">Sequência positiva</p>
            <p className="text-base font-bold text-orange-800 dark:text-orange-300">
              {mesesPositivosSequencia} {mesesPositivosSequencia === 1 ? 'mês' : 'meses'} consecutivos
            </p>
          </div>
        </div>

        {/* Top 3 maiores comissões */}
        {top3MaioresComissoes.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Top 3 Maiores</p>
            </div>
            <div className="space-y-2">
              {top3MaioresComissoes.map((comissao, index) => (
                <div key={comissao.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold ${medalColors[index]} shrink-0`}>#{index + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                        {comissao.cliente_nome}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{comissao.servico}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatBRL(comissao.valor_comissao)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(comissao.data_venda).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
