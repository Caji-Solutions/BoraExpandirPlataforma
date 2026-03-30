import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Client } from '../../types';
import { parceiroService } from '../../services/parceiroService';

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
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  // Modal de Termo Bloqueante
  if (termoAceito === false) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-8 max-w-2xl w-full mx-4 border border-gray-200 dark:border-neutral-700 max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Termo de Parceria</h2>

          <div className="bg-gray-50 dark:bg-neutral-700/50 rounded p-6 mb-6 max-h-96 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {TERMO_PARCEIRO_TEXT}
          </div>

          <div className="mb-6 flex items-start gap-3">
            <input
              type="checkbox"
              id="aceita-termo"
              checked={aceitaTermoCheckbox}
              onChange={(e) => setAceitaTermoCheckbox(e.target.checked)}
              className="mt-1 cursor-pointer"
            />
            <label htmlFor="aceita-termo" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Li e aceito os termos de parceria acima
            </label>
          </div>

          <button
            onClick={handleAceitarTermo}
            disabled={!aceitaTermoCheckbox || isAceitandoTermo}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isAceitandoTermo ? 'Processando...' : 'Aceitar e Continuar'}
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando métricas...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Link de Indicação */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Seu Link de Indicação</h2>
        <div className="flex items-center gap-2">
          <a 
            href={referralLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white dark:bg-neutral-900 px-4 py-2 rounded border border-gray-200 dark:border-neutral-700 text-blue-600 dark:text-blue-400 text-sm overflow-hidden hover:underline"
          >
            {referralLink}
          </a>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Indicações</h2>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{metrics.referrals}</p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Últimos 30 dias: {metrics.last30Days.referrals}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversões</h2>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{metrics.conversions}</p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Últimos 30 dias: {metrics.last30Days.conversions}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Receita</h2>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">R$ {metrics.revenue.toFixed(2)}</p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Últimos 30 dias: R$ {metrics.last30Days.revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Listagem de Indicados */}
      <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seus Indicados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {metrics.referralList?.map((referral: any) => {
                const statusInfo = statusConfig[referral.status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: referral.status || 'Pendente' };
                return (
                  <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition">
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Materiais de Divulgação */}
      <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Materiais de Divulgação</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Use os materiais abaixo para divulgar seu link de indicação:</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">Download Banner</button>
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">Download Flyer</button>
            <button className="px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-600 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition">Ver Guia</button>
          </div>
        </div>
      </div>
    </div>
  );
}