import React, { useState, useMemo, useEffect, useRef } from 'react'
import { X, FileText, Calendar, DollarSign, Send } from 'lucide-react'
import type { OrcamentoItem, OrcamentoFormData } from '../types/orcamento'
import { Badge } from '../../../components/ui/Badge'
import { getDataPrazoPadrao } from '../../../services/comissaoService'

interface OrcamentoModalProps {
  orcamento: OrcamentoItem | null
  onClose: () => void
  onSubmit: (orcamentoId: string, dados: OrcamentoFormData) => void
}

// Converte data de yyyy-mm-dd para dd/mm/yyyy
const formatarDataBR = (dataISO: string): string => {
  if (!dataISO) return ''
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

// Converte data de dd/mm/yyyy para yyyy-mm-dd
const parseDataBR = (dataBR: string): string => {
  if (!dataBR || dataBR.length !== 10) return ''
  const [dia, mes, ano] = dataBR.split('/')
  if (!dia || !mes || !ano) return ''
  return `${ano}-${mes}-${dia}`
}

// Aplica máscara dd/mm/yyyy enquanto digita
const aplicarMascaraData = (valor: string): string => {
  // Remove tudo que não é número
  let numeros = valor.replace(/\D/g, '')
  
  // Limita a 8 caracteres (ddmmyyyy)
  numeros = numeros.slice(0, 8)
  
  // Aplica máscara
  if (numeros.length >= 5) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`
  } else if (numeros.length >= 3) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`
  }
  return numeros
}

export default function OrcamentoModal({ orcamento, onClose, onSubmit }: OrcamentoModalProps) {
  // Inicializa prazo com 5 dias à frente como padrão (formato ISO internamente)
  const [formData, setFormData] = useState<OrcamentoFormData>({
    valorOrcamento: 0,
    prazoEntrega: getDataPrazoPadrao(5), // Prazo padrão: 5 dias à frente (yyyy-mm-dd)
    observacoes: '',
    documentoId: orcamento?.documentoId || '',
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [prazoDisplay, setPrazoDisplay] = useState(() => formatarDataBR(getDataPrazoPadrao(5)))
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Atualiza o documentoId no form quando mudar o orçamento selecionado
  useEffect(() => {
    if (orcamento) {
      setFormData(prev => ({
        ...prev,
        documentoId: orcamento.documentoId
      }))
    }
  }, [orcamento])


  if (!orcamento) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'valorOrcamento' ? parseFloat(value) || 0 : value }))
  }

  // Handler para o campo de data visível (texto com máscara)
  const handleTextDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorMascarado = aplicarMascaraData(e.target.value)
    setPrazoDisplay(valorMascarado)
    
    if (valorMascarado.length === 10) {
      const dataISO = parseDataBR(valorMascarado)
      if (dataISO) {
        setFormData(prev => ({ ...prev, prazoEntrega: dataISO }))
      }
    }
  }

  // Handler para o input de data oculto (calendário)
  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dataISO = e.target.value
    if (dataISO) {
      setFormData(prev => ({ ...prev, prazoEntrega: dataISO }))
      setPrazoDisplay(formatarDataBR(dataISO))
    }
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
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ID</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{orcamento.id}</p>
            </div>
          </div>

          {/* Dados do Documento */}
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="font-semibold text-gray-900 dark:text-white">{orcamento.documentoNome}</p>
              </div>
              {orcamento.publicUrl && (
                <a
                  href={orcamento.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Download
                </a>
              )}
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
                Seu Valor (R$)
              </label>
              <input
                type="number"
                name="valorOrcamento"
                value={formData.valorOrcamento || ''}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Digite o valor que você irá receber"
                className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
            </div>

            <div 
              className="group relative"
            >
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-blue-600 transition-colors">
                <Calendar className="h-4 w-4" />
                Prazo de Entrega
              </label>
              <div 
                className="relative cursor-pointer"
                onClick={() => dateInputRef.current?.showPicker()}
              >
                <input
                  type="text"
                  value={prazoDisplay}
                  onChange={handleTextDataChange}
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <input
                  ref={dateInputRef}
                  type="date"
                  tabIndex={-1}
                  onChange={handleCalendarChange}
                  className="absolute opacity-0 pointer-events-none inset-0 p-0 m-0 w-full h-full"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Clique para abrir o calendário ou digite dd/mm/yyyy
              </p>
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
