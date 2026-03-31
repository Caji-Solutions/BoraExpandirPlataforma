import { useState, useEffect } from 'react';
import { Copy, Check, Link as LinkIcon, TrendingUp, Users, Zap } from 'lucide-react';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Client } from '../../../cliente/types';
import { parceiroService } from '../../../cliente/services/parceiroService';

const TERMO_PARCEIRO_TEXT = `
TERMO DE PARCERIA

Bem-vindo ao Programa de Parceria da Bora Expandir!

Este termo estabelece os direitos e responsabilidades ao utilizar sua área de parceiro em nossa plataforma.

RESPONSABILIDADES DO PARCEIRO:
1. Manter a confidencialidade de informações compartilhadas
2. Não divulgar dados de clientes a terceiros sem autorização
3. Seguir todas as políticas e procedimentos da Bora Expandir
4. Responder adequadamente às indicações dentro de prazos acordados

DIREITOS DO PARCEIRO:
1. Acessar métricas de indicações e conversões
2. Receber comissões conforme acordado
3. Utilizar materiais de marketing fornecidos
4. Suporte dedicado da equipe

TERMOS GERAIS:
- Este programa pode ser modificado a qualquer momento com notificação prévia
- A Bora Expandir se reserva o direito de remover parceiros que violarem este termo
- Todas as indicações devem ser feitas através do link oferecido

Ao clicar em "Aceitar e Continuar", você concorda com todos os termos acima.
`;


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
}

export default function Parceiro({ client }: ParceiroProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [termoAceito, setTermoAceito] = useState<boolean | null>(null);
  const [aceitaTermoCheckbox, setAceitaTermoCheckbox] = useState(false);
  const [isAceitandoTermo, setIsAceitandoTermo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!client?.id) return;
      try {
        setIsLoading(true);

        // Verificar status do termo
        const termoStatusResult = await parceiroService.getTermoStatus(client.id);
        const termoStatusData = termoStatusResult?.data || termoStatusResult;
        setTermoAceito(termoStatusData?.aceito || false);

        // Se o termo foi aceito, buscar métricas
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
      setAceitaTermoCheckbox(false);

      // Buscar métricas após aceitar
      const metricsData = await parceiroService.getMetrics(client.id);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erro ao aceitar termo:', error);
      alert('Erro ao aceitar o termo. Por favor, tente novamente.');
    } finally {
      setIsAceitandoTermo(false);
    }
  };

  // O ID agora vem da coluna client_id (mapeado para client.clientId no frontend)
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
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-light">Carregando...</p>
        </div>
      </div>
    );
  }

  // Modal de Termo Bloqueante
  if (termoAceito === false) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-200 dark:border-gray-700 max-h-screen overflow-y-auto shadow-2xl">
          <div className="mb-6">
            <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">Termo de Parceria</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Leia e aceite os termos para continuar</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 mb-8 max-h-96 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border border-gray-200 dark:border-gray-600">
            {TERMO_PARCEIRO_TEXT}
          </div>

          <div className="mb-8 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-900/30">
            <input
              type="checkbox"
              id="aceita-termo"
              checked={aceitaTermoCheckbox}
              onChange={(e) => setAceitaTermoCheckbox(e.target.checked)}
              className="mt-1 cursor-pointer accent-blue-600 w-5 h-5"
            />
            <label htmlFor="aceita-termo" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
              Li e aceito os termos de parceria acima
            </label>
          </div>

          <button
            onClick={handleAceitarTermo}
            disabled={!aceitaTermoCheckbox || isAceitandoTermo}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {isAceitandoTermo ? 'Processando...' : 'Aceitar e Continuar'}
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-light">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-gray-900 dark:text-white">Programa de Indicações</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-light mt-2">Acompanhe suas indicações e ganhe comissões</p>
      </div>

      {/* Link de Indicação - Premium Card */}
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

      {/* Métricas - Premium Stats */}
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

      {/* Listagem de Indicados */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-light text-gray-900 dark:text-white tracking-tight">Seus Indicados</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Acompanhe o progresso de cada indicação</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {metrics.referralList && metrics.referralList.length > 0 ? (
                metrics.referralList.map((referral: any) => {
                  const statusInfo = statusConfig[referral.status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: referral.status || 'Pendente' };
                  return (
                    <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{referral.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{referral.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{referral.service}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
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

      {/* Materiais de Divulgação */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-light text-gray-900 dark:text-white tracking-tight">Materiais de Divulgação</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Use os materiais abaixo para potencializar suas indicações</p>
        </div>
        <div className="p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Download Banner
            </button>
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Download Flyer
            </button>
            <button className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              Ver Guia
            </button>
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="h-8" />
    </div>
  );
}
