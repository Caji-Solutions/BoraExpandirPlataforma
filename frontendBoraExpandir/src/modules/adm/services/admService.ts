import { apiClient } from '@/modules/shared/services/api';

export interface DashboardStats {
  faturamento: {
    atual: number;
    anterior: number;
  };
  novos_clientes: {
    atual: number;
    anterior: number;
  };
  contas_receber: number;
  comissoes: {
    paga: number;
    aRealizar: number;
  };
  processos_ativos: number;
  recent_activity: Array<{
    user: string;
    action: string;
    time: string;
  }>;
}

export interface FluxoCaixaItem {
  month: string;
  receita: number;
  despesas: number;
}

export interface Translator {
  id: string;
  full_name: string;
  email: string;
  status?: string;
  cargo?: string;
  telefone?: string;
}

export const admService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/financeiro/dashboard/metricas');
    return response;
  },

  async getFluxoCaixa(meses = 6): Promise<FluxoCaixaItem[]> {
    const response = await apiClient.get<{ data: FluxoCaixaItem[] }>(`/financeiro/dashboard/fluxo-caixa?meses=${meses}`);
    return response.data;
  },

  async getTranslators(): Promise<Translator[]> {
    const response = await apiClient.get<{ data: Translator[] }>('/adm/tradutores');
    return response.data;
  },

  async getVendedoresRanking(): Promise<any[]> {
    const response = await apiClient.get<{ data: any[] }>('/financeiro/dashboard/vendedores');
    return response.data;
  },
  
  async getServicePerformance(): Promise<any[]> {
    const response = await apiClient.get<{ data: any[] }>('/financeiro/dashboard/servicos');
    return response.data;
  }
};
