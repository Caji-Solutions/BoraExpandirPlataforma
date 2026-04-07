import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Search, Folder, User, ClipboardList, AlertCircle } from 'lucide-react';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from '@/modules/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/modules/shared/components/ui/tabs';
import juridicoService, { Processo } from '../services/juridicoService';
import { cn } from '@/lib/utils';

export function ProcessosProtocolados() {
  const navigate = useNavigate();
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('protocolados');

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

  const protocolados = useMemo(() => 
    processos.filter(p => p.status === 'processo_protocolado'), 
  [processos]);

  const naoProtocolados = useMemo(() => 
    processos.filter(p => p.status !== 'processo_protocolado'), 
  [processos]);

  const getFilteredList = (list: Processo[]) => {
    const term = searchTerm.toLowerCase();
    return list.filter(p => {
      const clientName = p.clientes?.nome || '';
      const clientId = p.cliente_id || '';
      return clientName.toLowerCase().includes(term) || clientId.toLowerCase().includes(term);
    });
  };

  const filteredProtocolados = getFilteredList(protocolados);
  const filteredNaoProtocolados = getFilteredList(naoProtocolados);

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse">
        <p className="text-muted-foreground italic">Carregando processos da supervisão...</p>
      </div>
    );
  }

  const ProcessTable = ({ list, type }: { list: Processo[], type: 'protocolados' | 'nao_protocolados' }) => (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">
        <div className="col-span-3 text-left">Cliente</div>
        <div className="col-span-2">Serviço</div>
        <div className="col-span-2">Responsável</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1">Data</div>
        <div className="col-span-2">Ações</div>
      </div>

      <div className="divide-y divide-border">
        {list.map((processo) => {
          const protocolDate = processo.atualizado_em
            ? new Date(processo.atualizado_em).toLocaleDateString()
            : '-';

          const isProtocolado = processo.status === 'processo_protocolado';

          return (
            <div
              key={processo.id}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-muted/30 cursor-pointer group"
              onClick={() => navigate(`/juridico/protocolado/${processo.id}`)}
            >
              <div className="col-span-3 flex items-center gap-3 text-left">
                <div className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  isProtocolado ? "bg-green-500/10 group-hover:bg-green-500/20" : "bg-amber-500/10 group-hover:bg-amber-500/20"
                )}>
                  {isProtocolado ? (
                    <FileCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <ClipboardList className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {processo.clientes?.nome || 'Cliente'}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    ID: {processo.clientes?.client_id || processo.cliente_id}
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
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-tight",
                    isProtocolado ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"
                  )}
                >
                  {processo.status?.replace('_', ' ') || 'Pendente'}
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

        {list.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            {type === 'protocolados' ? (
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-10" />
            ) : (
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-10" />
            )}
            <p>Nenhum processo nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-light text-foreground tracking-tight">Gestão de Protocolos</h1>
            <p className="text-muted-foreground mt-1">Supervisão de processos enviados para a Europa</p>
          </div>
          <div className="flex gap-2">
             <Badge variant="outline" className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border-green-200">
               {protocolados.length} Protocolados
             </Badge>
             <Badge variant="outline" className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border-amber-200">
               {naoProtocolados.length} Em Espera
             </Badge>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
              <input
                type="text"
                placeholder="Buscar por cliente ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-inner text-sm"
              />
            </div>
            
            <Tabs defaultValue="protocolados" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full md:w-[400px] h-12 bg-muted/50 rounded-xl p-1">
                <TabsTrigger value="protocolados" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Protocolados
                </TabsTrigger>
                <TabsTrigger value="nao_protocolados" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Não Protocolados
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs value={activeTab} className="w-full">
            <TabsContent value="protocolados" className="mt-0 outline-none">
              <ProcessTable list={filteredProtocolados} type="protocolados" />
            </TabsContent>
            <TabsContent value="nao_protocolados" className="mt-0 outline-none">
              <ProcessTable list={filteredNaoProtocolados} type="nao_protocolados" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
