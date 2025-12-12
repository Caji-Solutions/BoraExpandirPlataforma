import React, { useMemo, useState } from 'react'
import { FileText, Mail, Phone, Calendar, Send } from 'lucide-react'
import OrcamentoModal from './OrcamentoModal'
import type { OrcamentoItem, OrcamentoFormData } from '../types/orcamento'

interface OrcamentosPageProps {
  orcamentos: OrcamentoItem[]
  onResponderOrcamento: (orcamentoId: string, dados: OrcamentoFormData) => void
}

const statusColors: Record<OrcamentoItem['status'], { badge: string; text: string; label: string }> = {
  pendente: {
    badge: 'bg-yellow-100 dark:bg-yellow-500/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    label: 'Pendente',
  },
  respondido: {
    badge: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    label: 'Respondido',
  },
  aceito: {
    badge: 'bg-green-100 dark:bg-green-500/20',
    text: 'text-green-700 dark:text-green-400',
    label: 'Aceito',
  },
  recusado: {
    badge: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
              {pendentesCount} {pendentesCount === 1 ? 'pendente' : 'pendentes'}
            </span>
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
      <div className="space-y-4">
        {filteredOrcamentos.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'todos' ? 'Nenhum orçamento encontrado' : `Nenhum orçamento ${statusColors[filter as OrcamentoItem['status']].label.toLowerCase()}`}
            </p>
          </div>
        ) : (
          filteredOrcamentos.map(orcamento => (
            <div
              key={orcamento.id}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {orcamento.documentoNome}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 mt-1">
                        {orcamento.parIdiomas.origem} → {orcamento.parIdiomas.destino}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[orcamento.status].badge} ${statusColors[orcamento.status].text}`}>
                      {statusColors[orcamento.status].label}
                    </span>
                  </div>

                  {/* Cliente Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{orcamento.clienteNome}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{orcamento.clienteEmail}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{orcamento.clienteTelefone}</span>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {orcamento.numeroPaginas && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Páginas:</span>{' '}
                        <span className="font-medium text-gray-900 dark:text-white">{orcamento.numeroPaginas}</span>
                      </div>
                    )}
                    {orcamento.numeroPalavras && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Palavras:</span>{' '}
                        <span className="font-medium text-gray-900 dark:text-white">{orcamento.numeroPalavras}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">Prazo desejado:</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(orcamento.prazoDesejado).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Valor do Orçamento (se já respondido) */}
                  {orcamento.valorOrcamento && (
                    <div className="bg-gray-50 dark:bg-neutral-700/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Orçamento enviado:</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        R$ {orcamento.valorOrcamento.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Entrega: {orcamento.prazoEntrega ? new Date(orcamento.prazoEntrega).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Ação */}
                {orcamento.status === 'pendente' && (
                  <button
                    onClick={() => setSelectedOrcamento(orcamento)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                  >
                    <Send className="h-4 w-4" />
                    Responder
                  </button>
                )}
              </div>
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
