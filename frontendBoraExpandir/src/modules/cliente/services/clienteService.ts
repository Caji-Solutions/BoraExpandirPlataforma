const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const clienteService = {
  async getFormularioResponses(clienteId: string) {
    const response = await fetch(`${API_BASE_URL}/cliente/${clienteId}/formulario-responses`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar formulários enviados');
    }
    
    const result = await response.json();
    return result.data || [];
  },

  async updateDocumentoStatus(documentoId: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/cliente/documento/${documentoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Falha ao atualizar status do documento');
    }

    return response.json();
  },

  async getNotificacoes(clienteId: string) {
    const response = await fetch(`${API_BASE_URL}/cliente/${clienteId}/notificacoes`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar notificações');
    }
    
    const result = await response.json();
    return result.data || [];
  }
};
