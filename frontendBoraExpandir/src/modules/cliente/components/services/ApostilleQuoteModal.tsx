import React, { useEffect, useState, useRef } from 'react'
import { X, Clock, FileText, AlertCircle, Loader2, Check, Send, CreditCard, Copy, Upload, Trash2, CheckCircle2 } from 'lucide-react'
import { Document as ClientDocument } from '../../types'
import { Button } from '@/modules/shared/components/ui/button'
import { Badge } from '@/modules/shared/components/ui/badge'
import { clienteService } from '../../services/clienteService'
import { cn } from '../../lib/utils'
import { useToast } from '@/components/ui/Toast'

interface ApostilleQuoteModalProps {
  documentoId: string
  documentoNome: string
  clienteEmail?: string
  isOpen: boolean
  onClose: () => void
  allDocuments?: ClientDocument[]
  onPaymentSuccess?: () => void
}

const PIX_CNPJ = '55.218.947/0001-65'
const VALOR_UNITARIO_APOSTILA = 180

export function ApostilleQuoteModal({
  documentoId,
  documentoNome,
  clienteEmail = '',
  isOpen,
  onClose,
  allDocuments = [],
  onPaymentSuccess
}: ApostilleQuoteModalProps) {
  const toast = useToast()
  const [candidateDocuments, setCandidateDocuments] = useState<ClientDocument[]>([])
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'selection' | 'pix' | 'success'>('selection')
  const [error, setError] = useState<string | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null)
  const [orcamentoIds, setOrcamentoIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log(`[ApostilleQuoteModal] useEffect - isOpen: ${isOpen}, docs: ${allDocuments?.length || 0}`);
    if (isOpen) {
      initializeFlow()
    } else {
      setStep('selection')
      setComprovanteFile(null)
      setError(null)
      setOrcamentoIds([])
    }
  }, [isOpen, documentoId, allDocuments])

  const initializeFlow = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const candidates = allDocuments.filter(d => {
        const s = d.status?.toLowerCase()
        return !documentoId || d.id === documentoId || s === 'waiting_apostille' || s === 'waiting_quote_approval'
      })

      setCandidateDocuments(candidates)
      
      const initialSelection = new Set<string>()
      if (documentoId) initialSelection.add(documentoId)
      
      candidates.forEach(d => {
        if (d.status?.toLowerCase() === 'waiting_apostille') {
          initialSelection.add(d.id)
        }
      })
      
      setSelectedDocIds(initialSelection)

      // Se o documento alvo já está aguardando aprovação de orçamento, 
      // verificamos se ele já tem um orçamento disponível para pular pro PIX
      const targetDoc = candidates.find(d => d.id === documentoId);
      if (targetDoc?.status?.toLowerCase() === 'waiting_quote_approval') {
          const orcData = await clienteService.getOrcamentoByDocumento(documentoId);
          if (orcData) {
              setOrcamentoIds([orcData.id]);
              setStep('pix');
          }
      }
      
    } catch (err: any) {
      console.error('Erro ao inicializar fluxo de apostila:', err)
      setError('Não foi possível carregar os detalhes.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDocument = (id: string) => {
    if (step !== 'selection') return
    const newSelection = new Set(selectedDocIds)
    if (newSelection.has(id)) {
      if (id === documentoId) return // Não permite desmarcar o documento principal
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedDocIds(newSelection)
  }

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CNPJ)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 3000)
    } catch {
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 3000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 10MB')
        return
      }
      setComprovanteFile(file)
    }
  }

  const handleAction = async () => {
    if (selectedDocIds.size === 0) return

    console.log(`[ApostilleQuoteModal.handleAction] Iniciando acao no passo: ${step}`);
    console.log(`[ApostilleQuoteModal.handleAction] Documentos selecionados: ${Array.from(selectedDocIds).join(', ')}`);

    try {
      setIsProcessing(true)
      setError(null)
      
      if (step === 'selection') {
        console.log('[ApostilleQuoteModal.handleAction] Avancando para o passo PIX');
        setStep('pix');
      } else if (step === 'pix') {
        if (!comprovanteFile) {
          console.warn('[ApostilleQuoteModal.handleAction] Tentativa de confirmar sem comprovante');
          setError('Por favor, anexe o comprovante de pagamento.')
          setIsProcessing(false)
          return
        }

        console.log('[ApostilleQuoteModal.handleAction] Iniciando criacao de orcamentos e upload de comprovante');
        
        const docsToSolicit = Array.from(selectedDocIds)
        const collectedOrcamentoIds: string[] = [];

        // 1. Criar orçamentos (Idempotente no backend)
        for (const docId of docsToSolicit) {
          const doc = candidateDocuments.find(d => d.id === docId)
          console.log(`[ApostilleQuoteModal.handleAction] Solicitando apostila para doc: ${docId}`);
          
          const result = await clienteService.solicitarApostilamento(
            docId, 
            doc?.fileUrl || '', 
            `Solicitação de apostila para ${doc?.fileName || doc?.name}`
          )
          
          if (result.data.orcamentoId) {
            console.log(`[ApostilleQuoteModal.handleAction] Orcamento criado/recuperado: ${result.data.orcamentoId} para doc: ${docId}`);
            collectedOrcamentoIds.push(result.data.orcamentoId);
          }
        }

        if (collectedOrcamentoIds.length === 0) {
          console.error('[ApostilleQuoteModal.handleAction] Nenhum orcamento foi gerado/recuperado');
          setError('Não foi possível gerar os orçamentos. Tente novamente.')
          setIsProcessing(false)
          return
        }

        console.log(`[ApostilleQuoteModal.handleAction] Enviando comprovante para orcamentos: ${collectedOrcamentoIds.join(', ')}`);

        // 2. Upload do comprovante (bulk)
        await clienteService.submitApostilleComprovante(collectedOrcamentoIds, comprovanteFile)
        
        console.log('[ApostilleQuoteModal.handleAction] Fluxo concluido com sucesso');
        setStep('success')
        if (onPaymentSuccess) onPaymentSuccess()
      }
    } catch (err: any) {
      console.error('[ApostilleQuoteModal.handleAction] Erro no fluxo de apostila:', err)
      setError(err.message || 'Erro ao processar sua solicitação.')
    } finally {
      setIsProcessing(false)
    }
  }

  const valorTotal = selectedDocIds.size * VALOR_UNITARIO_APOSTILA

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-amber-50/30 dark:bg-amber-900/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {step === 'selection' ? 'Solicitar Apostila' : 
                 step === 'pix' ? 'Pagamento via PIX' : 
                 'Concluído'}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[200px] font-medium">{documentoNome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-sm text-gray-500">Buscando informações...</p>
            </div>
          ) : step === 'success' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Solicitação enviada!</h4>
                <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 mx-auto w-full max-w-[320px]">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Documento(s)</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {selectedDocIds.size === 1 
                          ? documentoNome 
                          : `${selectedDocIds.size} documentos selecionados`}
                    </p>
                </div>
                <p className="text-sm text-gray-500 max-w-[300px] mx-auto">
                    Seu comprovante foi enviado para análise. Em breve o processo de apostilamento será iniciado.
                </p>
              </div>
              <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl">
                Fechar
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {step === 'selection' && (
                <>
                  <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800">
                    <div className="flex flex-col items-center text-center space-y-1">
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Total do Apostilamento</span>
                      <span className="text-4xl font-black text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        {selectedDocIds.size} documento(s) x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(VALOR_UNITARIO_APOSTILA)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Documentos Selecionados</h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {candidateDocuments.map((doc) => {
                        const isSelected = selectedDocIds.has(doc.id)
                        return (
                          <div 
                            key={doc.id}
                            onClick={() => toggleDocument(doc.id)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                              isSelected 
                                ? "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800"
                                : "bg-white border-gray-100 dark:bg-neutral-800 dark:border-neutral-700 opacity-60"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-5 w-5 rounded border flex items-center justify-center",
                                isSelected ? "bg-amber-600 border-amber-600" : "bg-white border-gray-300"
                              )}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                                {doc.fileName || doc.name}
                              </span>
                            </div>
                            <FileText className="h-4 w-4 text-gray-400" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {step === 'pix' && (
                <>
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5 border border-amber-100 dark:border-amber-900/20 text-center">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Total a Pagar</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-5 border border-gray-100 dark:border-neutral-800">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Chave PIX (CNPJ)</p>
                    <div className="flex items-center gap-3">
                      <code className="text-xl font-bold text-gray-900 dark:text-white tracking-wider flex-1">{PIX_CNPJ}</code>
                      <button
                        onClick={handleCopyPix}
                        className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 transition-colors"
                        title="Copiar Chave PIX"
                      >
                        {copiedPix ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Anexar Comprovante</label>
                    <div 
                      onClick={() => !comprovanteFile && fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer",
                        comprovanteFile 
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" 
                          : "border-gray-300 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-600"
                      )}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                      />
                      
                      {comprovanteFile ? (
                        <div className="flex flex-col items-center gap-2 w-full">
                           <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
                             <CheckCircle2 className="h-6 w-6" />
                           </div>
                           <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-full">
                             {comprovanteFile.name}
                           </p>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setComprovanteFile(null);
                             }}
                             className="text-xs text-red-500 hover:underline flex items-center gap-1 mt-1"
                           >
                             <Trash2 className="h-3 w-3" /> Remover arquivo
                           </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-400">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clique para selecionar o comprovante</p>
                          <p className="text-[10px] text-gray-400">JPG, PNG ou PDF (Máx. 10MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Button 
                onClick={handleAction}
                disabled={isProcessing || selectedDocIds.size === 0}
                className={cn(
                  "w-full h-14 rounded-xl text-lg font-black text-white shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 transition-all bg-amber-600 hover:bg-amber-700"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    {step === 'selection' ? (
                        <>
                            <Send className="h-5 w-5" />
                            SOLICITAR E PAGAR
                        </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        CONFIRMAR PAGAMENTO
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
