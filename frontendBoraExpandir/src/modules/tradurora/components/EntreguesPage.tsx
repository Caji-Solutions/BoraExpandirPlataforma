import React, { useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { TraducaoItem } from '../types'
import { Badge } from '../../../components/ui/Badge'

interface EntreguesPageProps {
  traducoes: TraducaoItem[]
}

export default function EntreguesPage({ traducoes }: EntreguesPageProps) {
  const entregues = useMemo(() => {
    return traducoes
      .filter(t => t.status === 'entregue')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [traducoes])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Entregues</h1>
        <p className="text-gray-600 dark:text-gray-400">Histórico de traduções concluídas</p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {entregues.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Nenhuma tradução entregue</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Idiomas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Data Entrega</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {entregues.map(traducao => (
                  <tr key={traducao.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{traducao.documentoNome}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">
                        {traducao.parIdiomas.origem} → {traducao.parIdiomas.destino}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(traducao.updated_at).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {traducao.clienteNome}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
