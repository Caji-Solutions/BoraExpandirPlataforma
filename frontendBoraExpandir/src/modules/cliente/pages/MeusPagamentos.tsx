import React, { useEffect, useState } from 'react';
import { 
    CreditCard, 
    Download, 
    Clock, 
    CheckCircle2, 
    Search, 
    Filter, 
    ChevronRight,
    ArrowUpRight,
    Receipt,
    AlertTriangle,
    Upload,
    Calendar,
    FileText,
    Calculator
} from 'lucide-react';
import { Card } from '@/modules/shared/components/ui/card';
import { Button } from '@/modules/shared/components/ui/button';
import { Badge } from '@/modules/shared/components/ui/badge';
import { pagamentoService } from '../services/pagamentoService';
import { Payment } from '../types';
import { DirectPaymentModal } from '../components/services/DirectPaymentModal';

interface MeusPagamentosProps {
    clienteId: string;
}

export default function MeusPagamentos({ clienteId }: MeusPagamentosProps) {
    const [pagamentos, setPagamentos] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        loadPagamentos();
    }, [clienteId]);

    const loadPagamentos = async () => {
        try {
            setLoading(true);
            const data = await pagamentoService.getPagamentos(clienteId);
            setPagamentos(data || []);
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: Payment['status']) => {
        switch (status) {
            case 'pago':
            case 'aprovado':
            case 'APPROVED':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 font-bold">Pago</Badge>;
            case 'pendente':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 font-bold">Pendente</Badge>;
            case 'atrasado':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1 font-bold">Atrasado</Badge>;
            case 'em_analise':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 font-bold">Em Análise</Badge>;
            case 'recusado':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1 font-bold">Recusado</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700 border-none px-3 py-1 font-bold tracking-tight">{status}</Badge>;
        }
    };

    const filteredPagamentos = pagamentos.filter(p => 
        p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalPago: pagamentos.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.valor, 0),
        totalPendente: pagamentos.filter(p => p.status === 'pendente' || p.status === 'atrasado' || p.status === 'recusado').reduce((acc, p) => acc + p.valor, 0),
        proximoVencimento: pagamentos
            .filter(p => p.status === 'pendente' || p.status === 'atrasado')
            .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())[0]?.dataVencimento
    };

    const handleOpenPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsPaymentModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header com Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-white to-emerald-50/30 border-gray-100 dark:from-neutral-900 dark:to-emerald-950/10 dark:border-neutral-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-2xl group-hover:bg-emerald-200/40 transition-all duration-500"></div>
                    <div className="relative flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Pago</span>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                        </div>
                        <span className="text-3xl font-black text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalPago)}
                        </span>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Financeiro atualizado hoje</p>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-white to-amber-50/30 border-gray-100 dark:from-neutral-900 dark:to-amber-950/10 dark:border-neutral-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-100/40 dark:bg-amber-900/10 rounded-full blur-2xl group-hover:bg-amber-200/40 transition-all duration-500"></div>
                    <div className="relative flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aguardando Pagamento</span>
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>
                        <span className="text-3xl font-black text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalPendente)}
                        </span>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">
                            {stats.proximoVencimento ? `Próximo: ${new Date(stats.proximoVencimento).toLocaleDateString()}` : 'Sem parcelas pendentes'}
                        </p>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700 shadow-xl overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
                    <div className="relative flex flex-col h-full justify-between">
                        <div>
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Cartão de Acesso</span>
                            <div className="mt-1 h-0.5 w-8 bg-purple-500 rounded-full"></div>
                        </div>
                        <div className="mt-4 flex flex-col gap-1">
                            <span className="text-lg font-bold text-white tracking-tight">Status do Acesso</span>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-xs text-neutral-400 font-medium">Conta Regularizada</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabela de Pagamentos */}
            <Card className="bg-white dark:bg-neutral-900 rounded-2xl border-none shadow-premium overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 dark:bg-neutral-800/20">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seus Pagamentos</h2>
                        <p className="text-sm text-gray-500 mt-1">Histórico completo de transações e cobranças</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Buscar pagamento..."
                                className="pl-9 pr-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="rounded-xl border-gray-200 dark:border-neutral-700 font-bold text-sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtrar
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-neutral-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Vencimento</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Valor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                            {filteredPagamentos.map((pagamento) => (
                                <React.Fragment key={pagamento.id}>
                                    <tr className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/20 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors">
                                                    {pagamento.tipo === 'agendamento' && <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                                                    {pagamento.tipo === 'parcela' && <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                                                    {pagamento.tipo === 'contrato' && <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                                                    {pagamento.tipo === 'orcamento' && <Calculator className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                                                    {!pagamento.tipo && <Receipt className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white leading-none capitalize">{pagamento.descricao}</span>
                                                    <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
                                                        {pagamento.categoria || (
                                                            pagamento.tipo === 'parcela' ? 'Boleto/Parcelamento' : 
                                                            pagamento.tipo === 'agendamento' ? 'Consultoria' : 
                                                            pagamento.tipo === 'orcamento' ? 'Serviços de Terceiros' : 'Ajuste Financeiro'
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                {new Date(pagamento.dataVencimento).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center text-sm font-bold text-gray-900 dark:text-white">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pagamento.valor)}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {getStatusBadge(pagamento.status)}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {(pagamento.status === 'pendente' || pagamento.status === 'atrasado') && (
                                                    <Button 
                                                        onClick={() => handleOpenPayment(pagamento)}
                                                        className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                                                    >
                                                        Pagar
                                                    </Button>
                                                )}
                                                {pagamento.status === 'recusado' && (
                                                    <Button 
                                                        onClick={() => handleOpenPayment(pagamento)}
                                                        className="h-9 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1"
                                                    >
                                                        <Upload className="h-3 w-3" /> Reenviar
                                                    </Button>
                                                )}
                                                {pagamento.comprovanteUrl && (
                                                    <a 
                                                        href={pagamento.comprovanteUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                                                        title="Ver comprovante"
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </a>
                                                )}
                                                <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {pagamento.status === 'recusado' && pagamento.notaRecusa && (
                                        <tr>
                                            <td colSpan={5} className="px-6 pb-5 pt-0">
                                                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl p-3 flex items-start gap-3 text-orange-700 dark:text-orange-400">
                                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold uppercase tracking-wider">Motivo da Recusa:</p>
                                                        <p className="text-sm font-medium">{pagamento.notaRecusa}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal de Pagamento */}
            {selectedPayment && (
                <DirectPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedPayment(null);
                    }}
                    payment={selectedPayment}
                    clienteId={clienteId}
                    onSuccess={loadPagamentos}
                />
            )}
        </div>
    );
}
