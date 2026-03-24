import { FileText, AlertCircle, Upload } from 'lucide-react'
import { Button } from '@/modules/shared/components/ui/button'

interface PdfWarningModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function PdfWarningModal({ isOpen, onConfirm, onCancel }: PdfWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Formato de Arquivo</h3>
              <p className="text-blue-100 text-sm mt-1">Informação importante</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Somente arquivos PDF são aceitos!
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Por favor, certifique-se de que seu documento está no formato{' '}
                  <span className="font-bold">.PDF</span> antes de enviar.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">Dicas para digitalizar seu documento:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Use um aplicativo de scanner no celular (ex: CamScanner, Adobe Scan)</li>
              <li>Certifique-se de que o documento está legível</li>
              <li>Salve o arquivo em formato PDF</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} className="border-gray-300 dark:border-gray-600">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="h-4 w-4 mr-2" />
            Entendi, Selecionar PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
