import { apiClient, ApiResponse } from '@/modules/shared/services/api';

export const parceiroService = {
  async getMetrics(partnerId: string) {
    return apiClient.get<ApiResponse>(`/parceiro/metrics/${partnerId}`);
  },

  async getTermoStatus(clienteId: string) {
    const result = await apiClient.get<ApiResponse>(`/cliente/parceiro/termo-status/${clienteId}`);
    return result.data;
  },

  async aceitarTermo(clienteId: string) {
    const result = await apiClient.post<ApiResponse>(`/cliente/parceiro/termo-aceitar`, { clienteId });
    return result.data;
  }
};
