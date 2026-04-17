import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '@/components/ui/Sidebar'
import type { SidebarGroup } from '@/components/ui/Sidebar'
import OrcamentosPage from './pages/OrcamentosPage'
import FilaDeTrabalho from './pages/FilaDeTrabalho'
import EntreguesPage from './pages/EntreguesPage'
import PagamentosPage from './pages/PagamentosPage'
import { FileText, Clock, CheckCircle2, DollarSign, Loader2 } from 'lucide-react'
import type { OrcamentoItem, OrcamentoFormData } from './types'
import { traducoesService } from './services/traducoesService'
import { useEffect } from 'react'

export default function Tradutora() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoItem[]>([])
  const [filaItems, setFilaItems] = useState<OrcamentoItem[]>([])
  const [entregueItems, setEntregueItems] = useState<OrcamentoItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchOrcamentos(), fetchFila(), fetchEntregues()])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const mapDocToOrcamentoItem = (item: any): OrcamentoItem => ({
    id: item.id,
    documentoNome: item.nome_original || item.tipo,
    clienteNome: item.clientes?.nome || 'N/A',
    clienteEmail: item.clientes?.email || '',
    clienteTelefone: item.clientes?.whatsapp || '',
    parIdiomas: { origem: 'PT', destino: 'IT' },
    status:
      item.status === 'disponivel' ? ('aprovado' as const) :
        item.status === 'ANALYZING_TRANSLATION' ? ('aprovado' as const) :
          item.status === 'TRANSLATION_DONE' || item.status === 'APPROVED_TRANSLATION' ? ('aprovado' as const) :
            item.orcamento ? ('respondido' as const) :
              ('pendente' as const),
    storagePath: item.storage_path,
    publicUrl: item.public_url,
    documentoId: item.id,
    processoId: item.processo_id,
    dependenteId: item.dependente_id,
    dependente: item.dependente,
    created_at: item.criado_em,
    updated_at: item.atualizado_em,
    prazoDesejado: item.orcamento?.prazo_entrega || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    valorOrcamento: item.orcamento?.valor_orcamento,
    prazoEntrega: item.orcamento?.prazo_entrega,
    observacoes: item.orcamento?.observacoes,
    traducaoUrl: item.traducao_url,
    traducaoStoragePath: item.traducao_storage_path,
    traducaoNomeOriginal: item.traducao_nome_original,
    rawStatus: item.status,
    tipo: item.orcamento?.tipo,
    motivoRejeicao: item.motivo_rejeicao || undefined,
  })

  const fetchOrcamentos = async () => {
    try {
      const data = await traducoesService.getOrcamentosPendentes()
      setOrcamentos(data.map(mapDocToOrcamentoItem))
    } catch (error) {
      console.error('Erro ao buscar orcamentos:', error)
    }
  }

  const fetchFila = async () => {
    try {
      const data = await traducoesService.getFilaDeTrabalho()
      setFilaItems(data.map(mapDocToOrcamentoItem))
    } catch (error) {
      console.error('Erro ao buscar fila:', error)
    }
  }

  const fetchEntregues = async () => {
    try {
      const data = await traducoesService.getEntregues()
      setEntregueItems(data.map(mapDocToOrcamentoItem))
    } catch (error) {
      console.error('Erro ao buscar entregues:', error)
    }
  }

  const handleSubmitTraducao = async (documentoId: string, arquivo: File) => {
    try {
      await traducoesService.submitTraducao(documentoId, arquivo)
      await Promise.all([fetchFila(), fetchEntregues()])
    } catch (error) {
      console.error('Erro ao enviar traducao:', error)
      throw error
    }
  }

  const handleResponderOrcamento = async (orcamentoId: string, dados: OrcamentoFormData) => {
    try {
      await traducoesService.responderOrcamento(dados)

      setOrcamentos(prev =>
        prev.map(o =>
          o.id === orcamentoId
            ? {
              ...o,
              status: 'respondido' as const,
              valorOrcamento: dados.valorOrcamento,
              prazoEntrega: dados.prazoEntrega,
              ...(dados.observacoes && { observacoes: dados.observacoes }),
              updated_at: new Date().toISOString(),
            }
            : o
        )
      )
    } catch (error) {
      console.error(`Erro ao responder orcamento ${orcamentoId}:`, error)
      alert('Erro ao enviar orçamento. Verifique o console para mais detalhes.')
    }
  }

  const sidebarGroups: SidebarGroup[] = [
    {
      label: 'Portal Tradutor',
      items: [
        { label: 'Orçamentos', to: '/tradutor/orcamentos', icon: FileText },
        { label: 'Fila de Trabalho', to: '/tradutor/fila', icon: Clock },
        { label: 'Entregues', to: '/tradutor/entregues', icon: CheckCircle2 },
        { label: 'Pagamentos', to: '/tradutor/pagamentos', icon: DollarSign },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar groups={sidebarGroups} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        {isLoading && (
          <div className="fixed top-4 right-4 z-50 bg-white dark:bg-neutral-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-neutral-700">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/tradutor/orcamentos" replace />} />
          <Route path="/orcamentos" element={<OrcamentosPage orcamentos={orcamentos} onResponderOrcamento={handleResponderOrcamento} />} />
          <Route path="/fila" element={<FilaDeTrabalho items={filaItems} onSubmitTraducao={handleSubmitTraducao} />} />
          <Route path="/entregues" element={<EntreguesPage items={entregueItems} onSubmitTraducao={handleSubmitTraducao} />} />
          <Route path="/pagamentos" element={<PagamentosPage items={[...entregueItems, ...filaItems]} />} />

          <Route path="*" element={<Navigate to="/tradutor/orcamentos" replace />} />
        </Routes>
      </main>
    </div>
  )
}
