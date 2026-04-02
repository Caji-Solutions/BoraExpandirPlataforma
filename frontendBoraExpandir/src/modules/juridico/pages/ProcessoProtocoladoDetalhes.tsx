import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileCheck, FileText, ExternalLink, User, Dna } from 'lucide-react';
import { Button } from '@/modules/shared/components/ui/button';
import { Badge } from '@/modules/shared/components/ui/badge';
import juridicoService from '../services/juridicoService';

export function ProcessoProtocoladoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await juridicoService.getProcessoProtocoladoDetails(id);
        setProcesso(data);
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

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return <Badge variant="success" className="text-[9px]">Aprovado</Badge>;
    if (s === 'REJECTED') return <Badge variant="destructive" className="text-[9px]">Rejeitado</Badge>;
    if (s === 'PENDING') return <Badge variant="warning" className="text-[9px]">Pendente</Badge>;
    if (s.includes('ANALYZING')) return <Badge variant="secondary" className="text-[9px]">Em Análise</Badge>;
    return <Badge variant="outline" className="text-[9px]">{status || 'N/A'}</Badge>;
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back + Header */}
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {cliente?.nome || 'Cliente'}
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              {processo.tipo_servico || 'Serviço'}
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <Badge variant="outline" className="text-[9px] border-green-300 text-green-700 bg-green-50">
                PROTOCOLADO
              </Badge>
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Client Info */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cliente</h3>
            </div>
            <p className="text-sm font-semibold text-foreground">{cliente?.nome || '-'}</p>
            <p className="text-xs text-muted-foreground mt-1">{cliente?.email || '-'}</p>
            {cliente?.whatsapp && (
              <p className="text-xs text-muted-foreground">{cliente.whatsapp}</p>
            )}
            <p className="text-[10px] text-muted-foreground font-mono mt-2">ID: {processo.cliente_id}</p>
          </div>

          {/* Responsável */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Supervisor Responsável</h3>
            </div>
            <p className="text-sm font-semibold text-foreground">{responsavel?.full_name || '-'}</p>
            <p className="text-xs text-muted-foreground mt-1">{responsavel?.email || '-'}</p>
          </div>

          {/* Links */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Links</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => navigate(`/juridico/dna?clienteId=${processo.cliente_id}`)}
            >
              <Dna className="h-4 w-4 mr-2 text-primary" />
              Ver DNA do Cliente
            </Button>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Documentos do Processo
            </h3>
            <Badge variant="outline" className="text-[10px]">
              {docs.length} documento{docs.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="divide-y divide-border">
            {docs.length > 0 ? docs.map((doc: any) => (
              <div key={doc.id} className="grid grid-cols-12 gap-4 px-6 py-3 items-center">
                <div className="col-span-1">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="col-span-4">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.tipo || doc.nome_original || 'Documento'}
                  </p>
                  {doc.nome_original && (
                    <p className="text-[10px] text-muted-foreground truncate">{doc.nome_original}</p>
                  )}
                </div>
                <div className="col-span-2 text-center">
                  {getStatusBadge(doc.status)}
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[10px]">
                    {doc.apostilado ? (
                      <Badge variant="success" className="text-[8px]">Apostilado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[8px] opacity-50">Sem Apostila</Badge>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[10px]">
                    {doc.traduzido ? (
                      <Badge variant="success" className="text-[8px]">Traduzido</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[8px] opacity-50">Sem Tradução</Badge>
                    )}
                  </div>
                </div>
                <div className="col-span-1 text-center">
                  {doc.public_url && (
                    <a
                      href={doc.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-[10px] font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Abrir
                    </a>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-10" />
                <p className="text-sm">Nenhum documento encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
