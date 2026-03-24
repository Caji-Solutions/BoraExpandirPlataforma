import React, { useState } from 'react'
import { X, Send, AlertCircle } from 'lucide-react'
import type { RequerimentoFormData } from '../../../types/comercial'

interface RequerimentoSuperadminProps {
  onClose: () => void
  onSave: (requerimento: RequerimentoFormData) => Promise<void>
}

export default function RequerimentoSuperadmin({ onClose, onSave }: RequerimentoSuperadminProps) {
  const [formData, setFormData] = useState<RequerimentoFormData>({
    tipo: 'aprovacao_contrato',
    titulo: '',
    descricao: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validate = (): string | null => {
    if (!formData.titulo.trim()) return 'Título é obrigatório'
    if (!formData.descricao.trim()) return 'Descrição é obrigatória'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar requerimento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            Novo Requerimento ao Superadmin
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            <p className="font-medium">ℹ️ Informação</p>
            <p className="mt-1">
              Use este formulário para solicitar aprovações, ajustes ou reportar situações que precisam de decisão administrativa.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Requerimento *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            >
              <option value="aprovacao_contrato">Aprovação de Contrato</option>
              <option value="ajuste_valor">Ajuste de Valor</option>
              <option value="cancelamento">Cancelamento</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Aprovação de desconto de 15% para cliente XYZ"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição Detalhada *
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva o motivo do requerimento e forneça todos os detalhes relevantes..."
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Seja claro e objetivo. Inclua informações como: cliente envolvido, valor, justificativa, etc.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Enviando...' : 'Enviar Requerimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
