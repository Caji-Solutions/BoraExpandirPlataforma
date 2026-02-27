const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const parceiroService = {
  async getMetrics(partnerId: string) {
    const response = await fetch(`${API_BASE_URL}/parceiro/metrics/${partnerId}`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar métricas do parceiro');
    }
    
    return await response.json();
  }
};
