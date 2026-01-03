import React, { useMemo, useState } from 'react'
import { FileText, Calendar, Send } from 'lucide-react'
import OrcamentoModal from './OrcamentoModal'
import type { OrcamentoItem, OrcamentoFormData } from '../types/orcamento'
import { Badge } from '../../../components/ui/Badge'

interface OrcamentosPageProps {
  orcamentos: OrcamentoItem[]
  onResponderOrcamento: (orcamentoId: string, dados: OrcamentoFormData) => void
}

const statusConfig: Record<OrcamentoItem['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; label: string }> = {
  pendente: {
    variant: 'warning',
    label: 'Pendente',
  },
  respondido: {
    variant: 'default',
    label: 'Respondido',
  },
  aceito: {
    variant: 'success',
    label: 'Aceito',
  },
  recusado: {
    variant: 'destructive',
    label: 'Recusado',
  },
}

export default function OrcamentosPage({ orcamentos, onResponderOrcamento }: OrcamentosPageProps) {
  const [selectedOrcamento, setSelectedOrcamento] = useState<OrcamentoItem | null>(null)
  const [filter, setFilter] = useState<'todos' | OrcamentoItem['status']>('todos')

  const filteredOrcamentos = useMemo(() => {
    return orcamentos
      .filter(o => filter === 'todos' ? true : o.status === filter)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [orcamentos, filter])

  const pendentesCount = orcamentos.filter(o => o.status === 'pendente').length

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orçamentos</h1>
          {pendentesCount > 0 && (
            <Badge variant="warning">
              {pendentesCount} {pendentesCount === 1 ? 'pendente' : 'pendentes'}
            </Badge>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">Solicitações de orçamento dos clientes</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === 'todos'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('pendente')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === 'pendente'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('respondido')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === 'respondido'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
          }`}
        >
          Respondidos
        </button>
        <button
          onClick={() => setFilter('aceito')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === 'aceito'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
          }`}
        >
          Aceitos
        </button>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrcamentos.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'todos' ? 'Nenhum orçamento encontrado' : `Nenhum orçamento ${statusConfig[filter as OrcamentoItem['status']].label.toLowerCase()}`}
            </p>
          </div>
        ) : (
          filteredOrcamentos.map(orcamento => (
            <div
              key={orcamento.id}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-all hover:scale-[1.02] flex flex-col"
            >
              {/* Header com Status */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <Badge variant={statusConfig[orcamento.status].variant}>
                  {statusConfig[orcamento.status].label}
                </Badge>
                <Badge variant="default" className="text-xs">
                  {orcamento.parIdiomas.origem} → {orcamento.parIdiomas.destino}
                </Badge>
              </div>

              {/* Documento */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-1">
                    {orcamento.documentoNome}
                  </h3>
                </div>
              </div>

              {/* Cliente Info - Apenas Nome e ID */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{orcamento.clienteNome}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {orcamento.id.slice(0, 8)}...</p>
              </div>

              {/* Detalhes do Documento */}
              <div className="space-y-2 mb-4 flex-1">
                {orcamento.numeroPaginas && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Páginas:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{orcamento.numeroPaginas}</span>
                  </div>
                )}
                {orcamento.numeroPalavras && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Palavras:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{orcamento.numeroPalavras}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Prazo:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(orcamento.prazoDesejado).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Valor do Orçamento (se já respondido) */}
              {orcamento.valorOrcamento && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg mb-4">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Orçamento enviado</p>
                  <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300">
                    R$ {orcamento.valorOrcamento.toFixed(2).replace('.', ',')}
                  </p>
                  {orcamento.prazoEntrega && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Entrega: {new Date(orcamento.prazoEntrega).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              )}

              {/* Ação */}
              {orcamento.status === 'pendente' && (
                <button
                  onClick={() => setSelectedOrcamento(orcamento)}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Responder
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <OrcamentoModal
        orcamento={selectedOrcamento}
        onClose={() => setSelectedOrcamento(null)}
        onSubmit={onResponderOrcamento}
      />
    </div>
  )
}
