import React, { useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, Folder, FileText } from 'lucide-react'
import type { TraducaoItem } from '../types'
import { Badge } from '../../../components/ui/Badge'

interface EntreguesPageProps {
  traducoes: TraducaoItem[]
}

interface ClienteGroup {
  clienteNome: string
  traducoes: TraducaoItem[]
}

export default function EntreguesPage({ traducoes }: EntreguesPageProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  const clientesAgrupados = useMemo(() => {
    const entregues = traducoes
      .filter(t => t.status === 'entregue')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    // Agrupar por cliente
    const grupos = entregues.reduce((acc, traducao) => {
      const cliente = traducao.clienteNome
      if (!acc[cliente]) {
        acc[cliente] = []
      }
      acc[cliente].push(traducao)
      return acc
    }, {} as Record<string, TraducaoItem[]>)

    // Converter para array e ordenar por número de traduções
    return Object.entries(grupos)
      .map(([clienteNome, traducoes]) => ({
        clienteNome,
        traducoes,
      }))
      .sort((a, b) => b.traducoes.length - a.traducoes.length)
  }, [traducoes])

  const toggleClient = (clienteNome: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev)
      if (newSet.has(clienteNome)) {
        newSet.delete(clienteNome)
      } else {
        newSet.add(clienteNome)
      }
      return newSet
    })
  }

  const totalEntregues = clientesAgrupados.reduce((acc, grupo) => acc + grupo.traducoes.length, 0)

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entregues</h1>
          {totalEntregues > 0 && (
            <Badge variant="success">
              {totalEntregues} {totalEntregues === 1 ? 'tradução' : 'traduções'}
            </Badge>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">Histórico de traduções concluídas agrupadas por cliente</p>
      </div>

      {clientesAgrupados.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Nenhuma tradução entregue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientesAgrupados.map(grupo => {
            const isExpanded = expandedClients.has(grupo.clienteNome)
            
            return (
              <div
                key={grupo.clienteNome}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden"
              >
                {/* Header da Pasta do Cliente */}
                <button
                  onClick={() => toggleClient(grupo.clienteNome)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                    <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {grupo.clienteNome}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {grupo.traducoes.length} {grupo.traducoes.length === 1 ? 'documento' : 'documentos'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {grupo.traducoes.length}
                  </Badge>
                </button>

                {/* Conteúdo Expansível */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-neutral-700">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                              Documento
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                              Idiomas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                              Data Entrega
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                          {grupo.traducoes.map(traducao => (
                            <tr
                              key={traducao.id}
                              className="hover:bg-gray-50 dark:hover:bg-neutral-700/30 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {traducao.documentoNome}
                                  </p>
                                </div>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
