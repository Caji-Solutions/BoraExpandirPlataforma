import { apiClient } from '@/modules/shared/services/api';

export const clienteService = {
  async getFormularioResponses(clienteId: string) {
    const result = await apiClient.get(`/cliente/${clienteId}/formulario-responses`);
    return result.data || [];
  },

  async updateDocumentoStatus(documentoId: string, status: string) {
    return apiClient.patch(`/cliente/documento/${documentoId}/status`, { status });
  },

  async getNotificacoes(clienteId: string) {
    const result = await apiClient.get(`/cliente/${clienteId}/notificacoes`);
    console.log('[clienteService] getNotificacoes result:', result);
    const notificacoes = result?.data || result || [];
    console.log('[clienteService] notificacoes extraídas:', notificacoes);
    return notificacoes;
  },

  async getRequerimentos(clienteId: string) {
    const result = await apiClient.get(`/cliente/${clienteId}/requerimentos`);
    return result.data || [];
  },

  async updateNotificacaoStatus(notificacaoId: string, lida: boolean) {
    return apiClient.patch(`/cliente/notificacoes/${notificacaoId}/status`, { lida });
  },

  async markAllNotificacoesAsRead(clienteId: string) {
    return apiClient.post(`/cliente/${clienteId}/notificacoes/read-all`);
  },

  async getDocumentosRequeridos(clienteId: string) {
    const result = await apiClient.get(`/cliente/${clienteId}/documentos-requeridos`);
    return result.data || [];
  },

  async getAgendamentos(clienteId: string) {
    return apiClient.get(`/comercial/agendamentos/cliente/${clienteId}`);
  },

  async recreateCheckout(agendamentoId: string) {
    const result = await apiClient.post(`/comercial/agendamento/${agendamentoId}/checkout`);
    return result.checkoutUrl;
  },

  async solicitarApostilamento(documentoId: string, documentoUrl: string, observacoes?: string) {
    return apiClient.post(`/apostilamentos/solicitar`, { documentoId, documentoUrl, observacoes });
  },

  async getContratos(clienteId: string) {
    const result = await apiClient.get(`/cliente/contratos?clienteId=${encodeURIComponent(clienteId)}`);
    return result.data || [];
  },

  async uploadContratoAssinado(contratoId: string, clienteId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cliente_id', clienteId);

    const result = await apiClient.post(`/cliente/contratos/${contratoId}/upload`, formData);
    return result.data;
  },

  async uploadComprovanteContrato(contratoId: string, clienteId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cliente_id', clienteId);

    const result = await apiClient.post(`/cliente/contratos/${contratoId}/comprovante`, formData);
    return result.data;
  },

  async submitApostilleComprovante(orcamentoIds: string | string[], file: File) {
    const formData = new FormData();
    formData.append('comprovante', file);

    // Se for array, enviamos no body também para o controller bulk
    if (Array.isArray(orcamentoIds)) {
        orcamentoIds.forEach(id => formData.append('orcamentoIds[]', id));
    }

    const primaryId = Array.isArray(orcamentoIds) ? orcamentoIds[0] : orcamentoIds;
    return apiClient.post(`/apostilamentos/${primaryId}/submit-comprovante`, formData);
  },

  async getOrcamentoByDocumento(documentoId: string) {
    try {
      const result = await apiClient.get(`/traducoes/orcamentos/documento/${documentoId}`);
      return result.data;
    } catch (error) {
      // Handle not found errors gracefully
      return null;
    }
  }
};
