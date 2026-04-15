import React, { useState } from 'react'
import { X, CheckCircle, PenTool } from 'lucide-react'
import type { Contrato } from '@/types/comercial'

interface AssinaturaDigitalProps {
  contrato: Contrato
  onClose: () => void
  onAssinar: (contratoId: string, assinadoPor: string, tipo: 'cliente' | 'empresa') => Promise<void>
}

export default function AssinaturaDigital({ contrato, onClose, onAssinar }: AssinaturaDigitalProps) {
  const [nomeAssinante, setNomeAssinante] = useState('')
  const [tipoAssinatura, setTipoAssinatura] = useState<'cliente' | 'empresa'>('cliente')
  const [aceitoTermos, setAceitoTermos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAssinar = async () => {
    if (!nomeAssinante.trim()) {
      setError('Nome do assinante é obrigatório')
      return
    }

    if (!aceitoTermos) {
      setError('Você deve aceitar os termos para assinar digitalmente')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onAssinar(contrato.id, nomeAssinante, tipoAssinatura)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao assinar contrato')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Contrato Assinado com Sucesso!
          </h3>
          <p className="text-gray-600">
            A assinatura digital foi registrada e o contrato está validado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <PenTool className="h-6 w-6 text-emerald-600" />
            Assinatura Digital de Contrato
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Info do contrato */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{contrato.titulo}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Cliente:</strong> {contrato.cliente?.nome || 'Não especificado'}</p>
              <p><strong>Valor:</strong> R$ {contrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><strong>Status:</strong> {contrato.status}</p>
            </div>
          </div>

          {/* Preview do contrato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documento do Contrato
            </label>
            <div 
              className="border border-gray-300 rounded-lg p-4 bg-white max-h-96 overflow-y-auto text-sm"
              dangerouslySetInnerHTML={{ __html: contrato.conteudo_html }}
            />
          </div>

          {/* Tipo de assinatura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Assinatura
            </label>
            <select
              value={tipoAssinatura}
              onChange={(e) => setTipoAssinatura(e.target.value as 'cliente' | 'empresa')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="cliente">Assinatura do Cliente</option>
              <option value="empresa">Assinatura da Empresa</option>
            </select>
          </div>

          {/* Nome do assinante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo do Assinante *
            </label>
            <input
              type="text"
              value={nomeAssinante}
              onChange={(e) => setNomeAssinante(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Termos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aceitoTermos}
                onChange={(e) => setAceitoTermos(e.target.checked)}
                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Declaro que li e concordo com todos os termos deste contrato. Estou ciente de que esta assinatura digital tem validade jurídica e será registrada com meu IP, data e hora.
              </span>
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAssinar}
              disabled={loading || !aceitoTermos || !nomeAssinante.trim()}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              <PenTool className="h-4 w-4" />
              {loading ? 'Assinando...' : 'Assinar Digitalmente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
