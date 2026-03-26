// Apostilamento types
export interface Apostilamento {
  id: string;
  processoId: string;
  status: 'pendente' | 'processando' | 'concluido' | 'falhou';
  urlArquivo?: string;
  dataApostilamento?: string;
  created_at: string;
  updated_at: string;
}

export interface ComissaoParceiro {
  id: string;
  parceirnome: string;
  email: string;
  percentual: number;
  valorTotal: number;
  statusPagamento: 'pendente' | 'processando' | 'pago' | 'falhou';
}

export interface MetricaServico {
  servico: string;
  vendas: number;
  clientesNovos: number;
  receita: number;
  contasReceber: number;
  comissoes: number;
}
