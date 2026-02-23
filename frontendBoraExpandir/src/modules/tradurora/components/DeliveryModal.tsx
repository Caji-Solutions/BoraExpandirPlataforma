import React, { useState } from 'react'
import { X, Upload, AlertTriangle, ExternalLink } from 'lucide-react'
import type { OrcamentoItem } from '../types/orcamento'
import { compressFile } from '../../../utils/compressFile'

interface DeliveryModalProps {
  item: OrcamentoItem
  onClose: () => void
  onSubmit: (documentoId: string, arquivo: File) => Promise<void>
}

export default function DeliveryModal({ item, onClose, onSubmit }: DeliveryModalProps) {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [revisada, setRevisada] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setArquivo(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivo(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!arquivo || !revisada) return
    setUploading(true)
    try {
      const compressedArquivo = await compressFile(arquivo)
      await onSubmit(item.documentoId, compressedArquivo)
      setArquivo(null)
      setRevisada(false)
      onClose()
    } catch (error) {
      console.error('Erro ao enviar tradução:', error)
      alert('Erro ao enviar tradução. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Entregar Tradução
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
          {/* Document Info */}
          <div className="bg-gray-50 dark:bg-neutral-700/50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Informações do Documento</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.documentoNome}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cliente: {item.clienteNome}
              {item.dependente?.nome_completo && ` — Membro: ${item.dependente.nome_completo}`}
            </p>
            {item.prazoEntrega && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Prazo: {new Date(item.prazoEntrega).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {/* Link to Original Document */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Documento Original</p>
            {item.publicUrl ? (
              <button
                onClick={() => window.open(item.publicUrl, '_blank')}
                className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
              >
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  📄 {item.documentoNome}
                </span>
                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-neutral-700/50 border border-gray-200 dark:border-neutral-600 rounded-lg">
                <span className="text-sm text-gray-500">Documento original não disponível</span>
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Enviar Tradução</p>

            {!arquivo ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 dark:bg-neutral-700/50"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".pdf,.docx,.doc,.txt"
                />
                <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Arraste ou clique para enviar
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Formatos suportados: PDF, DOCX, DOC, TXT
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-neutral-700/50 border border-gray-200 dark:border-neutral-600 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {arquivo.name}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>Tamanho: {(arquivo.size / 1024).toFixed(2)} KB</span>
                      <span>•</span>
                      <span>Tipo: {arquivo.type || 'Desconhecido'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setArquivo(null)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
                    title="Remover arquivo"
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={revisada}
              onChange={e => setRevisada(e.target.checked)}
              className="w-4 h-4 mt-1 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              ✓ Confirmo que a tradução foi revisada e está completa
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!arquivo || !revisada || uploading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? 'Enviando...' : 'Enviar Tradução'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
