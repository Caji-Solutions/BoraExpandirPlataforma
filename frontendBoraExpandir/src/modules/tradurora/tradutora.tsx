import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '../../components/ui/Sidebar'
import type { SidebarGroup } from '../../components/ui/Sidebar'
import OrcamentosPage from './components/OrcamentosPage'
import FilaDeTrabalho from './components/FilaDeTrabalho'
import EntreguesPage from './components/EntreguesPage'
import PagamentosPage from './components/PagamentosPage'
import { FileText, Clock, CheckCircle2, DollarSign } from 'lucide-react'
import type { TraducaoItem } from './types'
import type { OrcamentoItem, OrcamentoFormData } from './types/orcamento'


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

const mockOrcamentos: OrcamentoItem[] = [
  {
    id: '1',
    documentoNome: 'Certidão de Casamento',
    clienteNome: 'João Silva',
    clienteEmail: 'joao.silva@email.com',
    clienteTelefone: '(11) 98765-4321',
    parIdiomas: { origem: 'PT', destino: 'EN' },
    numeroPaginas: 2,
    prazoDesejado: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    observacoes: 'Preciso da tradução juramentada com urgência',
    status: 'pendente',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    documentoNome: 'Diploma Universitário',
    clienteNome: 'Maria Santos',
    clienteEmail: 'maria.santos@email.com',
    clienteTelefone: '(21) 99876-5432',
    parIdiomas: { origem: 'PT', destino: 'IT' },
    numeroPaginas: 1,
    numeroPalavras: 300,
    prazoDesejado: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pendente',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    documentoNome: 'Contrato de Trabalho',
    clienteNome: 'Carlos Oliveira',
    clienteEmail: 'carlos@email.com',
    clienteTelefone: '(31) 97654-3210',
    parIdiomas: { origem: 'PT', destino: 'ES' },
    numeroPaginas: 5,
    numeroPalavras: 1200,
    prazoDesejado: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    observacoes: 'Tradução simples, não precisa ser juramentada',
    status: 'respondido',
    valorOrcamento: 250.00,
    prazoEntrega: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    documentoNome: 'Histórico Escolar',
    clienteNome: 'Ana Costa',
    clienteEmail: 'ana.costa@email.com',
    clienteTelefone: '(41) 96543-2109',
    parIdiomas: { origem: 'PT', destino: 'EN' },
    numeroPaginas: 3,
    prazoDesejado: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'aceito',
    valorOrcamento: 180.00,
    prazoEntrega: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function Tradutora() {
  const [traducoes, setTraducoes] = useState<TraducaoItem[]>(mockTraducoes)
  const [orcamentos, setOrcamentos] = useState<OrcamentoItem[]>(mockOrcamentos)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const handleResponderOrcamento = (orcamentoId: string, dados: OrcamentoFormData) => {
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
    console.log(`Orçamento ${orcamentoId} respondido:`, dados)
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
        <Routes>
          <Route path="/" element={<Navigate to="/tradutor/orcamentos" replace />} />
          <Route path="/orcamentos" element={<OrcamentosPage orcamentos={orcamentos} onResponderOrcamento={handleResponderOrcamento} />} />
          <Route path="/fila" element={<FilaDeTrabalho traducoes={traducoes} onSubmitTraducao={handleSubmitTraducao} />} />
          <Route path="/entregues" element={<EntreguesPage traducoes={traducoes} />} />
          <Route path="/pagamentos" element={<PagamentosPage traducoes={traducoes} />} />
          <Route path="*" element={<Navigate to="/tradutor/orcamentos" replace />} />
        </Routes>
      </main>
    </div>
  )
}
