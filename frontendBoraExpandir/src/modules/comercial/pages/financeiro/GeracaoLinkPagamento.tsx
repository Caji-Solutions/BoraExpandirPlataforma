import React, { useState } from 'react'
import { X, Save, Link as LinkIcon, Calendar, DollarSign } from 'lucide-react'
import type { LinkPagamentoFormData, Contrato } from '../../../types/comercial'

interface GeracaoLinkPagamentoProps {
  onClose: () => void
  onSave: (linkPagamento: LinkPagamentoFormData) => Promise<void>
  contratos: Contrato[]
}

export default function GeracaoLinkPagamento({ onClose, onSave, contratos }: GeracaoLinkPagamentoProps) {
  const [formData, setFormData] = useState<LinkPagamentoFormData>({
    contrato_id: '',
    valor: 0,
    descricao: '',
    expira_em: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'valor' ? parseFloat(value) || 0 : value 
    }))
  }

  const validate = (): string | null => {
    if (!formData.contrato_id) return 'Selecione um contrato'
    if (formData.valor <= 0) return 'Valor deve ser maior que zero'
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
      setError(err.message || 'Erro ao gerar link de pagamento')
    } finally {
      setLoading(false)
    }
  }

  const contratoSelecionado = contratos.find(c => c.id === formData.contrato_id)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Gerar Link de Pagamento</h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contrato *
            </label>
            <select
              name="contrato_id"
              value={formData.contrato_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            >
              <option value="">Selecione um contrato</option>
              {contratos.map(contrato => (
                <option key={contrato.id} value={contrato.id}>
                  {contrato.titulo} - {contrato.cliente?.nome || 'Cliente não identificado'}
                </option>
              ))}
            </select>
          </div>

          {contratoSelecionado && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
              <p><strong>Cliente:</strong> {contratoSelecionado.cliente?.nome}</p>
              <p><strong>Valor do contrato:</strong> R$ {contratoSelecionado.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><strong>Status:</strong> {contratoSelecionado.status}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Valor do Pagamento (R$) *
            </label>
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Pode ser o valor total do contrato ou uma parcela
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Pagamento *
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Ex: Pagamento da 1ª parcela - Consultoria Empresarial"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Data de Expiração (Opcional)
            </label>
            <input
              type="date"
              name="expira_em"
              value={formData.expira_em}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se não definir, o link não terá data de expiração
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
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
