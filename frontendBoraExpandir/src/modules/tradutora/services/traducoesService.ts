import { apiClient } from '@/modules/shared/services/api';

class TraducoesService {
  async getOrcamentosPendentes() {
    try {
      return await apiClient.get(`/traducoes/orcamentos/pendentes`)
    } catch (error) {
      console.error('TraducoesService.getOrcamentosPendentes error:', error)
      throw error
    }
  }

  async responderOrcamento(dados: {
    documentoId: string
    valorOrcamento: number
    prazoEntrega: string
    observacoes?: string
  }) {
    try {
      return await apiClient.post(`/traducoes/orcamentos`, dados)
    } catch (error) {
      console.error('TraducoesService.responderOrcamento error:', error)
      throw error
    }
  }

  async getOrcamentoByDocumento(documentoId: string) {
    try {
      return await apiClient.get(`/traducoes/orcamentos/documento/${documentoId}`)
    } catch (error) {
      console.error('TraducoesService.getOrcamentoByDocumento error:', error)
      throw error
    }
  }

  async createCheckoutSession(dados: {
    documentoIds: string[]
    email: string
    successUrl?: string
    cancelUrl?: string
    manualPrice?: number
  }) {
    try {
      return await apiClient.post(`/traducoes/checkout/stripe`, dados)
    } catch (error) {
      console.error('TraducoesService.createCheckoutSession error:', error)
      throw error
    }
  }

  async aprovarOrcamento(orcamentoId: string, documentoId: string) {
    try {
      return await apiClient.post(`/traducoes/orcamentos/${orcamentoId}/aprovar`, { documentoId })
    } catch (error) {
      console.error('TraducoesService.aprovarOrcamento error:', error)
      throw error
    }
  }

  async aprovarOrcamentoAdm(orcamentoId: string, dados: {
    documentoId: string,
    porcentagemMarkup: number,
    valorFinal: number
  }) {
    try {
      return await apiClient.post(`/traducoes/orcamentos/${orcamentoId}/aprovar-adm`, dados)
    } catch (error) {
      console.error('TraducoesService.aprovarOrcamentoAdm error:', error)
      throw error
    }
  }

  async getFilaDeTrabalho() {
    try {
      return await apiClient.get(`/traducoes/fila`)
    } catch (error) {
      console.error('TraducoesService.getFilaDeTrabalho error:', error)
      throw error
    }
  }

  async getEntregues() {
    try {
      return await apiClient.get(`/traducoes/entregues`)
    } catch (error) {
      console.error('TraducoesService.getEntregues error:', error)
      throw error
    }
  }

  async submitTraducao(documentoId: string, file: File) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentoId', documentoId)

      return await apiClient.post(`/traducoes/submit`, formData)
    } catch (error) {
      console.error('TraducoesService.submitTraducao error:', error)
      throw error
    }
  }

  async submitComprovante(orcamentoId: string, file: File) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      return await apiClient.post(`/traducoes/orcamento/${orcamentoId}/comprovante`, formData)
    } catch (error) {
      console.error('TraducoesService.submitComprovante error:', error)
      throw error
    }
  }
}

export const traducoesService = new TraducoesService()
