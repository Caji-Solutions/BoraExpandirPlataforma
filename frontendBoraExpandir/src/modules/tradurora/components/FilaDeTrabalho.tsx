import React, { useMemo, useState } from 'react'
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import DeliveryModal from './DeliveryModal'
import { UrgencyBadge, CountdownBadge, SLACard } from './SLAComponents'
import type { TraducaoItem, SLAOverview } from '../types'

interface FilaDeTrabalhoProps {
  traducoes: TraducaoItem[]
  onSubmitTraducao: (traducaoId: string, arquivo: File) => void
}

export default function FilaDeTrabalho({ traducoes, onSubmitTraducao }: FilaDeTrabalhoProps) {
  const [selectedTraducao, setSelectedTraducao] = useState<TraducaoItem | null>(null)

  const slaOverview: SLAOverview = useMemo(() => {
    const agora = new Date()
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const amanhaInicio = new Date(hoje.getTime() + 24 * 60 * 60 * 1000)

    return {
      entregarHoje: traducoes.filter(t => {
        const prazo = new Date(t.prazoSLA)
        return prazo >= hoje && prazo < amanhaInicio && t.status === 'pendente'
      }).length,
      noPrazo: traducoes.filter(t => {
        const prazo = new Date(t.prazoSLA)
        return prazo >= amanhaInicio && t.status === 'pendente'
      }).length,
      atrasados: traducoes.filter(t => {
        const prazo = new Date(t.prazoSLA)
        return prazo < agora && t.status !== 'entregue'
      }).length,
    }
  }, [traducoes])

  const filaPendente = useMemo(() => {
    return traducoes
      .filter(t => t.status === 'pendente')
      .sort((a, b) => new Date(a.prazoSLA).getTime() - new Date(b.prazoSLA).getTime())
  }, [traducoes])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fila de Trabalho</h1>
        <p className="text-gray-600 dark:text-gray-400">Traduções ordenadas por urgência (SLA)</p>
      </div>

      {/* SLA Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SLACard
          titulo="Entregas Hoje"
          valor={slaOverview.entregarHoje}
          icon={<Clock className="h-5 w-5 text-red-600 dark:text-red-400" />}
          cor="bg-red-50 dark:bg-red-500/10"
        />
        <SLACard
          titulo="No Prazo"
          valor={slaOverview.noPrazo}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
          cor="bg-green-50 dark:bg-green-500/10"
        />
        <SLACard
          titulo="Atrasados"
          valor={slaOverview.atrasados}
          icon={<AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
          cor="bg-orange-50 dark:bg-orange-500/10"
        />
      </div>

      {/* Fila de Trabalho Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {filaPendente.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-400 dark:text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Nenhuma tradução pendente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="w-1 px-4 py-3"></th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Idiomas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Prazo (SLA)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Restante</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {filaPendente.map(traducao => (
                  <tr key={traducao.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-4 py-4 pl-2">
                      <UrgencyBadge prazoSLA={traducao.prazoSLA} />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{traducao.documentoNome}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{traducao.clienteNome}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                        {traducao.parIdiomas.origem} → {traducao.parIdiomas.destino}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(traducao.prazoSLA).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <CountdownBadge prazoSLA={traducao.prazoSLA} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTraducao(traducao)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors font-medium"
                      >
                        Traduzir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Modal */}
      <DeliveryModal
        traducao={selectedTraducao}
        onClose={() => setSelectedTraducao(null)}
        onSubmit={onSubmitTraducao}
      />
    </div>
  )
}
