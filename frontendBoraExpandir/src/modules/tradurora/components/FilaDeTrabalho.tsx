import React, { useMemo, useState } from 'react'
import { Clock, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'
import DeliveryModal from './DeliveryModal'
import type { OrcamentoItem } from '../types/orcamento'
import { Badge } from '../../../components/ui/Badge'

interface FilaDeTrabalhoProps {
  items: OrcamentoItem[]
  onSubmitTraducao: (documentoId: string, arquivo: File) => Promise<void>
}

export default function FilaDeTrabalho({ items, onSubmitTraducao }: FilaDeTrabalhoProps) {
  const [selectedItem, setSelectedItem] = useState<OrcamentoItem | null>(null)

  const slaOverview = useMemo(() => {
    const agora = new Date()
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const amanhaInicio = new Date(hoje.getTime() + 24 * 60 * 60 * 1000)

    return {
      entregarHoje: items.filter(t => {
        if (!t.prazoEntrega) return false
        const prazo = new Date(t.prazoEntrega)
        return prazo >= hoje && prazo < amanhaInicio
      }).length,
      noPrazo: items.filter(t => {
        if (!t.prazoEntrega) return true // no deadline = on time
        const prazo = new Date(t.prazoEntrega)
        return prazo >= amanhaInicio
      }).length,
      atrasados: items.filter(t => {
        if (!t.prazoEntrega) return false
        const prazo = new Date(t.prazoEntrega)
        return prazo < agora
      }).length,
    }
  }, [items])

  const filaPendente = useMemo(() => {
    return [...items].sort((a, b) => {
      // Sort by deadline, items without deadline go last
      if (!a.prazoEntrega && !b.prazoEntrega) return 0
      if (!a.prazoEntrega) return 1
      if (!b.prazoEntrega) return -1
      return new Date(a.prazoEntrega).getTime() - new Date(b.prazoEntrega).getTime()
    })
  }, [items])

  const handleSubmit = async (documentoId: string, arquivo: File) => {
    await onSubmitTraducao(documentoId, arquivo)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fila de Trabalho</h1>
        <p className="text-gray-600 dark:text-gray-400">Traduções aprovadas aguardando entrega</p>
      </div>

      {/* SLA Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-xl shadow-sm border border-red-200 dark:border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-900 dark:text-red-300">Entregas Hoje</h3>
            <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">{slaOverview.entregarHoje}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-500/10 p-6 rounded-xl shadow-sm border border-green-200 dark:border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-300">No Prazo</h3>
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{slaOverview.noPrazo}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-500/10 p-6 rounded-xl shadow-sm border border-orange-200 dark:border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-900 dark:text-orange-300">Atrasados</h3>
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{slaOverview.atrasados}</p>
        </div>
      </div>

      {/* Work Queue Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {filaPendente.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-400 dark:text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Nenhuma tradução pendente na fila</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Prazo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Original</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {filaPendente.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.documentoNome}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.dependente?.nome_completo || item.clienteNome}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.clienteNome}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.prazoEntrega ? (
                        new Date(item.prazoEntrega).toLocaleDateString('pt-BR')
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.publicUrl ? (
                        <button
                          onClick={() => window.open(item.publicUrl, '_blank')}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver Original
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
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
      {selectedItem && (
        <DeliveryModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
