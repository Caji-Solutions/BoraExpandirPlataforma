import { AlertTriangle } from 'lucide-react'

interface AlertaComissoesRiscoProps {
  comissoesCanceladas: {
    id: string
    cliente_nome: string
    servico: string
    valor_comissao: number
    data_venda: string
  }[]
  onVerDetalhes?: (comissaoId: string) => void
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AlertaComissoesRisco({
  comissoesCanceladas,
  onVerDetalhes,
}: AlertaComissoesRiscoProps) {
  if (comissoesCanceladas.length === 0) return null

  const totalPerdido = comissoesCanceladas.reduce((acc, c) => acc + c.valor_comissao, 0)

  return (
    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-1.5 bg-red-100 dark:bg-red-500/20 rounded-lg shrink-0 mt-0.5">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Comissoes em Risco</h3>
          <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
            {comissoesCanceladas.length} {comissoesCanceladas.length === 1 ? 'comissao foi cancelada' : 'comissoes foram canceladas'} neste mes
          </p>
          <p className="text-base font-bold text-red-800 dark:text-red-300 mt-1">
            {formatBRL(totalPerdido)} perdidos
          </p>
        </div>
      </div>

      <div className="space-y-2 mt-3 border-t border-red-200 dark:border-red-500/20 pt-3">
        {comissoesCanceladas.map((comissao) => (
          <div
            key={comissao.id}
            className={`flex items-center justify-between gap-3 ${onVerDetalhes ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={() => onVerDetalhes?.(comissao.id)}
          >
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-red-500 dark:text-red-400 text-xs mt-0.5 shrink-0">•</span>
              <div className="min-w-0">
                <span className="text-sm text-red-800 dark:text-red-300 font-medium truncate block">
                  {comissao.cliente_nome}
                </span>
                <span className="text-xs text-red-600 dark:text-red-400 truncate block">{comissao.servico}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                {formatBRL(comissao.valor_comissao)}
              </span>
              <span className="text-xs text-red-500 dark:text-red-500 block">cancelado</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
