import { apiClient } from '@/modules/shared/services/api';

export const parceiroService = {
  async getMetrics(partnerId: string) {
    return apiClient.get(`/parceiro/metrics/${partnerId}`);
  }
};
