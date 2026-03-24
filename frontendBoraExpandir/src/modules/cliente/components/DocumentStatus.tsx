import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Button } from '@/modules/shared/components/ui/button'
import { FileText, CheckCircle, Clock, AlertCircle, X, Eye, Upload } from 'lucide-react'
import { Document } from '../types'
import { cn, formatDate } from '../lib/utils'

interface DocumentStatusProps {
  documents: Document[]
  onUpload?: (documentType: string) => void
  onView?: (document: Document) => void
}

const statusConfig: Record<Document['status'], {
  icon: typeof Clock;
  label: string;
  color: string;
  bgColor: string;
  badge: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  description: string;
}> = {
  pending: {
    icon: Clock,
    label: 'Aguardando Envio',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'Documento ainda não foi enviado',
  },
  analyzing: {
    icon: Clock,
    label: 'Em Análise',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'Nossa equipe está revisando o documento',
  },
  approved: {
    icon: CheckCircle,
    label: 'Aprovado',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    badge: 'success',
    description: 'Documento foi aprovado e está sendo processado',
  },
  rejected: {
    icon: X,
    label: 'Rejeitado',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    badge: 'destructive',
    description: 'Documento precisa ser reenviado',
  },
  waiting_apostille: {
    icon: Clock,
    label: 'Aguardando Apostilamento',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'O documento está aguardando o processo de apostilamento.',
  },
  analyzing_apostille: {
    icon: Clock,
    label: 'Analisando Apostila',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'Estamos analisando a apostila do documento.',
  },
  waiting_translation: {
    icon: Clock,
    label: 'Aguardando Tradução',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'O documento está aguardando tradução juramentada.',
  },
  analyzing_translation: {
    icon: Clock,
    label: 'Analisando Tradução',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'Estamos analisando a tradução do documento.',
  },
  waiting_translation_quote: {
    icon: Clock,
    label: 'Aguardando Orçamento',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'Estamos aguardando o orçamento da tradução.',
  },
  waiting_quote_approval: {
    icon: Clock,
    label: 'Aguardando Aprovação',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'O orçamento da tradução está aguardando sua aprovação.',
  },
  waiting_apostille_quote: {
    icon: Clock,
    label: 'Aguardando Orçamento',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'Estamos aguardando o orçamento do apostilamento.',
  },
  sent_for_apostille: {
    icon: Clock,
    label: 'Enviado para Apostila',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'O documento foi enviado para o processo de apostilamento.',
  },
}

export function DocumentStatus({ documents, onUpload, onView }: DocumentStatusProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'analyzing' | 'approved' | 'rejected'>('all')
  
  const totalDocuments = documents.length
  const approvedDocuments = documents.filter(doc => doc.status === 'approved').length
  const pendingDocuments = documents.filter(doc => doc.status === 'pending').length
  const analyzingDocuments = documents.filter(doc => doc.status === 'analyzing').length
  const rejectedDocuments = documents.filter(doc => doc.status === 'rejected').length
  
  const filteredDocuments = activeFilter === 'all' 
    ? documents 
    : documents.filter(doc => doc.status === activeFilter)

  const filters = [
    {
      key: 'all' as const,
      label: 'Todos',
      value: totalDocuments,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      key: 'pending' as const,
      label: 'Pendentes',
      value: pendingDocuments,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      key: 'analyzing' as const,
      label: 'Em Análise',
      value: analyzingDocuments,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      key: 'approved' as const,
      label: 'Aprovados',
      value: approvedDocuments,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      key: 'rejected' as const,
      label: 'Rejeitados',
      value: rejectedDocuments,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Status dos Documentos</h2>
        <p className="text-gray-600 dark:text-gray-400">Acompanhe o status de cada documento enviado.</p>
      </div>

      {/* Filter Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={cn(
              "transition-all duration-200 rounded-lg border-2 hover:scale-105",
              activeFilter === filter.key 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md" 
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", filter.bgColor)}>
                  <span className={cn("text-sm font-bold", filter.color)}>{filter.value}</span>
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    activeFilter === filter.key ? "text-blue-900 dark:text-blue-200" : "text-gray-900 dark:text-white"
                  )}>{filter.label} ({filter.value})</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {activeFilter === 'all' 
                  ? 'Nenhum documento encontrado.' 
                  : `Nenhum documento ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} encontrado.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => {
            const config = statusConfig[document.status]
            const StatusIcon = config.icon

            return (
              <Card key={document.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={cn("p-3 rounded-lg", config.bgColor)}>
                        <StatusIcon className={cn("h-5 w-5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{document.name}</h3>
                          <Badge variant={config.badge}>{config.label}</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{config.description}</p>
                        
                        {document.fileName && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <FileText className="h-4 w-4" />
                            <span>{document.fileName}</span>
                            <span>•</span>
                            <span>Enviado em {formatDate(document.uploadDate)}</span>
                          </div>
                        )}

                        {document.status === 'rejected' && document.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-3">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-red-800 dark:text-red-200 font-medium text-sm">Motivo da rejeição:</p>
                                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{document.rejectionReason}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 mt-3">
                          {document.status === 'pending' ? (
                            <Button
                              onClick={() => onUpload?.(document.type)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Enviar Documento
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-900 dark:text-white"
                              onClick={() => onView?.(document)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </Button>
                          )}

                          {document.status === 'rejected' && (
                            <Button
                              onClick={() => onUpload?.(document.type)}
                              size="sm"
                              variant="destructive"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Reenviar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
