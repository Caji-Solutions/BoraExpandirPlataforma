import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from '../../../components/ui/Badge';
import { FileText, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Requerimento {
  id: string;
  tipo: string;
  status: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

interface RequerimentosProps {
  clienteId: string;
}

export function Requerimentos({ clienteId }: RequerimentosProps) {
  const [requerimentos, setRequerimentos] = useState<Requerimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchRequerimentos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/cliente/${clienteId}/requerimentos`);
        if (!response.ok) throw new Error('Falha ao buscar requerimentos');
        
        const result = await response.json();
        setRequerimentos(result.data || []);
      } catch (err) {
        console.error('Erro ao buscar requerimentos:', err);
        setError('Não foi possível carregar os requerimentos.');
      } finally {
        setLoading(false);
      }
    };

    if (clienteId) {
      fetchRequerimentos();
    }
  }, [clienteId, API_BASE_URL]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return <Badge variant="warning">Pendente</Badge>;
      case 'em_analise':
        return <Badge variant="default">Em Análise</Badge>;
      case 'concluido':
        return <Badge variant="success">Concluído</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'concluido':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Meus Requerimentos
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Acompanhe o status dos requerimentos solicitados pela equipe jurídica.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requerimentos.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-12 w-12 text-gray-300 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nenhum requerimento</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                No momento não existem requerimentos pendentes ou solicitados para o seu processo.
              </p>
            </div>
          </Card>
        ) : (
          requerimentos.map((req) => (
            <Card key={req.id} className="p-5 hover:shadow-md transition-shadow border-l-4 border-l-primary">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                    {getStatusIcon(req.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{req.tipo}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-medium">Solicitado em: {new Date(req.created_at).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      {getStatusBadge(req.status)}
                    </div>
                    {req.observacoes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-gray-600 dark:text-gray-300 italic border-l-2 border-primary/30">
                        "{req.observacoes}"
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Última Atualização</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {new Date(req.updated_at).toLocaleDateString()} às {new Date(req.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-100 italic">Informação Importante</h4>
            <p className="text-sm text-blue-800/80 dark:text-blue-200/70 mt-1 leading-relaxed">
              Os requerimentos são solicitações de ações ou serviços específicos necessários para o progresso do seu caso (ex: traduções, apostilamentos, taxas). 
              Fique atento ao status de cada um e, caso tenha dúvidas, entre em contato com seu gestor de processo através das configurações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
