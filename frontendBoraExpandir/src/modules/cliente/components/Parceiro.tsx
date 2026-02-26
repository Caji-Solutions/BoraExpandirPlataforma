import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Client } from '../types';
import { parceiroService } from '../services/parceiroService';

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

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!client?.id) return;
      try {
        setIsLoading(true);
        const data = await parceiroService.getMetrics(client.id);
        setMetrics(data);
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [client?.id]);

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

  if (isLoading || !metrics) {
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