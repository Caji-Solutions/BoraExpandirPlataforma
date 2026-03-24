import { Upload, Loader2 } from 'lucide-react'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Button } from '@/modules/shared/components/ui/button'
import { Document as ClientDocument } from '../../types'

interface PendingDocumentsListProps {
  pendingDocs: {
    type: string
    _isRequested?: boolean
    name: string
    required?: boolean
    description?: string
    documentoId?: string
  }[]
  memberId: string
  memberDocs: ClientDocument[]
  uploadingType: string | null
  hasVisibleStages: boolean
  onUploadClick: (inputId: string) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: string, documentoId?: string) => void
}

export function PendingDocumentsList({
  pendingDocs,
  memberId,
  memberDocs,
  uploadingType,
  hasVisibleStages,
  onUploadClick,
  onFileSelect,
}: PendingDocumentsListProps) {
  if (pendingDocs.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border-gray-300">
          Documentos Pendentes
        </Badge>
        <p className="text-xs text-gray-500 italic">Envie os documentos abaixo para iniciar o processo</p>
      </div>

      <div className="grid gap-3">
        {pendingDocs.map((item: any, idx: number) => {
          const inputId = `file-${memberId}-${item.type}-pending`
          const isUploading = uploadingType === item.type

          // Verificar se já existe um documento deste tipo no banco
          const existingDoc = memberDocs.find((d) => d.type === item.type)
          const wasAlreadySent = !!existingDoc

          return (
            <div
              key={'pending-' + item.type + idx}
              className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-blue-400 hover:bg-blue-50/30 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                      <Upload className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {item._isRequested ? `Pendente: ${item.name}` : item.name}
                        </span>
                        {item.required && (
                          <Badge variant="secondary" className="text-[10px] h-5">
                            Obrigatório
                          </Badge>
                        )}
                        {item._isRequested && (
                          <Badge className="text-[10px] h-5 bg-amber-500 hover:bg-amber-600 text-white">
                            ⚠️ Solicitado
                          </Badge>
                        )}
                        {wasAlreadySent && !item._isRequested && (
                          <Badge className="text-[10px] h-5 bg-orange-500 hover:bg-orange-600 text-white">
                            📄 Já Enviado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      {wasAlreadySent && !item._isRequested && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                          ⚠️ Este documento será substituído ao enviar novamente
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <input
                    type="file"
                    id={inputId}
                    className="hidden"
                    accept=".pdf,application/pdf"
                    onChange={(e) => onFileSelect(e, item.type, item.documentoId)}
                    disabled={isUploading}
                  />
                  <Button
                    size="sm"
                    className="h-9 px-4 text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    onClick={() => onUploadClick(inputId)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    ENVIAR
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Visual Separator if there are other stages */}
      {hasVisibleStages && (
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 dark:bg-gray-900 px-3 text-xs font-medium text-gray-400 uppercase tracking-widest">
              Documentos Enviados
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
