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
  ArrowRightLeft
} from 'lucide-react'
import { Sidebar } from '../../components/ui/Sidebar'
import type { SidebarGroup } from '../../components/ui/Sidebar'
import { Dashboard } from './components/Dashboard'
import { FinancialProcessList } from './pages/FinancialProcessList'
import Comissoes from './pages/Comissoes'
import { FinancialDashboard } from './pages/VisaoGeral'
import { Config } from '../../components/ui/Config'
import UserManagement from '../adm/pages/admin/UserManagement'
import AdminSettings from '../adm/pages/admin/Settings'
import { Clientes } from './pages/Clientes'
import { Relatorios } from './pages/Relatorios';
import { Titularidades } from './pages/Titularidades'
import { Processos } from './pages/Processos'
import { Tarefas } from './pages/Tarefas'
import { Movimentos } from './pages/Movimentos'


export function FinanceiroApp() {
  const sidebarGroups: SidebarGroup[] = [
    {
      label: 'Geral',
      items: [
        { label: 'Início', to: '/financeiro', icon: LayoutDashboard },
        { label: 'Clientes', to: '/financeiro/clientes', icon: Users },
        { label: 'Titularidades', to: '/financeiro/titularidades', icon: ShieldCheck },
        { label: 'Responsáveis', to: '/financeiro/responsaveis', icon: Users },
        { label: 'Processos', to: '/financeiro/processos', icon: ClipboardList },
        { label: 'Tarefas', to: '/financeiro/tarefas', icon: CheckSquare },
        { label: 'Movimentos', to: '/financeiro/movimentos', icon: ArrowRightLeft },
      ],
    },
    {
      label: 'Financeiro',
      items: [
        { label: 'Visão Geral', to: '/financeiro/visao-geral', icon: PieChart },
        { label: 'Contas a Receber', to: '/financeiro/contas-receber', icon: Wallet },
        { label: 'Comissões', to: '/financeiro/comissoes', icon: HandCoins },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { label: 'Relatórios', to: '/financeiro/relatorios', icon: BarChart },
        { label: 'Definições', to: '/financeiro/definicoes', icon: Settings },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar groups={sidebarGroups} />

      <main className="ml-64 p-6">
        <Routes>
          <Route index element={<Dashboard />} />

          {/* New Admin Modules */}
          <Route path="clientes" element={<Clientes />} />
          <Route path="titularidades" element={<Titularidades />} />
          <Route path="responsaveis" element={<UserManagement />} />
          <Route path="processos" element={<Processos />} />
          <Route path="tarefas" element={<Tarefas />} />
          <Route path="movimentos" element={<Movimentos />} />

          {/* Existing Financial Modules */}
          <Route path="visao-geral" element={<FinancialDashboard />} />
          <Route path="contas-receber" element={<FinancialProcessList />} />
          <Route path="comissoes" element={<Comissoes />} />

          {/* System */}
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="definicoes" element={<AdminSettings />} />
          <Route path="configuracoes" element={<Config />} /> {/* Keeping old route just in case */}

          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>
    </div>
  )
}
