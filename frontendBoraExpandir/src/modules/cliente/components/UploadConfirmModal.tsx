import React from 'react';
import { Loader2, Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { formatFileSize } from '../lib/utils';
import { cn } from '../lib/utils';

interface UploadConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isUploading: boolean;
  uploadError: string | null;
  pendingUpload: {
    file: File;
    documentName: string;
    isReplacement?: boolean;
    targetName?: string;
  };
}

export function UploadConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isUploading,
  uploadError,
  pendingUpload
}: UploadConfirmModalProps) {
  if (!isOpen || !pendingUpload) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isUploading ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Upload className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-xl">
                {isUploading ? 'Enviando Documento...' : 'Confirmar Envio'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {isUploading ? 'Aguarde enquanto processamos seu arquivo' : 'Verifique os detalhes antes de enviar'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Campo/Documento Alvo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Documento Solicitado
            </label>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  {pendingUpload.documentName}
                </p>
                {pendingUpload.targetName && (
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
                    Para: {pendingUpload.targetName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Arquivo Selecionado */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Arquivo Selecionado
            </label>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center gap-4">
              <div className="h-10 w-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {pendingUpload.file.name.split('.').pop()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate" title={pendingUpload.file.name}>
                  {pendingUpload.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(pendingUpload.file.size)}
                </p>
              </div>
            </div>
          </div>

          {/* Alert/Warning Area */}
          {uploadError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {uploadError}
              </p>
            </div>
          ) : pendingUpload.isReplacement ? (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
              <div className="text-sm text-orange-800 dark:text-orange-300">
                <p className="font-semibold mb-1">⚠️ Atenção: Documento Já Enviado</p>
                <p className="text-xs">
                  Um documento deste tipo já foi enviado anteriormente. Ao confirmar, o arquivo antigo será substituído pelo novo.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Certifique-se que o arquivo está legível e completo. Arquivos ilegíveis podem atrasar seu processo.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none min-w-[140px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {pendingUpload.isReplacement ? 'Substituir Documento' : 'Confirmar Envio'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
