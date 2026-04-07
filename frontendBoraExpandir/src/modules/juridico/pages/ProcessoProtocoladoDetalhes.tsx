import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileCheck, FileText, ExternalLink, User, Dna, MapPin, Calendar, Briefcase, Download, Folder, Building2 } from 'lucide-react';
import { Button } from '@/modules/shared/components/ui/button';
import { Badge } from '@/modules/shared/components/ui/badge';
import juridicoService from '../services/juridicoService';

export function ProcessoProtocoladoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState<any>(null);
  const [dependentes, setDependentes] = useState<any[]>([]);
  const [clienteDna, setClienteDna] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await juridicoService.getProcessoProtocoladoDetails(id);
        setProcesso(data);

        if (data?.cliente_id) {
          let deps: any[] = [];
          let dna: any = {};
          try {
            const results = await Promise.all([
              juridicoService.getDependentes(data.cliente_id),
              juridicoService.getClienteDNA(data.cliente_id)
            ]);
            deps = results[0] || [];
            dna = results[1] || {};
          } catch(e) {
             console.warn('Erro parcial ao carregar complementares do protocolo', e);
          }
          setDependentes(deps);
          setClienteDna(dna);
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do processo protocolado:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse">
        <p className="text-muted-foreground">Carregando detalhes...</p>
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Processo não encontrado.</p>
        <Button
          variant="outline"
          onClick={() => navigate('/juridico/protocolados')}
          className="mt-4"
        >
          Voltar
        </Button>
      </div>
    );
  }

  const docs = processo.documentos || [];
  const cliente = processo.clientes;
  const responsavel = processo.responsavel;

  // Organizar membros (Titular + Dependentes)
  const members = [
    { id: processo.cliente_id, name: cliente?.nome || 'Titular', type: 'Titular', isTitular: true },
    ...(dependentes || []).map((d: any) => ({
      id: d.id, name: d.nome_completo || d.name, type: d.parentesco || 'Dependente', isTitular: false
    }))
  ];

  // Agrupar documentos por membro
  const groupedDocs = members.map(m => {
     return {
        ...m,
        docs: docs.filter((doc: any) => (doc.dependente_id || processo.cliente_id) === m.id)
     }
  }).filter(m => m.docs.length > 0 || m.isTitular);

  const localProtocolo = clienteDna?.cidade_protocolo || 'Não informado';
  const previsaoChegada = cliente?.previsao_chegada ? new Date(cliente.previsao_chegada).toLocaleDateString() : 'Sem previsão';
  const dataProtocolado = processo.atualizado_em ? new Date(processo.atualizado_em).toLocaleDateString() : 'N/A';

  const downloadAllFromMember = (memberDocs: any[]) => {
    // Abrir links numa nova guia para facilitar download (forma básica sem ZIP)
    memberDocs.forEach(d => {
       if (d.public_url) window.open(d.public_url, '_blank');
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back + Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/juridico/protocolados')}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Voltar
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-foreground">
                  {cliente?.nome || 'Cliente'}
                </h1>
                <Badge variant="outline" className="text-xs font-bold border-green-300 text-green-700 bg-green-50 px-3 py-1 uppercase tracking-widest shadow-sm">
                  Protocolado em {dataProtocolado}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                Serviço Base: {processo.tipo_servico || 'Serviço Principal'}
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                ID: {processo.cliente_id}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="shrink-0 gap-2 font-bold"
            onClick={() => navigate(`/juridico/dna?clienteId=${processo.cliente_id}`)}
          >
            <Dna className="h-4 w-4 text-primary" />
            Acessar DNA Completo
          </Button>
        </div>

        {/* Info Cards Row 1 - Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 opacity-70">
              <Building2 className="h-4 w-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Local do Protocolo</h3>
            </div>
            <p className="text-base font-bold text-foreground truncate">{localProtocolo}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 opacity-70">
              <Calendar className="h-4 w-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Chegada na Espanha</h3>
            </div>
            <p className="text-base font-bold text-foreground">{previsaoChegada}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 opacity-70">
              <User className="h-4 w-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Status Cliente</h3>
            </div>
            <Badge variant="outline" className="text-xs uppercase bg-muted/50">{cliente?.status?.replace(/_/g, ' ') || 'N/A'}</Badge>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 opacity-70 text-blue-700 dark:text-blue-400">
              <FileCheck className="h-4 w-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Supervisor Resp.</h3>
            </div>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100 truncate">{responsavel?.full_name || 'Não designado'}</p>
            <p className="text-[10px] text-blue-600/70 truncate">{responsavel?.email || ''}</p>
          </div>
        </div>

        {/* Documents Dossiê Area */}
        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground ml-2">Dossiê do Processo</h2>
          
          {groupedDocs.map((member, idx) => (
             <div key={idx} className="bg-white dark:bg-gray-800 border rounded-3xl overflow-hidden shadow-sm">
               <div className="bg-muted/40 px-6 py-4 border-b flex flex-wrap gap-4 items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white shadow-inner font-bold text-lg ${member.isTitular ? 'bg-primary' : 'bg-slate-400'}`}>
                     {member.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <div className="flex items-center gap-2">
                       <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                       <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest bg-white dark:bg-gray-900 shadow-sm">{member.type}</Badge>
                     </div>
                     <p className="text-xs text-muted-foreground mt-0.5">
                       {member.docs.length} arquivo(s) válidos no dossiê
                     </p>
                   </div>
                 </div>
                 {member.docs.length > 0 && (
                   <Button 
                     variant="outline" 
                     className="shrink-0 gap-2 shadow-sm font-bold active:scale-[0.98]"
                     onClick={() => downloadAllFromMember(member.docs)}
                   >
                     <Download className="h-4 w-4 text-blue-500" />
                     Baixar Pasta ({member.docs.length})
                   </Button>
                 )}
               </div>

               <div className="p-6">
                 {member.docs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {member.docs.map((doc: any) => (
                         <div key={doc.id} className="group relative flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-muted/30 transition-all border-dashed hover:border-solid hover:border-primary/30">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                               <FileText className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0 pr-8">
                               <p className="text-sm font-bold text-foreground truncate" title={doc.tipo?.toUpperCase()}>
                                 {doc.tipo ? doc.tipo.replace(/_/g, ' ').toUpperCase() : 'DOCUMENTO'}
                               </p>
                               <div className="flex items-center gap-2 mt-1">
                                 {doc.apostilado && <span className="text-[9px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider">Apostilado</span>}
                                 {doc.traduzido && <span className="text-[9px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider">Traduzido</span>}
                               </div>
                               <p className="text-[10px] text-muted-foreground truncate mt-1.5">
                                 {doc.nome_original || 'Sem nome original'}
                               </p>
                            </div>
                            {doc.public_url && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); window.open(doc.public_url, '_blank'); }}
                                className="absolute right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow shadow-black/5 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 hover:text-primary"
                                title="Baixar / Visualizar"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                         </div>
                      ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-50">
                       <Folder className="h-10 w-10 mb-2" />
                       <p className="text-sm">Nenhum documento físico registrado.</p>
                    </div>
                 )}
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
