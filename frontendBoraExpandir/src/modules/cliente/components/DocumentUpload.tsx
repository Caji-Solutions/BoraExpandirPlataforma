import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Upload, FileText, AlertCircle, CheckCircle, Clock, X } from 'lucide-react'
import { Document, RequiredDocument } from '../types'
import { cn, formatDate, formatFileSize } from '../lib/utils'

interface DocumentUploadProps {
  documents: Document[]
  requiredDocuments: RequiredDocument[]
  onUpload: (file: File, documentType: string) => void
  onDelete: (documentId: string) => void
}

const statusIcons = {
  pending: Clock,
  analyzing: Clock,
  approved: CheckCircle,
  rejected: X,
}

const statusColors = {
  pending: 'warning',
  analyzing: 'default',
  approved: 'success',
  rejected: 'destructive',
} as const

const statusLabels = {
  pending: 'Aguardando Envio',
  analyzing: 'Em Análise',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

export function DocumentUpload({ documents, requiredDocuments, onUpload, onDelete }: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState<string | null>(null)

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault()
    setDragOver(null)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onUpload(files[0], documentType)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpload(files[0], documentType)
    }
  }

  const getDocumentForType = (type: string) => {
    return documents.find(doc => doc.type === type)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload de Documentos</h2>
        <p className="text-gray-600 dark:text-gray-400">Envie os documentos necessários para o seu processo.</p>
      </div>

      <div className="grid gap-6">
        {requiredDocuments.map((reqDoc) => {
          const uploadedDoc = getDocumentForType(reqDoc.type)
          const StatusIcon = uploadedDoc ? statusIcons[uploadedDoc.status] : Upload

          return (
            <Card key={reqDoc.type} className="relative" id={`upload-${reqDoc.type}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      uploadedDoc?.status === 'approved' ? 'bg-green-100 text-green-600' :
                      uploadedDoc?.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      uploadedDoc?.status === 'analyzing' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{reqDoc.name}</CardTitle>
                      <CardDescription className="dark:text-gray-400">{reqDoc.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {reqDoc.required && (
                      <Badge variant="secondary">Obrigatório</Badge>
                    )}
                    {uploadedDoc && (
                      <Badge variant={statusColors[uploadedDoc.status]}>
                        {statusLabels[uploadedDoc.status]}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {uploadedDoc ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{uploadedDoc.fileName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enviado em {formatDate(uploadedDoc.uploadDate)}
                            {uploadedDoc.fileSize && ` • ${formatFileSize(uploadedDoc.fileSize)}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(uploadedDoc.id)}
                      >
                        Remover
                      </Button>
                    </div>

                    {uploadedDoc.status === 'rejected' && uploadedDoc.rejectionReason && (
                      <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                        <div>
                          <p className="text-red-800 dark:text-red-200 font-medium">Documento rejeitado</p>
                          <p className="text-red-700 dark:text-red-300 text-sm mt-1">{uploadedDoc.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                    {uploadedDoc.status !== 'approved' && (
                      <div className="mt-4">
                        <input
                          type="file"
                          id={`file-${reqDoc.type}-replace`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => handleFileInput(e, reqDoc.type)}
                        />
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById(`file-${reqDoc.type}-replace`)?.click()}
                        >
                          Substituir Documento
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        dragOver === reqDoc.type
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                      )}
                      onDrop={(e) => handleDrop(e, reqDoc.type)}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOver(reqDoc.type)
                      }}
                      onDragLeave={() => setDragOver(null)}
                    >
                      <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Arraste o arquivo aqui ou clique para enviar
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Formatos aceitos: PDF, JPG, PNG, DOC, DOCX
                      </p>
                      
                      <input
                        type="file"
                        id={`file-${reqDoc.type}`}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => handleFileInput(e, reqDoc.type)}
                      />
                      <Button
                        onClick={() => document.getElementById(`file-${reqDoc.type}`)?.click()}
                      >
                        Selecionar Arquivo
                      </Button>
                    </div>

                    {reqDoc.examples && reqDoc.examples.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Exemplos aceitos:</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                          {reqDoc.examples.map((example, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
