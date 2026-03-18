const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export interface Apostilamento {
  id: string;
  documento_id: string;
  documento_url: string;
  documento_apostilado_url?: string;
  status: 'pendente' | 'em_processamento' | 'concluido' | 'cancelado' | 'pronto_para_apostilagem';
  observacoes?: string;
  solicitado_em: string;
  atualizado_em: string;
  concluido_em?: string;
  documentos?: {
    id: string;
    nome_original: string;
    tipo: string;
    cliente_id: string;
    dependente_id?: string;
    clientes?: {
        id: string;
        nome: string;
    }
  };
}

export const apostilamentoService = {
  async getAllApostilamentos(): Promise<Apostilamento[]> {
    const response = await fetch(`${API_BASE_URL}/apostilamentos`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar apostilamentos');
    }
    
    const result = await response.json();
    return result.data || [];
  },

  async updateStatus(id: string, params: {
    status: string;
    documentoApostiladoUrl?: string;
    observacoes?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/apostilamentos/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Falha ao atualizar status do apostilamento');
    }

    return response.json();
  }
};
