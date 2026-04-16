import React, { useEffect, useState, useRef } from 'react'
import { X, CreditCard, Clock, FileText, AlertCircle, Loader2, Check, Copy, CheckCircle2, Upload, Trash2 } from 'lucide-react'
import { Document as ClientDocument } from '../../types'
import { Button } from '@/modules/shared/components/ui/button'
import { Badge } from '@/modules/shared/components/ui/badge'
import { traducoesService } from '../../../tradutora/services/traducoesService'
import { clienteService } from '../../services/clienteService'
import { cn, formatDateSimple } from '../../lib/utils'
import { useToast } from '@/components/ui/Toast'

interface TranslationQuoteModalProps {
  documentoId: string
  documentoNome: string
  clienteEmail?: string
  isOpen: boolean
  onClose: () => void
  allDocuments?: ClientDocument[]
  onPaymentSuccess?: () => void
}

const PIX_CNPJ = '55.218.947/0001-65'
const WISE_TAG = 'https://wise.com/pay/me/fernandaj101'

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || 'pending';
  switch (s) {
    case 'approved':
    case 'aprovado':
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10 text-[10px] py-0 h-5">Aprovado</Badge>;
    case 'waiting_apostille':
    case 'pronto_para_apostilagem':
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/10 text-[10px] py-0 h-5">Pronto p/ Apostila</Badge>;
    case 'waiting_apostille_quote':
    case 'waiting_quote_approval':
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10 text-[10px] py-0 h-5">Aguar. Orçamento</Badge>;
    case 'waiting_translation':
    case 'waiting_translation_quote':
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/10 text-[10px] py-0 h-5">Aguar. Tradução</Badge>;
    case 'analyzing':
    case 'analyzing_apostille':
    case 'analyzing_translation':
    case 'em_analise':
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/10 text-[10px] py-0 h-5">Em Análise</Badge>;
    case 'rejected':
    case 'rejeitado':
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/10 text-[10px] py-0 h-5">Rejeitado</Badge>;
    case 'sem_arquivo':
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/10 text-[10px] py-0 h-5">Sem Arquivo</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px] py-0 h-5">{status || 'Documento'}</Badge>;
  }
};

export function TranslationQuoteModal({
  documentoId,
  documentoNome,
  clienteEmail = '',
  isOpen,
  onClose,
  allDocuments = [],
  onPaymentSuccess
}: TranslationQuoteModalProps) {
  const toast = useToast()
  const [allBudgets, setAllBudgets] = useState<Record<string, any>>({})
  const [candidateDocuments, setCandidateDocuments] = useState<ClientDocument[]>([])
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'selection' | 'info' | 'method' | 'pix' | 'success' | 'waiting_confirmation'>('selection')
  const [error, setError] = useState<string | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [copiedWise, setCopiedWise] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'wise'>('pix')
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleDocument = (id: string) => {
    const next = new Set(selectedDocIds)
    if (next.has(id)) {
        if (id === documentoId) return // Não permite desmarcar o documento alvo se houver
        next.delete(id)
    } else {
        next.add(id)
    }
    setSelectedDocIds(next)
  }

  const valorTotal = Array.from(selectedDocIds).reduce((acc, id) => {
    const budget = allBudgets[id]
    if (budget) {
        return acc + (budget.preco_atualizado || budget.valor_orcamento || 0)
    }
    return acc
  }, 0)

  const hasAnyPendingQuote = Array.from(selectedDocIds).some(id => !allBudgets[id])

  useEffect(() => {
    console.log(`[TranslationQuoteModal] useEffect - isOpen: ${isOpen}, docs: ${allDocuments?.length || 0}`);
    if (isOpen) {
      initializeFlow()
    } else {
      setStep('selection')
      setComprovanteFile(null)
      setError(null)
    }
  }, [isOpen, documentoId, allDocuments])

  const initializeFlow = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const candidates = allDocuments
      setCandidateDocuments(candidates)
      
      const initialSelection = new Set<string>()
      if (documentoId) initialSelection.add(documentoId)
      
      // Auto-selecionar documentos que já estão aguardando tradução
      candidates.forEach(d => {
        const s = d.status?.toLowerCase()
        if (s === 'waiting_translation' || s === 'waiting_translation_quote') {
          initialSelection.add(d.id)
        }
      })
      setSelectedDocIds(initialSelection)

      if (documentoId) {
        const budget = (await traducoesService.getOrcamentoByDocumento(documentoId)) as any
        if (budget) {
          setAllBudgets(prev => ({ ...prev, [documentoId]: budget }))
          if (budget.status === 'pendente_verificacao') {
            setStep('waiting_confirmation')
          }
        }
      }
      
    } catch (err: any) {
      // Se for 404, apenas ignoramos pois significa que não há orçamento ainda
      if (err.status === 404 || err.response?.status === 404) {
        console.log('[TranslationQuoteModal] Nenhum orçamento encontrado (404) - Fluxo normal para solicitação.');
      } else {
        console.error('Erro ao inicializar fluxo de traducao:', err)
        setError('Não foi possível carregar os detalhes do serviço.')
      }
    } finally {
      setIsLoading(false)
    }
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

  const handleCopyWise = async () => {
    try {
      await navigator.clipboard.writeText(WISE_TAG)
      setCopiedWise(true)
      setTimeout(() => setCopiedWise(false), 3000)
    } catch {
      setCopiedWise(true)
      setTimeout(() => setCopiedWise(false), 3000)
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
    try {
      setIsProcessing(true)
      setError(null)
      const budget = allBudgets[documentoId]

      if (step === 'info') {
        if (budget) {
          setStep('method')
        } else {
          // Fluxo de SOLICITAÇÃO (não tem orçamento)
          await clienteService.updateDocumentoStatus(documentoId, 'WAITING_TRANSLATION_QUOTE')
          setStep('success')
        }
      } else if (step === 'pix') {
        if (!comprovanteFile) {
          setError('Por favor, anexe o comprovante de pagamento.')
          setIsProcessing(false)
          return
        }

        // Upload do comprovante
        await traducoesService.submitComprovante(budget.id, comprovanteFile)
        setStep('success')
        if (onPaymentSuccess) onPaymentSuccess()
      }
    } catch (err: any) {
      console.error('Erro no fluxo de traducao:', err)
      setError(err.message || 'Erro ao processar sua solicitação.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-purple-50/30 dark:bg-purple-900/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">
                {step === 'selection' ? 'Solicitar Tradução' :
                 step === 'info' ? 'Resumo da Tradução' :
                 step === 'method' ? 'Método de Pagamento' :
                 step === 'pix' ? (paymentMethod === 'wise' ? 'Pagamento via Wise' : 'Pagamento via PIX') :
                 step === 'waiting_confirmation' ? 'Aguardando Verificação' :
                 'Concluído'}
              </h4>
              <p className="text-xs text-muted-foreground truncate max-w-[200px] font-medium">{documentoNome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-sm text-gray-500">Buscando informações...</p>
            </div>
          ) : step === 'success' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-foreground">Solicitação enviada!</h4>
                <p className="text-sm text-gray-500 max-w-[300px] mx-auto">
                  {allBudgets[documentoId]
                    ? 'Seu comprovante foi enviado para análise. Em breve a tradução será iniciada.'
                    : 'Nossa equipe analisará seu documento e enviará o orçamento em breve.'}
                </p>
              </div>
              <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl">
                Fechar
              </Button>
            </div>
          ) : step === 'waiting_confirmation' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-foreground">Aguardando Verificação</h4>
                <p className="text-sm text-gray-500 max-w-[300px] mx-auto">
                  Já recebemos o seu comprovante! Nossa equipe financeira está verificando o pagamento. Isso geralmente leva poucos minutos em horário comercial.
                </p>
              </div>
              <div className="w-full p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                 <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                   Status: {allBudgets[documentoId]?.pagamento_nota_recusa ? "Recusado - Reenvie o comprovante" : "Em análise financeira"}
                 </p>
              </div>
              <Button onClick={onClose} className="w-full bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white font-bold h-12 rounded-xl">
                Entendi
              </Button>
              {allBudgets[documentoId]?.pagamento_nota_recusa && (
                <Button 
                  onClick={() => setStep('pix')} 
                  variant="outline" 
                  className="w-full border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400"
                >
                  Tentar Novamente
                </Button>
              )}
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
                      <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Documentos para Tradução</span>
                      <span className="text-4xl font-black text-foreground">
                        {selectedDocIds.size} selecionado(s)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selecione os documentos</h4>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {candidateDocuments.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-muted rounded-xl">
                          <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Nenhum documento encontrado.</p>
                        </div>
                      ) : candidateDocuments.map((doc) => {
                        const isSelected = selectedDocIds.has(doc.id)
                        const d = doc as any
                        const hasFile = !!(d.fileUrl || d.admin_upload_url || d.file_url || d.nome_arquivo || d.nome_original)
                        const displayName = d.tipo || d.name || d.fileName || d.nome_original || d.nome_arquivo || 'Documento sem nome'
                        
                        return (
                          <div 
                            key={doc.id}
                            onClick={() => toggleDocument(doc.id)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                              isSelected 
                                ? "bg-purple-50/50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800"
                                : "bg-white border-gray-100 dark:bg-neutral-800 dark:border-neutral-700"
                            )}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={cn(
                                "h-5 w-5 rounded border flex items-center justify-center shrink-0",
                                isSelected ? "bg-purple-600 border-purple-600" : "bg-white border-gray-300"
                              )}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-foreground truncate max-w-[240px]">
                                  {displayName}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusBadge(hasFile ? doc.status : (doc.status || 'Pendente'))}
                                  {!hasFile && <span className="text-[10px] text-red-500 font-bold uppercase">Sem Arquivo</span>}
                                </div>
                              </div>
                            </div>
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      if (selectedDocIds.size === 1 && allBudgets[Array.from(selectedDocIds)[0]]) {
                        setStep('info')
                      } else {
                        // Se houver mais de um ou nenhum orçamento, poderíamos implementar
                        // a solicitação em massa. Por enquanto vamos para o step 'info'
                        // que lidará com a exibição do total ou 'Sob consulta'
                        setStep('info')
                      }
                    }} 
                    disabled={selectedDocIds.size === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl"
                  >
                    Continuar {selectedDocIds.size > 0 && `(${selectedDocIds.size})`}
                  </Button>
                </>
              )}

              {step === 'info' && (
                <>
                  <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800">
                    <div className="flex flex-col items-center text-center space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Valor Total da Tradução</span>
                      <span className="text-4xl font-black text-foreground">
                        {hasAnyPendingQuote 
                          ? 'Sob consulta'
                          : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                      </span>
                      {selectedDocIds.size > 1 && (
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">
                          Referente a {selectedDocIds.size} documento(s)
                        </span>
                      )}
                    </div>
                    
                    {!hasAnyPendingQuote && valorTotal > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700 flex justify-center gap-2 items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>Serviço express disponível</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed text-center font-medium">
                      {allBudgets[documentoId] 
                        ? "O orçamento foi gerado. Prossiga para realizar o pagamento via PIX e iniciar o serviço."
                        : "As traduções juramentadas dependem da análise do volume de texto. Solicite uma cotação gratuita clicando no botão abaixo."}
                    </p>
                  </div>
                </>
              )}

              {step === 'method' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Selecione como deseja realizar o pagamento:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setPaymentMethod('pix'); setStep('pix') }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-lg font-bold">P</div>
                      <span className="font-bold text-sm text-foreground">PIX</span>
                      <span className="text-[10px] text-muted-foreground">Chave CNPJ</span>
                    </button>
                    <button
                      onClick={() => { setPaymentMethod('wise'); setStep('pix') }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-purple-500 dark:hover:border-purple-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-purple-50 dark:hover:bg-purple-500/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-lg font-bold">W</div>
                      <span className="font-bold text-sm text-foreground">Wise</span>
                      <span className="text-[10px] text-muted-foreground">Transferência internacional</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 'pix' && (
                <>
                  {paymentMethod === 'pix' ? (
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-5 border border-gray-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Chave PIX (CNPJ)</p>
                      <div className="flex items-center gap-3">
                        <code className="text-xl font-bold text-foreground tracking-wider flex-1">{PIX_CNPJ}</code>
                        <button
                          onClick={handleCopyPix}
                          className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"
                          title="Copiar Chave PIX"
                        >
                          {copiedPix ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-5 border border-gray-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Wisetag (Transferência Internacional)</p>
                      <div className="flex items-center gap-3">
                        <a
                          href={WISE_TAG}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-bold text-purple-600 dark:text-purple-400 underline hover:text-purple-700 dark:hover:text-purple-300 flex-1 truncate transition-colors"
                        >
                          wise.com/pay/me/fernandaj101
                        </a>
                        <button
                          onClick={handleCopyWise}
                          className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 transition-colors"
                          title="Copiar link Wise"
                        >
                          {copiedWise ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Anexar Comprovante</label>
                    <div 
                      onClick={() => !comprovanteFile && fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer",
                        comprovanteFile 
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" 
                          : "border-gray-300 dark:border-neutral-700 hover:border-purple-400 dark:hover:border-purple-600"
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

              {step !== 'method' && (
              <Button
                onClick={handleAction}
                disabled={isProcessing}
                className={cn(
                  "w-full h-14 rounded-xl text-lg font-black text-white shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 transition-all",
                  allBudgets[documentoId] ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    {step === 'info' ? (
                      allBudgets[documentoId] ? (
                         <>
                           <CreditCard className="h-5 w-5" />
                           VALOR CONFIRMADO: PAGAR
                         </>
                      ) : (
                        <>
                          <Clock className="h-5 w-5" />
                          SOLICITAR ORÇAMENTO
                        </>
                      )
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        CONFIRMAR PAGAMENTO
                      </>
                    )}
                  </>
                )}
              </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
