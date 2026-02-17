import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '../../components/ui/Sidebar'
import type { SidebarGroup } from '../../components/ui/Sidebar'
import OrcamentosPage from './components/OrcamentosPage'
import FilaDeTrabalho from './components/FilaDeTrabalho'
import EntreguesPage from './components/EntreguesPage'
import PagamentosPage from './components/PagamentosPage'
import { FileText, Clock, CheckCircle2, DollarSign, Settings, Loader2 } from 'lucide-react'
import type { TraducaoItem } from './types'
import type { OrcamentoItem, OrcamentoFormData } from './types/orcamento'
import { Config } from '../../components/ui/Config'
import { traducoesService } from './services/traducoesService'
import { useEffect } from 'react'


const mockTraducoes: TraducaoItem[] = [
  {
    id: '1',
    documentoNome: 'Certidão de Nascimento',
    clienteNome: 'Cliente A',
    parIdiomas: { origem: 'PT', destino: 'EN' },
    prazoSLA: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
    status: 'pendente',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    documentoNome: 'Contrato Comercial',
    clienteNome: 'Cliente B',
    parIdiomas: { origem: 'PT', destino: 'IT' },
    prazoSLA: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 horas
    status: 'pendente',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    documentoNome: 'Manual Técnico (Volume 1)',
    clienteNome: 'Cliente C',
    parIdiomas: { origem: 'PT', destino: 'ES' },
    prazoSLA: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(), // 32 horas
    status: 'pendente',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    documentoNome: 'Parecer Jurídico',
    clienteNome: 'Cliente D',
    parIdiomas: { origem: 'PT', destino: 'EN' },
    prazoSLA: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 horas
    status: 'pendente',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    documentoNome: 'Relatório Anual',
    clienteNome: 'Cliente E',
    parIdiomas: { origem: 'PT', destino: 'FR' },
    prazoSLA: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 horas
    status: 'entregue',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]


export default function Tradutora() {
  const [traducoes, setTraducoes] = useState<TraducaoItem[]>(mockTraducoes)
  const [orcamentos, setOrcamentos] = useState<OrcamentoItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchOrcamentos()
  }, [])

  const fetchOrcamentos = async () => {
    try {
      setIsLoading(true)
      const data = await traducoesService.getOrcamentosPendentes()
      
      const mappedOrcamentos: OrcamentoItem[] = data.map((item: any) => ({
        id: item.id,
        documentoNome: item.nome_original,
        clienteNome: item.clientes?.nome || 'N/A',
        parIdiomas: { origem: 'PT', destino: 'IT' }, // Default for now
        status: 
          item.status === 'disponivel' ? ('aprovado' as const) :
          item.status === 'WAITING_QUOTE_APPROVAL' || item.status === 'em_analise' ? ('respondido' as const) : 
          ('pendente' as const),
        storagePath: item.storage_path,
        publicUrl: item.public_url,
        documentoId: item.id,
        created_at: item.criado_em,
        updated_at: item.atualizado_em,
        prazoDesejado: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days from now
        valorOrcamento: item.orcamento?.valor_orcamento,
        prazoEntrega: item.orcamento?.prazo_entrega,
        observacoes: item.orcamento?.observacoes,
      }))

      setOrcamentos([...mappedOrcamentos])

    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitTraducao = (traducaoId: string, arquivo: File) => {
    setTraducoes(prev =>
      prev.map(t =>
        t.id === traducaoId
          ? { ...t, status: 'entregue' as const, updated_at: new Date().toISOString() }
          : t
      )
    )
    console.log(`Tradução ${traducaoId} enviada:`, arquivo.name)
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
      console.log(`Orçamento ${orcamentoId} respondido com sucesso no banco:`, dados)
    } catch (error) {
      console.error(`Erro ao responder orçamento ${orcamentoId}:`, error)
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
    {
      label: 'Sistema',
      items: [
        { label: 'Configurações', to: '/tradutor/configuracoes', icon: Settings },
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
          <Route path="/fila" element={<FilaDeTrabalho traducoes={traducoes} onSubmitTraducao={handleSubmitTraducao} />} />
          <Route path="/entregues" element={<EntreguesPage traducoes={traducoes} />} />
          <Route path="/pagamentos" element={<PagamentosPage traducoes={traducoes} />} />
          <Route path="/configuracoes" element={<Config />} />
          <Route path="*" element={<Navigate to="/tradutor/orcamentos" replace />} />
        </Routes>
      </main>
    </div>
  )
}
