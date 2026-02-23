import React, { useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, Folder, FileText, ExternalLink } from 'lucide-react'
import type { OrcamentoItem } from '../types/orcamento'
import { Badge } from '../../../components/ui/Badge'

interface EntreguesPageProps {
  items: OrcamentoItem[]
}

interface ClienteGroup {
  clienteNome: string
  items: OrcamentoItem[]
}

export default function EntreguesPage({ items }: EntreguesPageProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  const clientesAgrupados = useMemo(() => {
    const sorted = [...items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    // Group by client
    const grupos = sorted.reduce((acc, item) => {
      const cliente = item.clienteNome
      if (!acc[cliente]) {
        acc[cliente] = []
      }
      acc[cliente].push(item)
      return acc
    }, {} as Record<string, OrcamentoItem[]>)

    return Object.entries(grupos)
      .map(([clienteNome, groupItems]) => ({
        clienteNome,
        items: groupItems,
      }))
      .sort((a, b) => b.items.length - a.items.length)
  }, [items])

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

  const totalEntregues = clientesAgrupados.reduce((acc, grupo) => acc + grupo.items.length, 0)

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
          <p className="text-gray-600 dark:text-gray-400">Nenhuma tradução entregue ainda</p>
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
                {/* Client Folder Header */}
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
                        {grupo.items.length} {grupo.items.length === 1 ? 'documento' : 'documentos'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {grupo.items.length}
                  </Badge>
                </button>

                {/* Expandable Content */}
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
                              Data Entrega
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                              Valor
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                              Original
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                          {grupo.items.map(item => (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50 dark:hover:bg-neutral-700/30 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {item.documentoNome}
                                    </p>
                                    {item.dependente?.nome_completo && (
                                      <p className="text-xs text-gray-500">{item.dependente.nome_completo}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                {new Date(item.updated_at).toLocaleString('pt-BR', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                {item.valorOrcamento ? (
                                  `R$ ${item.valorOrcamento.toFixed(2).replace('.', ',')}`
                                ) : '—'}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {item.publicUrl ? (
                                  <button
                                    onClick={() => window.open(item.publicUrl, '_blank')}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver
                                  </button>
                                ) : '—'}
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
