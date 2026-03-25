import { useState } from 'react'
import { 
  Users, 
  Edit, 
  Save, 
  X, 
  Search, 
  Percent, 
  Mail, 
  Phone, 
  User,
  Bot,
  TrendingUp,
  DollarSign,
  Settings
} from 'lucide-react'
import { Badge } from '@/modules/shared/components/ui/badge'
import { configPlataforma } from '../../../../services/comissaoService'

// Tipos
interface Tradutor {
  id: string
  nome: string
  email: string
  telefone: string
  especialidades: string[]
  status: 'ativo' | 'inativo' | 'ferias'
  comissaoVendaPropria: number  // % para vendas próprias
  comissaoVendaBot: number      // % para vendas do bot
  totalVendasMes: number
  totalComissoesMes: number
  dataAdmissao: string
}

// Mock de tradutores
const mockTradutores: Tradutor[] = [
  {
    id: '1',
    nome: 'Ana Paula Silva',
    email: 'ana.silva@boraexpandir.com',
    telefone: '(11) 98765-4321',
    especialidades: ['Jurídico', 'Técnico', 'Comercial'],
    status: 'ativo',
    comissaoVendaPropria: 12,
    comissaoVendaBot: 8,
    totalVendasMes: 25000,
    totalComissoesMes: 2800,
    dataAdmissao: '2023-03-15',
  },
  {
    id: '2',
    nome: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@boraexpandir.com',
    telefone: '(21) 99876-5432',
    especialidades: ['Médico', 'Farmacêutico'],
    status: 'ativo',
    comissaoVendaPropria: 12,
    comissaoVendaBot: 8,
    totalVendasMes: 18500,
    totalComissoesMes: 2100,
    dataAdmissao: '2023-06-01',
  },
  {
    id: '3',
    nome: 'Fernanda Costa',
    email: 'fernanda.costa@boraexpandir.com',
    telefone: '(31) 97654-3210',
    especialidades: ['Acadêmico', 'Literário'],
    status: 'ferias',
    comissaoVendaPropria: 15,
    comissaoVendaBot: 10,
    totalVendasMes: 0,
    totalComissoesMes: 0,
    dataAdmissao: '2022-11-20',
  },
  {
    id: '4',
    nome: 'Roberto Almeida',
    email: 'roberto.almeida@boraexpandir.com',
    telefone: '(41) 96543-2109',
    especialidades: ['Jurídico', 'Financeiro', 'Contábil'],
    status: 'ativo',
    comissaoVendaPropria: 12,
    comissaoVendaBot: 8,
    totalVendasMes: 32000,
    totalComissoesMes: 3600,
    dataAdmissao: '2022-05-10',
  },
  {
    id: '5',
    nome: 'Julia Martins',
    email: 'julia.martins@boraexpandir.com',
    telefone: '(51) 95432-1098',
    especialidades: ['Técnico', 'Científico'],
    status: 'inativo',
    comissaoVendaPropria: 10,
    comissaoVendaBot: 6,
    totalVendasMes: 0,
    totalComissoesMes: 0,
    dataAdmissao: '2024-01-08',
  },
  {
    id: '6',
    nome: 'Pedro Henrique Santos',
    email: 'pedro.santos@boraexpandir.com',
    telefone: '(61) 94321-0987',
    especialidades: ['Comercial', 'Marketing'],
    status: 'ativo',
    comissaoVendaPropria: 12,
    comissaoVendaBot: 8,
    totalVendasMes: 15000,
    totalComissoesMes: 1650,
    dataAdmissao: '2023-09-01',
  },
]

const statusConfig = {
  ativo: { variant: 'success' as const, label: 'Ativo' },
  inativo: { variant: 'destructive' as const, label: 'Inativo' },
  ferias: { variant: 'warning' as const, label: 'Em Férias' },
}

export default function GestaoTradutores() {
  const [tradutores, setTradutores] = useState<Tradutor[]>(mockTradutores)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Tradutor>>({})
  
  // Estado para configuração do markup
  const [markupPercentual, setMarkupPercentual] = useState<number>(configPlataforma.markupPercentual)
  const [editingMarkup, setEditingMarkup] = useState(false)
  const [tempMarkup, setTempMarkup] = useState<number>(markupPercentual)

  // Filtrar tradutores
  const filteredTradutores = tradutores.filter(t => 
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.especialidades.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Métricas
  const totalAtivos = tradutores.filter(t => t.status === 'ativo').length
  const totalVendasMes = tradutores.reduce((sum, t) => sum + t.totalVendasMes, 0)
  const totalComissoesMes = tradutores.reduce((sum, t) => sum + t.totalComissoesMes, 0)

  // Iniciar edição
  const handleEdit = (tradutor: Tradutor) => {
    setEditingId(tradutor.id)
    setEditForm({
      nome: tradutor.nome,
      email: tradutor.email,
      telefone: tradutor.telefone,
      status: tradutor.status,
      comissaoVendaPropria: tradutor.comissaoVendaPropria,
      comissaoVendaBot: tradutor.comissaoVendaBot,
    })
  }

  // Salvar edição
  const handleSave = (id: string) => {
    setTradutores(prev => 
      prev.map(t => 
        t.id === id 
          ? { ...t, ...editForm }
          : t
      )
    )
    setEditingId(null)
    setEditForm({})
  }

  // Cancelar edição
  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  // Salvar markup
  const handleSaveMarkup = () => {
    setMarkupPercentual(tempMarkup)
    setEditingMarkup(false)
    // Em produção, aqui faria uma chamada à API para salvar no backend
    console.log('Markup atualizado para:', tempMarkup, '%')
  }

  // Cancelar edição de markup
  const handleCancelMarkup = () => {
    setTempMarkup(markupPercentual)
    setEditingMarkup(false)
  }

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestão de Tradutores
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie informações, comissões e markup da plataforma
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total de Tradutores */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tradutores</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{tradutores.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {totalAtivos} ativos
          </p>
        </div>

        {/* Vendas do Mês */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendas do Mês</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            R$ {totalVendasMes.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Total de todos os tradutores
          </p>
        </div>

        {/* Comissões do Mês */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Comissões do Mês</h3>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            R$ {totalComissoesMes.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Total a pagar
          </p>
        </div>

        {/* Regras de Comissão */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/80">Comissões</h3>
            <div className="p-2 bg-white/20 rounded-lg">
              <Percent className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-white/80" />
              <span className="text-xl font-bold text-white">12%</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-white/80" />
              <span className="text-xl font-bold text-white">8%</span>
            </div>
          </div>
          <p className="text-xs text-white/70 mt-2">
            Própria / Bot
          </p>
        </div>

        {/* Markup da Plataforma - Editável */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/80">Markup Plataforma</h3>
            <div className="flex items-center gap-2">
              {editingMarkup ? (
                <>
                  <button
                    onClick={handleSaveMarkup}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition"
                    title="Salvar"
                  >
                    <Save className="h-4 w-4 text-white" />
                  </button>
                  <button
                    onClick={handleCancelMarkup}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition"
                    title="Cancelar"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingMarkup(true)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition"
                  title="Editar markup"
                >
                  <Settings className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
          </div>
          {editingMarkup ? (
            <div className="flex items-center gap-2 mt-3">
              <input
                type="number"
                min="0"
                max="100"
                value={tempMarkup}
                onChange={(e) => setTempMarkup(Number(e.target.value))}
                className="w-20 px-3 py-2 rounded-lg bg-white/20 text-white text-xl font-bold text-center border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <span className="text-xl font-bold text-white">%</span>
            </div>
          ) : (
            <p className="text-3xl font-bold text-white mt-3">
              {markupPercentual}%
            </p>
          )}
          <p className="text-xs text-white/70 mt-2">
            Lucro sobre orçamentos
          </p>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
          />
        </div>
      </div>

      {/* Lista de Tradutores */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                  Tradutor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                  Contato
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                  Especialidades
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                  <div className="flex items-center justify-center gap-1">
                    <User className="h-3 w-3" />
                    Própria
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                  <div className="flex items-center justify-center gap-1">
                    <Bot className="h-3 w-3" />
                    Bot
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                  Vendas/Mês
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {filteredTradutores.map((tradutor) => (
                <tr key={tradutor.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                  {/* Nome */}
                  <td className="px-6 py-4">
                    {editingId === tradutor.id ? (
                      <input
                        type="text"
                        value={editForm.nome || ''}
                        onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{tradutor.nome}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Desde {new Date(tradutor.dataAdmissao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Contato */}
                  <td className="px-6 py-4">
                    {editingId === tradutor.id ? (
                      <div className="space-y-2">
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Email"
                        />
                        <input
                          type="tel"
                          value={editForm.telefone || ''}
                          onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Telefone"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {tradutor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {tradutor.telefone}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Especialidades */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {tradutor.especialidades.map((esp, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {esp}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {editingId === tradutor.id ? (
                      <select
                        value={editForm.status || tradutor.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Tradutor['status'] })}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="ferias">Em Férias</option>
                      </select>
                    ) : (
                      <Badge variant={statusConfig[tradutor.status].variant}>
                        {statusConfig[tradutor.status].label}
                      </Badge>
                    )}
                  </td>

                  {/* Comissão Venda Própria */}
                  <td className="px-6 py-4 text-center">
                    {editingId === tradutor.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.comissaoVendaPropria || 0}
                          onChange={(e) => setEditForm({ ...editForm, comissaoVendaPropria: Number(e.target.value) })}
                          className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                        {tradutor.comissaoVendaPropria}%
                      </span>
                    )}
                  </td>

                  {/* Comissão Venda Bot */}
                  <td className="px-6 py-4 text-center">
                    {editingId === tradutor.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.comissaoVendaBot || 0}
                          onChange={(e) => setEditForm({ ...editForm, comissaoVendaBot: Number(e.target.value) })}
                          className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                        {tradutor.comissaoVendaBot}%
                      </span>
                    )}
                  </td>

                  {/* Vendas do Mês */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      R$ {tradutor.totalVendasMes.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      +R$ {tradutor.totalComissoesMes.toLocaleString('pt-BR')} em comissões
                    </p>
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {editingId === tradutor.id ? (
                        <>
                          <button
                            onClick={() => handleSave(tradutor.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition"
                            title="Salvar"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(tradutor)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredTradutores.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700/30">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Exibindo {filteredTradutores.length} de {tradutores.length} tradutores
            </p>
          </div>
        )}

        {filteredTradutores.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum tradutor encontrado
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
