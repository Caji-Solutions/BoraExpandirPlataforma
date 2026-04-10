import { apiClient } from '@/modules/shared/services/api';

export interface Commission {
  id: string;
  mes: number;
  ano: number;
  valor_comissao_brl: number;
  status: 'estimado' | 'pago';
  usuario_id: string;
  usuario: {
    id: string;
    full_name: string;
    email: string;
  };
  created_at: string;
}

export const financeiroService = {
  async getCommissions(mes?: number, ano?: number): Promise<Commission[]> {
    let url = '/financeiro/comissoes';
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes.toString());
    if (ano) params.append('ano', ano.toString());
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await apiClient.get<{ data: Commission[] }>(url);
    return response.data;
  },

  async confirmCommissionPayment(id: string, receiptUrl?: string): Promise<void> {
    // This assumes an endpoint exists or we should create it.
    // In this module, the user audit mentioned mocked arrays.
    // We will use a PATCH to update status.
    await apiClient.patch(`/financeiro/comissoes/${id}`, {
      status: 'pago',
      receiptUrl
    });
  }
};
