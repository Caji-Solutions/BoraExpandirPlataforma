import React, { useState } from 'react'
import { X, FileText, Calendar, DollarSign, Send } from 'lucide-react'
import type { OrcamentoItem, OrcamentoFormData } from '../types/orcamento'
import { Badge } from '../../../components/ui/Badge'

interface OrcamentoModalProps {
  orcamento: OrcamentoItem | null
  onClose: () => void
  onSubmit: (orcamentoId: string, dados: OrcamentoFormData) => void
}

export default function OrcamentoModal({ orcamento, onClose, onSubmit }: OrcamentoModalProps) {
  const [formData, setFormData] = useState<OrcamentoFormData>({
    valorOrcamento: 0,
    prazoEntrega: '',
    observacoes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  if (!orcamento) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'valorOrcamento' ? parseFloat(value) || 0 : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.valorOrcamento || !formData.prazoEntrega) return
    
    setSubmitting(true)
    try {
      onSubmit(orcamento.id, formData)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Responder Orçamento
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dados do Cliente */}
          <div className="bg-gray-50 dark:bg-neutral-700/50 p-4 rounded-lg space-y-2">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cliente</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{orcamento.clienteNome}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{orcamento.clienteEmail}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Telefone</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{orcamento.clienteTelefone}</p>
              </div>
            </div>
          </div>

          {/* Dados do Documento */}
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="font-semibold text-gray-900 dark:text-white">{orcamento.documentoNome}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Par de Idiomas</p>
                <Badge variant="default" className="mt-1">
                  {orcamento.parIdiomas.origem} → {orcamento.parIdiomas.destino}
                </Badge>
              </div>
              {orcamento.numeroPaginas && (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Páginas</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{orcamento.numeroPaginas}</p>
                </div>
              )}
              {orcamento.numeroPalavras && (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Palavras</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{orcamento.numeroPalavras}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Prazo Desejado</p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {new Date(orcamento.prazoDesejado).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            {orcamento.observacoes && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Observações do Cliente</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{orcamento.observacoes}</p>
              </div>
            )}
          </div>

          {/* Formulário de Orçamento */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="h-4 w-4" />
                Valor do Orçamento (R$)
              </label>
              <input
                type="number"
                name="valorOrcamento"
                value={formData.valorOrcamento || ''}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4" />
                Prazo de Entrega
              </label>
              <input
                type="date"
                name="prazoEntrega"
                value={formData.prazoEntrega}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Observações (opcional)
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                placeholder="Informações adicionais sobre o orçamento..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Enviando...' : 'Enviar Orçamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
