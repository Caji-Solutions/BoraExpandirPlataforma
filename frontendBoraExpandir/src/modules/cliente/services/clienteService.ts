const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const clienteService = {
  async getFormularioResponses(clienteId: string) {
    const response = await fetch(`${API_BASE_URL}/cliente/${clienteId}/formulario-responses`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar formulários enviados');
    }
    
    const result = await response.json();
    return result.data || [];
  }
};
