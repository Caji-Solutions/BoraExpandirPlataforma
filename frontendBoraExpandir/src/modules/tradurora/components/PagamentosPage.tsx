import React, { useMemo, useState } from 'react'
import { DollarSign, CheckCircle, TrendingUp, FileCheck, Download, Eye, X, FileText } from 'lucide-react'
import type { OrcamentoItem } from '../types/orcamento'
import { Badge } from '../../../components/ui/Badge'

interface PagamentosPageProps {
  items: OrcamentoItem[]
}

export default function PagamentosPage({ items }: PagamentosPageProps) {
  const [comprovanteModal, setComprovanteModal] = useState<{
    isOpen: boolean
    pagamento: typeof pagamentosCalculados[0] | null
  }>({ isOpen: false, pagamento: null })

  // Transform OrcamentoItems into payment data
  const pagamentosCalculados = useMemo(() => {
    return items
      .filter(item => item.valorOrcamento && item.valorOrcamento > 0)
      .map(item => {
        const valorServico = item.valorOrcamento || 0
        // Translator gets the base value (before markup)
        const valorComissao = valorServico
        return {
          id: item.id,
          documentoNome: item.documentoNome,
          clienteNome: item.clienteNome,
          valorServico,
          valorComissao,
          status: 'pendente' as const, // All delivered items are pending payment by default
          dataEntrega: item.updated_at,
          dependente: item.dependente,
        }
      })
      .sort((a, b) => new Date(b.dataEntrega).getTime() - new Date(a.dataEntrega).getTime())
  }, [items])

  const totalPendente = pagamentosCalculados
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valorComissao, 0)

  const totalGanhos = pagamentosCalculados.reduce((sum, p) => sum + p.valorComissao, 0)
  const traducoesRealizadas = pagamentosCalculados.length

  const statusConfig: Record<'pendente' | 'pago' | 'processando', { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; label: string }> = {
    pendente: { variant: 'warning', label: 'Pendente' },
    pago: { variant: 'success', label: 'Pago' },
    processando: { variant: 'default', label: 'Processando' },
  }

  const handleViewComprovante = (pagamento: typeof pagamentosCalculados[0]) => {
    setComprovanteModal({ isOpen: true, pagamento })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pagamentos</h1>
        <p className="text-gray-600 dark:text-gray-400">Acompanhe seus pagamentos por tradução</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Ganhos */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 p-6 rounded-xl shadow-sm border border-blue-200 dark:border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Ganhos</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            R$ {totalGanhos.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
            Soma de todos os serviços
          </p>
        </div>

        {/* Traduções Realizadas */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/5 p-6 rounded-xl shadow-sm border border-purple-200 dark:border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300">Traduções Realizadas</h3>
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <FileCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {traducoesRealizadas}
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-2">
            Total de documentos traduzidos
          </p>
        </div>

        {/* Pendente */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendente</h3>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            R$ {totalPendente.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Aguardando pagamento
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {pagamentosCalculados.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum pagamento registrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Data Entrega</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {pagamentosCalculados.map(pagamento => (
                  <tr key={pagamento.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{pagamento.documentoNome}</p>
                        {pagamento.dependente?.nome_completo && (
                          <p className="text-xs text-gray-500">{pagamento.dependente.nome_completo}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {pagamento.clienteNome}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      R$ {pagamento.valorComissao.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(pagamento.dataEntrega).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusConfig[pagamento.status].variant}>
                        {statusConfig[pagamento.status].label}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprovante Modal */}
      {comprovanteModal.isOpen && comprovanteModal.pagamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                  <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalhes do Pagamento
                </h3>
              </div>
              <button
                onClick={() => setComprovanteModal({ isOpen: false, pagamento: null })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Documento</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {comprovanteModal.pagamento.documentoNome}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cliente</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {comprovanteModal.pagamento.clienteNome}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Data de Entrega</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(comprovanteModal.pagamento.dataEntrega).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    R$ {comprovanteModal.pagamento.valorComissao.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700/30">
              <button
                onClick={() => setComprovanteModal({ isOpen: false, pagamento: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
