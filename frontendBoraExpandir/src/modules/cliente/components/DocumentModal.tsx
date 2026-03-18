import { X, FileText, Download, Calendar, User } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Document } from '../types'
import { formatDate, formatFileSize } from '../lib/utils'

interface DocumentModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
}

const statusConfig: Record<Document['status'], {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  description: string;
}> = {
  pending: {
    label: 'Aguardando Envio',
    variant: 'warning',
    description: 'Este documento ainda não foi enviado.',
  },
  analyzing: {
    label: 'Aguardando Análise',
    variant: 'default',
    description: 'Nossa equipe está revisando este documento.',
  },
  approved: {
    label: 'Aprovado',
    variant: 'success',
    description: 'Documento aprovado e sendo processado.',
  },
  rejected: {
    label: 'Rejeitado',
    variant: 'destructive',
    description: 'Documento rejeitado e precisa ser reenviado.',
  },
  waiting_apostille: {
    label: 'Aguardando Apostilamento',
    variant: 'warning',
    description: 'O documento está aguardando o processo de apostilamento.',
  },
  analyzing_apostille: {
    label: 'Aguardando Análise',
    variant: 'default',
    description: 'Estamos analisando a apostila do documento.',
  },
  waiting_translation: {
    label: 'Aguardando Tradução',
    variant: 'warning',
    description: 'O documento está aguardando tradução juramentada.',
  },
  analyzing_translation: {
    label: 'Aguardando Análise',
    variant: 'default',
    description: 'Estamos analisando a tradução do documento.',
  },
  waiting_translation_quote: {
    label: 'Aguardando Orçamento',
    variant: 'warning',
    description: 'Estamos aguardando o orçamento da tradução.',
  },
  waiting_quote_approval: {
    label: 'Aguardando Aprovação',
    variant: 'warning',
    description: 'O orçamento da tradução está aguardando sua aprovação.',
  },
  waiting_apostille_quote: {
    label: 'Aguardando Orçamento',
    variant: 'warning',
    description: 'Estamos aguardando o orçamento do apostilamento.',
  },
  sent_for_apostille: {
    label: 'Enviado para Apostila',
    variant: 'default',
    description: 'O documento foi enviado para o processo de apostilamento.',
  },
  ANALYZING_APOSTILLE_PAYMENT: {
    label: 'Análise de Pagamento',
    variant: 'warning',
    description: 'Estamos verificando o pagamento do seu apostilamento.',
  },
  ANALYZING_TRANSLATION_PAYMENT: {
    label: 'Análise de Pagamento',
    variant: 'warning',
    description: 'Estamos verificando o pagamento da sua tradução.',
  },
  analyzing_translation_payment: {
    label: 'Análise de Pagamento',
    variant: 'warning',
    description: 'Seu pagamento está sendo analisado pela nossa equipe.',
  },
  EXECUTING_APOSTILLE: {
    label: 'Em Apostilamento',
    variant: 'default',
    description: 'Seu documento está em processo de apostilamento.',
  },
  EXECUTING_TRANSLATION: {
    label: 'Em Tradução',
    variant: 'default',
    description: 'Seu documento está em processo de tradução juramentada.',
  },
  aguardando_pagamento: {
    label: 'Aguardando Pagamento',
    variant: 'warning',
    description: 'O pagamento do serviço está sendo aguardado.',
  },
  pronto_para_apostilagem: {
    label: 'Pronto para Apostila',
    variant: 'success',
    description: 'O pagamento foi aprovado e o documento seguiu para o cartório.',
  },
}

export function DocumentModal({ document, isOpen, onClose }: DocumentModalProps) {
  if (!isOpen || !document) return null

  const config = statusConfig[document.status]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">{document.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Status do Documento</h3>
              <Badge variant={config.variant} className="text-sm">
                {config.label}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tipo</p>
              <p className="font-medium text-gray-900">{document.type}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600">{config.description}</p>
          </div>

          {/* File Info */}
          {document.fileName && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Informações do Arquivo</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nome do arquivo:</span>
                  <span className="text-sm font-medium text-gray-900">{document.fileName}</span>
                </div>
                {document.fileSize && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tamanho:</span>
                    <span className="text-sm font-medium text-gray-900">{formatFileSize(document.fileSize)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data de envio:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(document.uploadDate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {document.status === 'rejected' && document.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Motivo da Rejeição</h4>
              <p className="text-red-700 text-sm">{document.rejectionReason}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Histórico</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Documento solicitado</p>
                  <p className="text-xs text-gray-500">Documento adicionado à lista de requisitos</p>
                </div>
              </div>
              
              {document.fileName && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Documento enviado</p>
                    <p className="text-xs text-gray-500">{formatDate(document.uploadDate)}</p>
                  </div>
                </div>
              )}

              {document.status === 'analyzing' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Em análise</p>
                    <p className="text-xs text-gray-500">Nossa equipe está revisando o documento</p>
                  </div>
                </div>
              )}

              {document.status === 'approved' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Documento aprovado</p>
                    <p className="text-xs text-gray-500">Documento aceito e processado</p>
                  </div>
                </div>
              )}

              {document.status === 'rejected' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Documento rejeitado</p>
                    <p className="text-xs text-gray-500">Necessária correção e reenvio</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-end space-x-3">
          {document.fileName && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
