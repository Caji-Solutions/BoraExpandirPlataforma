import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  Target, 
  MapPin, 
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  FileText,
  Users
} from 'lucide-react';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from '@/modules/shared/components/ui/button';

interface ModalDetalhesItemProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export function ModalDetalhesItem({ isOpen, onClose, item }: ModalDetalhesItemProps) {
  if (!isOpen || !item) return null;

  const isAgendamento = item._tipoFila === 'agendamento';
  const formulario = isAgendamento ? item.formularios_cliente?.[0] : null;
  const responsavel = item.responsavel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card border shadow-2xl rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-muted/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] uppercase font-black tracking-widest">
                {isAgendamento ? 'Agendamento Confirmado' : 'Processo Jurídico'}
              </Badge>
              {responsavel && (
                <Badge className="bg-green-500/10 text-green-600 border-green-200 rounded-full px-2 py-0 text-[10px] uppercase font-black">
                  Delegado
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              Detalhes da Solicitação
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna 1: Informações do Cliente */}
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Dados do Cliente
                </h3>
                <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Nome</span>
                    <span className="font-bold">{item.clientes?.nome || item.nome || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-muted-foreground">Email</span>
                      <span className="text-sm font-medium truncate">{item.clientes?.email || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-muted-foreground">WhatsApp</span>
                      <span className="text-sm font-medium">{item.clientes?.whatsapp || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5" />
                  Serviço Contratado
                </h3>
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                  <p className="text-lg font-black text-primary">
                    {item.catalogo_servicos?.nome || item.tipo_servico || item.produto_nome}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {item.data_hora && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.data_hora).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {item.data_hora && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(item.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {responsavel && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Responsável Jurídico
                  </h3>
                  <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                      <span className="text-green-600 font-black text-xl">
                        {responsavel.full_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-black text-foreground">{responsavel.full_name}</p>
                      <p className="text-xs text-muted-foreground font-medium">{responsavel.email}</p>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Coluna 2: Detalhes do Formulário (se houver) */}
            <div className="space-y-6">
              {formulario ? (
                <>
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <Target className="h-3.5 w-3.5" />
                      Objetivos e Destino
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-muted/30 rounded-2xl p-4">
                        <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">País de Destino</span>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          <span className="font-bold">{formulario.pais_destino || 'Não informado'}</span>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4">
                        <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Objetivo de Imigração</span>
                        <span className="font-bold leading-tight block">{formulario.objetivo_imigracao || 'Não informado'}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <Info className="h-3.5 w-3.5" />
                      Informações Adicionais
                    </h3>
                    <div className="bg-muted/30 rounded-2xl p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-muted-foreground">Estado Civil</span>
                          <span className="text-sm font-bold uppercase">{formulario.estado_civil || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-muted-foreground">Tem Filhos?</span>
                          <span className="text-sm font-bold">{formulario.tem_filhos ? `Sim (${formulario.quantidade_filhos})` : 'Não'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col border-t pt-3">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Profissão</span>
                        <span className="text-sm font-bold">{formulario.profissao || 'Não informado'}</span>
                      </div>
                      <div className="flex flex-col border-t pt-3">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Observações</span>
                        <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                          {formulario.observacoes || 'Sem observações adicionais.'}
                        </p>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="font-black text-muted-foreground/50 uppercase text-xs tracking-widest">
                    Sem dados de formulário
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Esta solicitação não possui um formulário de consultoria atrelado ou preenchido.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-8 font-black uppercase text-xs tracking-widest">
            Fechar
          </Button>
          {!responsavel && isAgendamento && (
            <Button className="rounded-xl px-8 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
              Delegar Agora
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
