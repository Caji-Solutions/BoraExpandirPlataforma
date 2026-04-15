import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Link as LinkIcon, TrendingUp, Users, Zap, Rocket, Calendar, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Client } from '../../../cliente/types';
import { parceiroService } from '../../../cliente/services/parceiroService';
import { cn } from '@/modules/cliente/lib/utils';
import { TERMO_PARCEIRO_TEXT } from './TermoPadrao';

// TERMO_PARCEIRO_TEXT importado de ./TermoPadrao


const statusConfig = {
  prospect: { variant: 'secondary' as const, label: 'Prospect' },
  'em-processo': { variant: 'default' as const, label: 'Em Processo' },
  confirmado: { variant: 'success' as const, label: 'Confirmado' },
  concluido: { variant: 'success' as const, label: 'Concluído' },
  LEAD: { variant: 'secondary' as const, label: 'Lead' },
  parceiro: { variant: 'secondary' as const, label: 'Parceiro' },
  cadastrado: { variant: 'secondary' as const, label: 'Cadastrado' },
};

interface ParceiroProps {
  client: Client;
  bannerOnly?: boolean;
}

export default function Parceiro({ client, bannerOnly = false }: ParceiroProps) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [termoAceito, setTermoAceito] = useState<boolean | null>(null);
  const [aceitaTermoCheckbox, setAceitaTermoCheckbox] = useState(false);
  const [isAceitandoTermo, setIsAceitandoTermo] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setHasScrolledToBottom(true);
    }
  };

  const handleBecomeClient = async () => {
    if (!client?.id) return;
    try {
      setIsConverting(true);
      await parceiroService.becomeLead(client.id);
      const msg = encodeURIComponent(`Olá, sou ${client.name}, sou parceiro e gostaria de me tornar cliente.`);
      const phone = "552997892095"; 
      const waUrl = `https://wa.me/${phone}?text=${msg}`;
      window.open(waUrl, '_blank');
    } catch (error) {
      console.error('Erro ao converter para lead:', error);
      alert('Erro ao processar solicitação.');
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!client?.id) return;
      try {
        setIsLoading(true);
        const termoStatusResult = await parceiroService.getTermoStatus(client.id);
        const termoStatusData = termoStatusResult?.data || termoStatusResult;
        setTermoAceito(termoStatusData?.aceito || false);
        if (termoStatusData?.aceito) {
          const metricsData = await parceiroService.getMetrics(client.id);
          setMetrics(metricsData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setTermoAceito(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [client?.id]);

  const handleAceitarTermo = async () => {
    if (!aceitaTermoCheckbox || !client?.id) return;
    try {
      setIsAceitandoTermo(true);
      await parceiroService.aceitarTermo(client.id);
      setTermoAceito(true);
      const metricsData = await parceiroService.getMetrics(client.id);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erro ao aceitar termo:', error);
      alert('Erro ao aceitar o termo.');
    } finally {
      setIsAceitandoTermo(false);
    }
  };

  const displayId = client.clientId || client.id;
  const referralLink = `${window.location.origin}/indicado/${displayId}`;

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || termoAceito === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (termoAceito === false) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
        <div className="bg-white dark:bg-gray-900 rounded-[32px] w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-white/10">
          
          <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Rocket className="text-white h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Termo de Parceria</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Bora Expandir • Versão 1.0 (Abril 2026)</p>
              </div>
            </div>
            <Badge variant="outline" className="h-7 px-3 border-2 border-blue-500/20 text-blue-600 font-black text-[10px] uppercase tracking-widest">
              Ação Requerida
            </Badge>
          </div>

          <div 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto bg-slate-100 dark:bg-gray-950 p-4 sm:p-10"
          >
            <div className="max-w-[850px] mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-sm p-8 sm:p-20 text-gray-800 dark:text-gray-200 min-h-[150vh] relative border border-gray-100 dark:border-gray-800">
               <div className="flex flex-col items-center text-center mb-16 border-b pb-12 border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-8 select-none">
                    <span className="text-3xl font-black text-blue-600 tracking-tighter">BORA</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">EXPANDIR</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">Termos e Condições de Parceria Comercial</h1>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Bora Expandir Ltda • CNPJ 55.218.947/0001-65</p>
                  <div className="w-20 h-1 bg-blue-600 mt-6 rounded-full" />
               </div>

               <div className="font-serif leading-relaxed text-[16px] text-justify whitespace-pre-wrap">
                  {TERMO_PARCEIRO_TEXT}
               </div>

               <div className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-xs text-gray-400 font-medium italic">Documento gerado automaticamente pela plataforma Bora Expandir em {new Date().toLocaleDateString()}</p>
               </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <div className="max-w-4xl mx-auto flex flex-col gap-6 text-center">
              
              {!hasScrolledToBottom && (
                <div className="flex items-center justify-center gap-3 animate-bounce">
                  <TrendingUp className="text-blue-600 h-4 w-4 rotate-180" />
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Role até o final para habilitar o aceite</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className={cn(
                  "flex items-start gap-4 p-5 rounded-2xl border-2 transition-all flex-1 w-full text-left bg-white dark:bg-gray-800 shadow-sm",
                  hasScrolledToBottom ? "border-blue-500/30" : "border-gray-200 dark:border-gray-700 opacity-50"
                )}>
                  <input
                    type="checkbox"
                    id="aceita-termo"
                    disabled={!hasScrolledToBottom}
                    checked={aceitaTermoCheckbox}
                    onChange={(e) => setAceitaTermoCheckbox(e.target.checked)}
                    className="mt-1 cursor-pointer accent-blue-600 w-6 h-6 rounded-lg disabled:cursor-not-allowed"
                  />
                  <label htmlFor="aceita-termo" className={cn(
                    "text-sm font-bold cursor-pointer select-none leading-tight",
                    hasScrolledToBottom ? "text-gray-900 dark:text-white" : "text-gray-400"
                  )}>
                    Li e concordo integralmente com os termos e condições da parceria comercial acima descritos.
                  </label>
                </div>

                <div className="flex gap-3 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => navigate('/cliente')}
                    className="px-8 py-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase text-[10px] tracking-widest shadow-sm"
                  >
                    Sair
                  </button>
                  
                  <button
                    onClick={handleAceitarTermo}
                    disabled={!hasScrolledToBottom || !aceitaTermoCheckbox || isAceitandoTermo}
                    className={cn(
                      "px-8 py-5 font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2",
                      (hasScrolledToBottom && aceitaTermoCheckbox) 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed grayscale"
                    )}
                  >
                    {isAceitandoTermo ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 font-black" />
                    )}
                    {isAceitandoTermo ? 'Processando...' : 'Li e Aceito os Termos'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (bannerOnly) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-gray-900 dark:text-white">Bem-vindo, Parceiro!</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-light mt-2">Escolha uma opção para começar ou veja suas métricas no menu ao lado.</p>
        </div>

        <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-1 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 mt-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
             <Rocket size={120} />
          </div>
          
          <div className="relative bg-white dark:bg-gray-900 rounded-[calc(1.5rem-2px)] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Zap size={14} className="animate-pulse" />
                Oportunidade Exclusiva
              </div>
              <h3 className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-white tracking-tight leading-tight">
                Inicie seu próprio <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">processo</span>
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-xl">
                Como nosso parceiro, você tem condições especiais para realizar seu próprio processo de cidadania ou visto. Comece sua jornada internacional hoje mesmo!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button 
                onClick={handleBecomeClient}
                disabled={isConverting}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_20px_30px_-10px_rgba(37,99,235,0.5)] transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isConverting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
                )}
                {isConverting ? 'Processando...' : 'Se tornar cliente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-gray-900 dark:text-white">Programa de Indicações</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-light mt-2">Acompanhe suas indicações e ganhe comissões</p>
      </div>

      <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-600 to-cyan-600" />
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-900 dark:text-white tracking-tight">Seu Link de Indicação</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 w-full sm:w-auto bg-gray-50 dark:bg-gray-700/50 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 text-sm font-mono hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors truncate"
              title={referralLink}
            >
              {referralLink}
            </a>
            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Users, label: 'Indicações', value: metrics.referrals, period: metrics.last30Days.referrals, color: 'blue' },
          { icon: TrendingUp, label: 'Conversões', value: metrics.conversions, period: metrics.last30Days.conversions, color: 'emerald' },
          { icon: Zap, label: 'Receita', value: `R$ ${metrics.revenue.toFixed(2)}`, period: `R$ ${metrics.last30Days.revenue.toFixed(2)}`, color: 'amber' }
        ].map((stat, idx) => {
          const Icon = stat.icon
          const colors = {
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
          }
          return (
            <div key={idx} className="group relative p-6 sm:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col items-start gap-4">
                <div className={`p-3 rounded-xl ${colors[stat.color as keyof typeof colors]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-white tracking-tight mt-2">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">Últimos 30 dias: {stat.period}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-light text-gray-900 dark:text-white tracking-tight">Seus Indicados</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Acompanhe o progresso de cada indicação</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {metrics.referralList && metrics.referralList.length > 0 ? (
                metrics.referralList.map((referral: any) => {
                  const statusInfo = statusConfig[referral.status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: referral.status || 'Pendente' };
                  return (
                    <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{referral.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{referral.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{referral.service}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {new Date(referral.referredDate).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma indicação ainda. Comece a compartilhar seu link!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
