import React, { useState, useRef } from 'react';
import { X, CreditCard, Copy, Check, Upload, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/modules/shared/components/ui/button';
import { cn } from '../../lib/utils';
import { useToast } from '@/modules/shared/components/ui/use-toast';
import { pagamentoService } from '../../services/pagamentoService';
import { Payment } from '../../types';
import { EurBrlPrice } from '@/modules/shared/components/EurBrlPrice';
import { useCotacaoEurBrl } from '@/modules/shared/hooks/useCotacaoEurBrl';

interface DirectPaymentModalProps {
  payment: Payment;
  clienteId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PIX_CNPJ = '55.218.947/0001-65';
const WISE_TAG = 'https://wise.com/pay/me/fernandaj101';

export function DirectPaymentModal({
  payment,
  clienteId,
  isOpen,
  onClose,
  onSuccess
}: DirectPaymentModalProps) {
  const toast = useToast();
  const [step, setStep] = useState<'method' | 'pix' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'wise'>('pix');
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cotacao = useCotacaoEurBrl();

  const toEur = (valorBrl: number) => cotacao ? valorBrl / cotacao : 0;

  const handleCopyKey = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 3000);
    } catch {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive"
        });
        return;
      }
      setComprovanteFile(file);
    }
  };

  const handleConfirmPayment = async () => {
    if (!comprovanteFile) {
      setError('Por favor, anexe o comprovante de pagamento.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      await pagamentoService.uploadComprovante(payment.id, clienteId, payment.tipo || 'parcela', comprovanteFile);
      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Erro ao enviar comprovante:', err);
      setError(err.message || 'Erro ao processar o envio do comprovante.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-emerald-50/30 dark:bg-emerald-900/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {step === 'method' ? 'Pagar Parcela' : 
                 step === 'pix' ? (paymentMethod === 'wise' ? 'Pagamento via Wise' : 'Pagamento via PIX') : 
                 'Concluído'}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[200px] font-medium">{payment.descricao}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === 'success' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Comprovante enviado!</h4>
                <p className="text-sm text-gray-500 max-w-[300px] mx-auto">
                  Seu comprovante foi recebido e está em análise pelo nosso time financeiro.
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

              {step === 'method' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800">
                    <div className="flex flex-col items-center text-center space-y-1">
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Valor a Pagar</span>
                      <EurBrlPrice
                        valorEur={toEur(payment.valor)}
                        size="xl"
                        align="center"
                        className="text-gray-900 dark:text-white !text-4xl !font-black"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">Selecione como deseja realizar o pagamento:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setPaymentMethod('pix'); setStep('pix') }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-lg font-bold">P</div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">PIX</span>
                      <span className="text-[10px] text-gray-500">Chave CNPJ</span>
                    </button>
                    <button
                      onClick={() => { setPaymentMethod('wise'); setStep('pix') }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-purple-500 dark:hover:border-purple-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-purple-50 dark:hover:bg-purple-500/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-lg font-bold">W</div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">Wise</span>
                      <span className="text-[10px] text-gray-500">Transferência</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 'pix' && (
                <>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/20 text-center">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Valor</p>
                    <EurBrlPrice
                      valorEur={toEur(payment.valor)}
                      size="lg"
                      align="center"
                      className="text-gray-900 dark:text-white"
                    />
                  </div>

                  {paymentMethod === 'pix' ? (
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-5 border border-gray-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Chave PIX (CNPJ)</p>
                      <div className="flex items-center gap-3">
                        <code className="text-xl font-bold text-gray-900 dark:text-white tracking-wider flex-1">{PIX_CNPJ}</code>
                        <button
                          onClick={() => handleCopyKey(PIX_CNPJ)}
                          className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"
                        >
                          {copiedKey ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-5 border border-gray-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Wisetag</p>
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
                           onClick={() => handleCopyKey(WISE_TAG)}
                           className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 transition-colors"
                         >
                           {copiedKey ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
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
                          : "border-gray-300 dark:border-neutral-700 hover:border-emerald-400 group"
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
                          <div className="p-3 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-400 group-hover:bg-emerald-50 transition-colors">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clique para selecionar o comprovante</p>
                          <p className="text-[10px] text-gray-400">JPG, PNG ou PDF (Máx. 10MB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing || !comprovanteFile}
                    className="w-full h-14 rounded-xl text-lg font-black text-white shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 transition-all bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        CONFIRMAR PAGAMENTO
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
