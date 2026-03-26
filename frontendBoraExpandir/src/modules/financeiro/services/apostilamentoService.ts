import { apiClient } from '@/modules/shared/services/api';

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
    const result = await apiClient.get(`/apostilamentos`);
    return result.data || [];
  },

  async updateStatus(id: string, params: {
    status: string;
    documentoApostiladoUrl?: string;
    observacoes?: string;
  }) {
    return apiClient.patch(`/apostilamentos/${id}/status`, params);
  }
};
