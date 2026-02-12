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
}

export const traducoesService = new TraducoesService()
