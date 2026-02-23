const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

class TraducoesService {
  async getOrcamentosPendentes() {
    try {
      console.log(`${API_URL}/traducoes/orcamentos/pendentes`)
      const response = await fetch(`${API_URL}/traducoes/orcamentos/pendentes`)
      if (!response.ok) {
        throw new Error('Erro ao buscar orçamentos pendentes')
      }
      return await response.json()
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
      const response = await fetch(`${API_URL}/traducoes/orcamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar resposta do orçamento')
      }

      return await response.json()
    } catch (error) {
      console.error('TraducoesService.responderOrcamento error:', error)
      throw error
    }
  }

  async getOrcamentoByDocumento(documentoId: string) {
    try {
      const response = await fetch(`${API_URL}/traducoes/orcamentos/documento/${documentoId}`)

      if (!response.ok) {
        if (response.status === 404) return null
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar orçamento')
      }

      return await response.json()
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
      const response = await fetch(`${API_URL}/traducoes/checkout/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar sessão de pagamento')
      }

      return await response.json()
    } catch (error) {
      console.error('TraducoesService.createCheckoutSession error:', error)
      throw error
    }
  }

  async aprovarOrcamento(orcamentoId: string, documentoId: string) {
    try {
      const response = await fetch(`${API_URL}/traducoes/orcamentos/${orcamentoId}/aprovar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentoId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao aprovar orçamento')
      }

      return await response.json()
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
      const response = await fetch(`${API_URL}/traducoes/orcamentos/${orcamentoId}/aprovar-adm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao aprovar orçamento (ADM)')
      }

      return await response.json()
    } catch (error) {
      console.error('TraducoesService.aprovarOrcamentoAdm error:', error)
      throw error
    }
  }

  async getFilaDeTrabalho() {
    try {
      const response = await fetch(`${API_URL}/traducoes/fila`)
      if (!response.ok) {
        throw new Error('Erro ao buscar fila de trabalho')
      }
      return await response.json()
    } catch (error) {
      console.error('TraducoesService.getFilaDeTrabalho error:', error)
      throw error
    }
  }

  async getEntregues() {
    try {
      const response = await fetch(`${API_URL}/traducoes/entregues`)
      if (!response.ok) {
        throw new Error('Erro ao buscar traduções entregues')
      }
      return await response.json()
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

      const response = await fetch(`${API_URL}/traducoes/submit`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar tradução')
      }

      return await response.json()
    } catch (error) {
      console.error('TraducoesService.submitTraducao error:', error)
      throw error
    }
  }
}

export const traducoesService = new TraducoesService()
