import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  PieChart,
  Wallet,
  HandCoins,
  BarChart,
  Settings,
  Users,
  ShieldCheck,
  ClipboardList,
  CheckSquare,
  ArrowRightLeft,
  GitCompareArrows,
  Stamp,
  Dna,
  FileCheck,
} from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import type { SidebarGroup } from '@/components/ui/Sidebar'

import { FinancialProcessList } from './pages/FinancialProcessList'
import Comissoes from './pages/Comissoes'
import { FinancialDashboard } from './pages/VisaoGeral'
import { Config } from '@/components/ui/Config'
import UserManagement from '../adm/pages/admin/UserManagement'
import AdminSettings from '../adm/pages/admin/Settings'
import { Clientes } from './pages/Clientes'
import { Relatorios } from './pages/Relatorios';
import { Titularidades } from './pages/Titularidades'
import { Processos } from './pages/Processos'
import { Tarefas } from './pages/Tarefas'
import { Movimentos } from './pages/Movimentos'
import { RelatoriosComparativos } from './pages/RelatoriosComparativos'
import { AdminApostilamento } from './pages/AdminApostilamento'
import { ClientDNAPage } from '@/components/ui/ClientDNA'
import { ComprovantesPage } from './pages/ComprovantesPage'
import RelatorioFechamento from './pages/RelatorioFechamento'
import { CurrencyWidget } from '@/modules/shared/components/CurrencyWidget'


export function FinanceiroApp() {
  const [pendentesCount, setPendentesCount] = React.useState(0)

  React.useEffect(() => {
    async function fetchPendentes() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/financeiro/comprovantes/pendentes`)
        if (response.ok) {
          const json = await response.json()
          setPendentesCount(json.data?.length || 0)
        }
      } catch (err) {
        console.error('Erro ao buscar comprovantes pendentes list', err)
      }
    }
    fetchPendentes()
    
    // Polling opcional para a cada X tempo:
    // const interval = setInterval(fetchPendentes, 1000 * 60) // 1 min
    // return () => clearInterval(interval)
  }, [])

  const sidebarGroups: SidebarGroup[] = [
    {
      label: 'Geral',
      items: [
        { label: 'Início', to: '/financeiro', icon: LayoutDashboard },
        { label: 'DNA do Cliente', to: '/financeiro/dna', icon: Dna },
        { label: 'Clientes', to: '/financeiro/clientes', icon: Users },
        { label: 'Titularidades', to: '/financeiro/titularidades', icon: ShieldCheck },
        { label: 'Responsáveis', to: '/financeiro/responsaveis', icon: Users },
        { label: 'Processos', to: '/financeiro/processos', icon: ClipboardList },
        { label: 'Tarefas', to: '/financeiro/tarefas', icon: CheckSquare },
        { label: 'Movimentos', to: '/financeiro/movimentos', icon: ArrowRightLeft },
        { label: 'Apostilagem', to: '/financeiro/apostilagem', icon: Stamp },
      ],
    },
    {
      label: 'Financeiro',
      items: [
        { label: 'Visão Geral', to: '/financeiro/visao-geral', icon: PieChart },
        { label: 'Contas a Receber', to: '/financeiro/contas-receber', icon: Wallet },
        { label: 'Comissões', to: '/financeiro/comissoes', icon: HandCoins },
        { label: 'Fechamento', to: '/financeiro/fechamento', icon: HandCoins },
        { 
          label: 'Comprovantes', 
          to: '/financeiro/comprovantes', 
          icon: FileCheck,
          badge: pendentesCount > 0 ? (
            <span className="ml-auto inline-flex items-center justify-center bg-red-500 text-white rounded-full h-5 px-1.5 text-[10px] font-bold">
              {pendentesCount}
            </span>
          ) : undefined
        },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { label: 'Relatórios', to: '/financeiro/relatorios', icon: BarChart },
        { label: 'Comparativos', to: '/financeiro/comparativos', icon: GitCompareArrows },
        { label: 'Configurações', to: '/financeiro/configuracoes', icon: Settings },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar groups={sidebarGroups} />

      <main className="ml-64 p-6">
        <div className="flex justify-end mb-4">
          <CurrencyWidget />
        </div>
        <Routes>
          <Route index element={<FinancialDashboard />} />

          {/* New Admin Modules */}
          <Route path="clientes" element={<Clientes />} />
          <Route path="titularidades" element={<Titularidades />} />
          <Route path="responsaveis" element={<UserManagement />} />
          <Route path="processos" element={<Processos />} />
          <Route path="tarefas" element={<Tarefas />} />
          <Route path="movimentos" element={<Movimentos />} />
          <Route path="apostilagem" element={<AdminApostilamento />} />
          <Route path="dna" element={<ClientDNAPage />} />

          {/* Existing Financial Modules */}
          <Route path="visao-geral" element={<FinancialDashboard />} />
          <Route path="contas-receber" element={<FinancialProcessList />} />
          <Route path="comissoes" element={<Comissoes />} />
          <Route path="fechamento" element={<RelatorioFechamento />} />
          <Route path="comprovantes" element={<ComprovantesPage />} />

          {/* System */}
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="comparativos" element={<RelatoriosComparativos />} />
          <Route path="configuracoes" element={<Config />} />

          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>
    </div>
  )
}
