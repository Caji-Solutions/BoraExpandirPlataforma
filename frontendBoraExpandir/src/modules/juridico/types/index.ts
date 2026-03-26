// Juridico Service types
export interface Processo {
  id: string;
  cliente_id: string;
  tipo_servico: string;
  status: string;
  etapa_atual: string;
  created_at: string;
  updated_at: string;
  observacoes?: string;
  clientes?: { nome: string };
}

export interface ProcessoStep {
  nome: string;
  descricao: string;
  data?: string;
  status: 'pendente' | 'em_progresso' | 'concluido';
}

export interface ProcessQueue {
  id: string;
  processoId: string;
  status: 'aguardando_analise' | 'em_analise' | 'concluido' | 'retornado';
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface DocumentoRequerimento {
  id: string;
  processoId: string;
  tipo: string;
  status: 'pendente' | 'enviado' | 'validado' | 'recusado';
  created_at: string;
}
