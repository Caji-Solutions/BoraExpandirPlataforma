import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, Loader2, Filter } from 'lucide-react';
import assessoriaDiretaJuridicoService, { AssessoriaDiretaItem } from '../services/assessoriaDiretaService';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  em_espera: { label: 'Em Espera', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Loader2 },
  realizado: { label: 'Realizado', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
};

const filterOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'em_espera', label: 'Em Espera' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'realizado', label: 'Realizado' },
];

export function AssessoriaDiretaJuridicoPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AssessoriaDiretaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await assessoriaDiretaJuridicoService.getAssessoriasDiretas(statusFilter);
      setItems(data);
    } catch (err) {
      console.error('Erro ao buscar assessorias diretas:', err);
      setError('Nao foi possivel carregar as assessorias diretas.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/juridico/assessoria-direta/${id}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Assessoria Direta
          </h1>
          <p className="text-muted-foreground mt-1">
            Serviços de assessoria sem agendamento - todos os comerciais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center animate-pulse">
          <p className="text-muted-foreground">Carregando assessorias diretas...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma assessoria direta encontrada.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Cliente</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Serviço</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Valor</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Comercial</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const config = statusConfig[item.status] || statusConfig.em_espera;
                  const StatusIcon = config.icon;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item.id)}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{item.clienteNome}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{item.servicoNome}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.valor != null ? `€ ${Number(item.valor).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{item.comercialNome}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessoriaDiretaJuridicoPage;
