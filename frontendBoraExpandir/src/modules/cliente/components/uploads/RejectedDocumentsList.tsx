import { FileText, AlertCircle, CheckCircle, Upload, Loader2 } from 'lucide-react'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Button } from '@/modules/shared/components/ui/button'
import { Document as ClientDocument } from '../../types'
import { cn, formatDate } from '../../lib/utils'

interface RejectedDocumentsListProps {
  rejectedDocs: { type: string; _document: ClientDocument; name: string }[]
  memberId: string
  uploadingType: string | null
  onUploadClick: (inputId: string) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void
}

export function RejectedDocumentsList({
  rejectedDocs,
  memberId,
  uploadingType,
  onUploadClick,
  onFileSelect,
}: RejectedDocumentsListProps) {
  if (rejectedDocs.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
          Documentos Rejeitados
        </Badge>
        <p className="text-xs text-gray-500 italic">Corrija os documentos abaixo para prosseguir</p>
      </div>

      <div className="grid gap-3">
        {rejectedDocs.map((item: any, idx: number) => {
          const doc = item._document
          const inputId = `file-${memberId}-${item.type}-rejected`
          const isUploading = uploadingType === item.type

          return (
            <div
              key={'rejected-' + item.type + idx}
              className="p-4 rounded-xl border-2 border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30">
                        <FileText className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <Badge
                        variant="default"
                        className={cn(
                          "text-[10px] px-1.5 py-0 border-none text-white flex items-center gap-1",
                          doc?.isApostilled
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-300"
                        )}
                      >
                        <CheckCircle className={cn("h-3 w-3", doc?.isApostilled ? "opacity-100" : "opacity-50")} />
                        Apostilado
                      </Badge>
                      <Badge
                        variant="default"
                        className={cn(
                          "text-[10px] px-1.5 py-0 border-none text-white flex items-center gap-1",
                          doc?.isTranslated
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-300"
                        )}
                      >
                        <CheckCircle className={cn("h-3 w-3", doc?.isTranslated ? "opacity-100" : "opacity-50")} />
                        Traduzido
                      </Badge>
                    </div>
                  </div>

                  {doc && (
                    <p className="text-xs text-gray-500 ml-9">
                      {doc.fileName} • {formatDate(doc.uploadDate)}
                    </p>
                  )}

                  {doc?.rejectionReason && (
                    <div className="mt-2 ml-9 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 flex items-start gap-3 w-fit max-w-[80%]">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-800 dark:text-red-400">Motivo da recusa:</p>
                        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{doc.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <input
                    type="file"
                    id={inputId}
                    className="hidden"
                    accept=".pdf,application/pdf"
                    onChange={(e) => onFileSelect(e, item.type)}
                    disabled={isUploading}
                  />
                  <Button
                    size="sm"
                    className="h-9 px-4 text-xs font-bold gap-2 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    onClick={() => onUploadClick(inputId)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    REENVIAR DOCUMENTO
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Visual Separator */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-50 dark:bg-gray-900 px-3 text-xs font-medium text-gray-400 uppercase tracking-widest">
            Fluxo do Processo
          </span>
        </div>
      </div>
    </div>
  )
}
