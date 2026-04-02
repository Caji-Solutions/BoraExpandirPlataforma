import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Search, Folder, User } from 'lucide-react';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from '@/modules/shared/components/ui/button';
import juridicoService, { Processo } from '../services/juridicoService';

export function ProcessosProtocolados() {
  const navigate = useNavigate();
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await juridicoService.getProcessosProtocolados();
        setProcessos(data);
      } catch (error) {
        console.error('Erro ao buscar processos protocolados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = processos.filter(p => {
    const clientName = p.clientes?.nome || '';
    const clientId = p.cliente_id || '';
    const term = searchTerm.toLowerCase();
    return clientName.toLowerCase().includes(term) || clientId.toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse">
        <p className="text-muted-foreground">Carregando processos protocolados...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Processos Protocolados</h1>
            <p className="text-muted-foreground mt-1">Processos enviados para protocolação</p>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2 bg-background shadow-sm border-gray-200">
            {filtered.length} processos
          </Badge>
        </div>

        {/* Search */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
            <input
              type="text"
              placeholder="Buscar por nome do cliente ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-inner text-base"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">
            <div className="col-span-3 text-left">Cliente</div>
            <div className="col-span-2">Serviço</div>
            <div className="col-span-2">Responsável</div>
            <div className="col-span-2">Documentos</div>
            <div className="col-span-1">Data</div>
            <div className="col-span-2">Ações</div>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((processo) => {
              const docs = processo.documentos || [];
              const protocolDate = processo.atualizado_em
                ? new Date(processo.atualizado_em).toLocaleDateString()
                : '-';

              return (
                <div
                  key={processo.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-muted/30 cursor-pointer group"
                  onClick={() => navigate(`/juridico/protocolado/${processo.id}`)}
                >
                  <div className="col-span-3 flex items-center gap-3 text-left">
                    <div className="h-9 w-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                      <FileCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {processo.clientes?.nome || 'Cliente'}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        ID: {processo.cliente_id}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 text-center text-xs font-medium">
                    {processo.tipo_servico || '-'}
                  </div>

                  <div className="col-span-2 text-center text-xs">
                    {(processo.responsavel as any)?.full_name || '-'}
                  </div>

                  <div className="col-span-2 text-center">
                    <Badge variant="outline" className="text-[10px]">
                      {docs.length} documento{docs.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="col-span-1 text-center text-[10px] text-muted-foreground">
                    {protocolDate}
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold h-8 px-4 rounded-xl shadow-sm group-hover:scale-105 transition-all"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-10" />
                <p>Nenhum processo protocolado encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
