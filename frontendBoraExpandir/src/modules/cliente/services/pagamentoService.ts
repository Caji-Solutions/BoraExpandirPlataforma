import { apiClient } from '@/modules/shared/services/api';
import { Payment } from '../types';

export const pagamentoService = {
  async getPagamentos(clienteId: string): Promise<Payment[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Payment[] }>(`/cliente/${clienteId}/pagamentos`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  },

  async uploadComprovante(paymentId: string, clienteId: string, tipo: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clienteId', clienteId);
    formData.append('tipo', tipo);

    const { data } = await apiClient.post<{ success: boolean; data: any }>(`/cliente/pagamentos/${paymentId}/comprovante`, formData);

    return data;
  },

  // Mantendo por compatibilidade se necessário, mas redirecionando para o novo
  async uploadComprovanteParcela(parcelaId: string, clienteId: string, file: File): Promise<any> {
    return this.uploadComprovante(parcelaId, clienteId, 'parcela', file);
  }
};
