import { apiClient, ApiResponse } from '@/modules/shared/services/api';

export const clienteService = {
  async getFormularioResponses(clienteId: string) {
    const result = await apiClient.get<ApiResponse>(`/cliente/${clienteId}/formulario-responses`);
    return result.data || [];
  },

  async updateDocumentoStatus(documentoId: string, status: string) {
    return apiClient.patch<any>(`/cliente/documento/${documentoId}/status`, { status });
  },

  async getNotificacoes(clienteId: string) {
    const result = await apiClient.get<any>(`/cliente/${clienteId}/notificacoes`);
    const notificacoes = result?.data || result || [];
    return notificacoes;
  },

  async getRequerimentos(clienteId: string) {
    const result = await apiClient.get<ApiResponse>(`/cliente/${clienteId}/requerimentos`);
    return result.data || [];
  },

  async updateNotificacaoStatus(notificacaoId: string, lida: boolean) {
    return apiClient.patch<any>(`/cliente/notificacoes/${notificacaoId}/status`, { lida });
  },

  async markAllNotificacoesAsRead(clienteId: string) {
    return apiClient.post<any>(`/cliente/${clienteId}/notificacoes/read-all`);
  },

  async getDocumentosRequeridos(clienteId: string) {
    const result = await apiClient.get<ApiResponse>(`/cliente/${clienteId}/documentos-requeridos`);
    return result.data || [];
  },

  async getAgendamentos(clienteId: string) {
    return apiClient.get<any>(`/comercial/agendamentos/cliente/${clienteId}`);
  },

  async recreateCheckout(agendamentoId: string) {
    const result = await apiClient.post<any>(`/comercial/agendamento/${agendamentoId}/checkout`);
    return result.checkoutUrl;
  },

  async solicitarApostilamento(documentoId: string, documentoUrl: string, observacoes?: string) {
    return apiClient.post<any>(`/apostilamentos/solicitar`, { documentoId, documentoUrl, observacoes });
  },

  async getContratos(clienteId: string) {
    const result = await apiClient.get<ApiResponse>(`/cliente/contratos?clienteId=${encodeURIComponent(clienteId)}`);
    return result.data || [];
  },

  async getPagamentoLockStatus(clienteId: string) {
    return apiClient.get<any>(`/cliente/pagamentos-lock?clienteId=${encodeURIComponent(clienteId)}`);
  },

  async uploadContratoAssinado(contratoId: string, clienteId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cliente_id', clienteId);

    const result = await apiClient.post<ApiResponse>(`/cliente/contratos/${contratoId}/upload`, formData);
    return result.data;
  },

  async uploadComprovanteContrato(contratoId: string, clienteId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cliente_id', clienteId);

    const result = await apiClient.post<ApiResponse>(`/cliente/contratos/${contratoId}/comprovante`, formData);
    return result.data;
  },

  async uploadComprovanteParcela(parcelaId: string, clienteId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cliente_id', clienteId);

    const result = await apiClient.post<ApiResponse>(`/cliente/parcelas/${parcelaId}/comprovante`, formData);
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
    return apiClient.post<any>(`/apostilamentos/${primaryId}/submit-comprovante`, formData);
  },

  async getOrcamentoByDocumento(documentoId: string) {
    try {
      const result = await apiClient.get<ApiResponse>(`/traducoes/orcamentos/documento/${documentoId}`);
      return result.data;
    } catch (error) {
      // Handle not found errors gracefully
      return null;
    }
  },

  async getClienteByUserId(userId: string) {
    const result = await apiClient.get<ApiResponse>(`/cliente/by-user/${userId}`);
    return result.data;
  },

  // Notificações para usuários (funcionários/profiles)
  async getNotificacoesUsuario(usuarioId: string) {
    const result = await apiClient.get<any>(`/usuario/${usuarioId}/notificacoes`);
    const notificacoes = result?.data || result || [];
    return notificacoes;
  },

  async updateNotificacaoStatusUsuario(notificacaoId: string, lida: boolean) {
    return apiClient.patch<any>(`/usuario/notificacoes/${notificacaoId}/status`, { lida });
  },

  async markAllNotificacoesAsReadUsuario(usuarioId: string) {
    return apiClient.post<any>(`/usuario/${usuarioId}/notificacoes/read-all`);
  }
};
