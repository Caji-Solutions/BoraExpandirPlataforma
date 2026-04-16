
import React, { useState, useEffect } from 'react';
import { X, DollarSign, Bell, Calendar, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/modules/shared/components/ui/button';
import { clienteService } from '../../cliente/services/clienteService';
import { toast } from '@/modules/shared/components/ui/sonner';
import { cn } from '@/lib/utils';

interface Payment {
    id: string;
    tipo: string;
    categoria: string;
    descricao: string;
    valor: number;
    dataVencimento: string;
    status: string;
}

interface BillingNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    clienteId: string;
    clienteNome: string;
}

export function BillingNotificationModal({
    isOpen,
    onClose,
    clienteId,
    clienteNome
}: BillingNotificationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    
    const [titulo, setTitulo] = useState('Cobrança de Serviço');
    const [mensagem, setMensagem] = useState('');
    const [valor, setValor] = useState('');
    const [dataPrazo, setDataPrazo] = useState('');
    const [tipo, setTipo] = useState('financeiro');

    useEffect(() => {
        if (isOpen && clienteId) {
            fetchPayments();
        }
    }, [isOpen, clienteId]);

    const fetchPayments = async () => {
        try {
            setLoadingPayments(true);
            const data = await clienteService.getPagamentos(clienteId);
            // Filtrar apenas pendentes ou atrasados
            const pending = data.filter((p: Payment) => 
                ['pendente', 'atrasado', 'recusado'].includes(p.status.toLowerCase())
            );
            setPayments(pending);
        } catch (error) {
            console.error('Erro ao buscar pagamentos:', error);
            toast.error('Não foi possível carregar a lista de pagamentos.');
        } finally {
            setLoadingPayments(false);
        }
    };

    const handleSelectPayment = (payment: Payment) => {
        if (selectedPaymentId === payment.id) {
            setSelectedPaymentId(null);
            return;
        }

        setSelectedPaymentId(payment.id);
        setTitulo(`Cobrança: ${payment.categoria}`);
        setValor(payment.valor.toString().replace('.', ','));
        
        // Formatar data para input date (YYYY-MM-DD)
        const date = new Date(payment.dataVencimento);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        setDataPrazo(`${yyyy}-${mm}-${dd}`);

        setMensagem(`Olá, ${clienteNome}. Identificamos que o pagamento de "${payment.descricao}" com vencimento em ${date.toLocaleDateString('pt-BR')} ainda consta como pendente. Favor regularizar.`);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!mensagem) {
            toast.error('Informe a mensagem da cobrança');
            return;
        }

        try {
            setIsLoading(true);
            const valorNumerico = parseFloat(valor.replace(',', '.'));
            const fullMensagem = !isNaN(valorNumerico)
                ? `${mensagem}\n\nValor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorNumerico)}${dataPrazo ? `\nVencimento: ${new Date(dataPrazo).toLocaleDateString('pt-BR')}` : ''}`
                : mensagem;

            await clienteService.createNotificacao(clienteId, {
                titulo,
                mensagem: fullMensagem,
                tipo,
                data_prazo: dataPrazo ? new Date(dataPrazo) : undefined
            });

            toast.success('Cobrança emitida com sucesso! O cliente receberá uma notificação.');
            onClose();
        } catch (error) {
            console.error('Erro ao criar notificação de cobrança:', error);
            toast.error('Não foi possível emitir a cobrança.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-200 flex flex-col md:flex-row max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                
                {/* Lateral Esquerda: Seleção de Pagamentos */}
                <div className="w-full md:w-80 border-r border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
                        <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Pagamentos Pendentes
                        </h5>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loadingPayments ? (
                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                <span className="text-xs">Buscando finanças...</span>
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p className="text-xs">Nenhum pagamento pendente encontrado para este cliente.</p>
                            </div>
                        ) : (
                            payments.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleSelectPayment(p)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-xl border transition-all duration-200 group relative",
                                        selectedPaymentId === p.id 
                                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 ring-2 ring-emerald-500/20" 
                                            : "bg-white dark:bg-neutral-800 border-gray-100 dark:border-neutral-700 hover:border-emerald-300 dark:hover:border-emerald-800"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded",
                                            p.status === 'atrasado' ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                        )}>
                                            {p.status}
                                        </span>
                                        <span className="text-[11px] font-bold text-foreground">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-foreground line-clamp-2 leading-tight">
                                        {p.descricao}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1 text-[9px] text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        Vence em {new Date(p.dataVencimento).toLocaleDateString('pt-BR')}
                                    </div>
                                    
                                    {selectedPaymentId === p.id && (
                                        <div className="absolute top-2 right-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Área Principal: Formulário */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
                    <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-emerald-50/10 dark:bg-emerald-900/5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <Bell className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Configurar Notificação de Cobrança</h4>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{clienteNome}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <X className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                                Título da Notificação
                                {selectedPaymentId && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded lowercase font-bold tracking-normal italic transition-all animate-in fade-in">preenchido via seleção</span>}
                            </label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ex: Cobrança de Apostilamento"
                                className="w-full h-11 bg-gray-50 dark:bg-neutral-800 border-gray-100 dark:border-neutral-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Valor Sugerido (R$)</label>
                                <input
                                    type="text"
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full h-11 bg-gray-50 dark:bg-neutral-800 border-gray-100 dark:border-neutral-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Data de Referência (Venc.)</label>
                                <input
                                    type="date"
                                    value={dataPrazo}
                                    onChange={(e) => setDataPrazo(e.target.value)}
                                    className="w-full h-11 bg-gray-50 dark:bg-neutral-800 border-gray-100 dark:border-neutral-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Corpo da Mensagem</label>
                            <textarea
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                placeholder="Descreva o que está sendo cobrado..."
                                className="w-full min-h-[120px] bg-gray-50 dark:bg-neutral-800 border-gray-100 dark:border-neutral-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none leading-relaxed"
                                required
                            />
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 flex gap-3 text-amber-700 dark:text-amber-400">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed font-medium">
                                Esta notificação ficará visível no portal do cliente e no app. Se o valor for preenchido, ele será anexado como destaque no final da mensagem.
                            </p>
                        </div>

                        <div className="pt-2 flex gap-3 pb-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 h-12 rounded-xl border-gray-200"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Enviar Notificação de Cobrança'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
