import React, { useMemo } from 'react'
import { DollarSign, Copy, CheckCircle } from 'lucide-react'
import type { TraducaoItem } from '../types'

interface PagamentosPageProps {
  traducoes: TraducaoItem[]
}

interface Pagamento {
  id: string
  traducaoId: string
  documentoNome: string
  clienteNome: string
  valor: number
  status: 'pendente' | 'processando' | 'pago'
  dataEntrega: string
}

const mockPagamentos: Pagamento[] = [
  {
    id: '1',
    traducaoId: '1',
    documentoNome: 'Certidão de Nascimento',
    clienteNome: 'Cliente A',
    valor: 150.00,
    status: 'pendente',
    dataEntrega: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    traducaoId: '2',
    documentoNome: 'Contrato Comercial',
    clienteNome: 'Cliente B',
    valor: 350.00,
    status: 'pago',
    dataEntrega: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    traducaoId: '3',
    documentoNome: 'Manual Técnico',
    clienteNome: 'Cliente C',
    valor: 500.00,
    status: 'pago',
    dataEntrega: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function PagamentosPage({ traducoes }: PagamentosPageProps) {
  const pagamentos = useMemo(() => {
    return mockPagamentos.sort((a, b) => new Date(b.dataEntrega).getTime() - new Date(a.dataEntrega).getTime())
  }, [])

  const totalPendente = pagamentos
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor, 0)

  const totalPago = pagamentos
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor, 0)

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
      case 'pago':
        return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
      case 'processando':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
      default:
        return 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pagamentos</h1>
        <p className="text-gray-600 dark:text-gray-400">Acompanhe seus pagamentos por tradução</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pago</h3>
            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            R$ {totalPago.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {/* Pagamentos Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Data Entrega</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {pagamentos.map(pagamento => (
                <tr key={pagamento.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{pagamento.documentoNome}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {pagamento.clienteNome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(pagamento.dataEntrega).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    R$ {pagamento.valor.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(pagamento.status)}`}>
                      {pagamento.status === 'pendente' && 'Pendente'}
                      {pagamento.status === 'pago' && 'Pago'}
                      {pagamento.status === 'processando' && 'Processando'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
