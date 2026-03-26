import { apiClient } from '@/modules/shared/services/api'

export interface DashboardMetricas {
  metaVendas: { atual: number; total: number | null; percentual: number | null }
  novosClientes: { mes: number; mesAnterior: number; crescimento: number }
  faturamentoMensal: { valor: number; mesAnterior: number; crescimento: number }
  contasReceber: { total: number; vencidas: number; proximasVencer: number }
  comissoes: { aRealizar: number; paga: number; total: number }
}

export interface VendedorInfo {
  nome: string
  vendas: number
  meta: number | null
  comissao: number
  status: 'acima' | 'abaixo' | 'dentro'
  servico: string | null
}

export const dashboardService = {
  async getMetricas(periodo?: string): Promise<DashboardMetricas> {
    const params = new URLSearchParams()
    if (periodo) {
      params.append('periodo', periodo)
    }

    const response = await apiClient.get<{ data: DashboardMetricas }>(
      `/financeiro/dashboard/metricas${params.toString() ? '?' + params.toString() : ''}`
    )
    return response.data
  },

  async getVendedores(periodo?: string): Promise<VendedorInfo[]> {
    const params = new URLSearchParams()
    if (periodo) {
      params.append('periodo', periodo)
    }

    const response = await apiClient.get<{ data: VendedorInfo[] }>(
      `/financeiro/dashboard/vendedores${params.toString() ? '?' + params.toString() : ''}`
    )
    return response.data
  }
}
