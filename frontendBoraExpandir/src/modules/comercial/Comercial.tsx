import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '../../components/ui/Sidebar'
import type { SidebarGroup } from '../../components/ui/Sidebar'
import DashboardVendas from './DashboardVendas'
import CadastroCliente from './CadastroCliente'
import GeracaoContratoNovo from './GeracaoContratoNovo'
import GeracaoLinkPagamento from './GeracaoLinkPagamento'
import RequerimentoSuperadmin from './RequerimentoSuperadmin'
import AssinaturaDigital from './AssinaturaDigital'
import Comercial1 from './Comercial1'
import LeadsPage from './Leads'
import { Config } from '../../components/ui/Config'
import { Plus, Home, Users, FileText, CreditCard, AlertCircle, PenTool, CheckCircle, Calendar, Settings } from 'lucide-react'
import type { 
  Cliente, 
  ClienteFormData, 
  Contrato, 
  ContratoFormData,
  LinkPagamento,
  LinkPagamentoFormData,
  Requerimento,
  RequerimentoFormData,
  Lead,
  LeadFormData
} from '../../types/comercial'
import Toast, { useToast, ToastContainer } from '../../components/ui/Toast'

// Componentes de página
function DashboardPage({ 
  clientes, 
  contratos, 
  linksPagamento, 
  requerimentos,
  onShowCadastroCliente,
  onShowGeracaoContrato,
  onShowGeracaoLinkPagamento
}: {
  clientes: Cliente[]
  contratos: Contrato[]
  linksPagamento: LinkPagamento[]
  requerimentos: Requerimento[]
  onShowCadastroCliente: () => void
  onShowGeracaoContrato: () => void
  onShowGeracaoLinkPagamento: () => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-red-900 dark:text-white mb-2">Dashboard Comercial</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Visão geral das atividades comerciais</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Clientes</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{clientes.length}</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Contratos Ativos</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {contratos.filter(c => c.status === 'assinado').length}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Links de Pagamento</h3>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{linksPagamento.length}</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Requerimentos</h3>
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {requerimentos.filter(r => r.status === 'pendente').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={onShowCadastroCliente}
          className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-neutral-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all text-left"
        >
          <Plus className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Cadastrar Cliente</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Adicionar novo cliente ao sistema</p>
        </button>

        <button
          onClick={onShowGeracaoContrato}
          className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-neutral-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all text-left"
        >
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Gerar Contrato</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Criar novo contrato para cliente</p>
        </button>

        <button
          onClick={onShowGeracaoLinkPagamento}
          className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-neutral-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all text-left"
        >
          <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Gerar Link de Pagamento</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Criar link para recebimento</p>
        </button>
      </div>
    </div>
  )
}

function ClientesPage({ 
  clientes, 
  onShowCadastroCliente 
}: { 
  clientes: Cliente[]
  onShowCadastroCliente: () => void 
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie seus clientes cadastrados</p>
        </div>
        <button
          onClick={onShowCadastroCliente}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
        {clientes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum cliente cadastrado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-700 border-b border-gray-200 dark:border-neutral-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">E-mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {clientes.map(cliente => (
                  <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{cliente.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{cliente.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{cliente.telefone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{cliente.documento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function ContratosPage({ 
  contratos, 
  onShowGeracaoContrato,
  onSetContratoParaAssinar
}: { 
  contratos: Contrato[]
  onShowGeracaoContrato: () => void
  onSetContratoParaAssinar: (contrato: Contrato) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contratos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie contratos e assinaturas digitais</p>
        </div>
        <button
          onClick={onShowGeracaoContrato}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Contrato
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
        {contratos.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum contrato criado ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-neutral-700">
            {contratos.map(contrato => (
              <div key={contrato.id} className="p-6 hover:bg-gray-50 dark:hover:bg-neutral-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{contrato.titulo}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{contrato.cliente?.nome}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Valor: <strong className="text-gray-900 dark:text-white">R$ {contrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contrato.status === 'assinado' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                        contrato.status === 'aguardando_assinatura' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                        contrato.status === 'rascunho' ? 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300' :
                        'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                      }`}>
                        {contrato.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSetContratoParaAssinar(contrato)}
                    disabled={contrato.status === 'assinado' || contrato.status === 'cancelado'}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <PenTool className="h-4 w-4" />
                    Assinar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PagamentosPage({ 
  linksPagamento, 
  onShowGeracaoLinkPagamento 
}: { 
  linksPagamento: LinkPagamento[]
  onShowGeracaoLinkPagamento: () => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Links de Pagamento</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie links de pagamento gerados</p>
        </div>
        <button
          onClick={onShowGeracaoLinkPagamento}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Link
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
        {linksPagamento.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum link de pagamento criado ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-neutral-700">
            {linksPagamento.map(link => (
              <div key={link.id} className="p-6 hover:bg-gray-50 dark:hover:bg-neutral-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{link.descricao}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{link.contrato?.titulo}</p>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span className="text-gray-600 dark:text-gray-400">
                        Valor: <strong className="text-gray-900 dark:text-white">R$ {link.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        link.status === 'pago' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                        link.status === 'ativo' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                        link.status === 'expirado' ? 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300' :
                        'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                      }`}>
                        {link.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.link}
                        readOnly
                        className="flex-1 text-sm px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(link.link)}
                        className="px-3 py-2 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-lg text-sm font-medium transition-colors text-gray-900 dark:text-white"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RequerimentosPage({ 
  requerimentos, 
  onShowRequerimento 
}: { 
  requerimentos: Requerimento[]
  onShowRequerimento: () => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Requerimentos ao Superadmin</h1>
          <p className="text-gray-600 dark:text-gray-400">Envie solicitações e acompanhe status</p>
        </div>
        <button
          onClick={onShowRequerimento}
          className="px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Requerimento
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
        {requerimentos.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum requerimento enviado ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-neutral-700">
            {requerimentos.map(req => (
              <div key={req.id} className="p-6 hover:bg-gray-50 dark:hover:bg-neutral-700">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{req.titulo}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    req.status === 'aprovado' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                    req.status === 'pendente' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{req.descricao}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Tipo: {req.tipo}</p>
                {req.resposta_admin && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">Resposta do Admin:</p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{req.resposta_admin}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Comercial() {
  
  // Modals
  const [showCadastroCliente, setShowCadastroCliente] = useState(false)
  const [showGeracaoContrato, setShowGeracaoContrato] = useState(false)
  const [showGeracaoLinkPagamento, setShowGeracaoLinkPagamento] = useState(false)
  const [showRequerimento, setShowRequerimento] = useState(false)
  const [contratoParaAssinar, setContratoParaAssinar] = useState<Contrato | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Mock data (substituir por chamadas ao backend)
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao.silva@example.com',
      telefone: '(11) 98765-4321',
      whatsapp: '(11) 98765-4321',
      documento: '123.456.789-00',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria.santos@example.com',
      telefone: '(21) 99876-5432',
      whatsapp: '(21) 99876-5432',
      documento: '987.654.321-00',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Carlos Oliveira',
      email: 'carlos.oliveira@example.com',
      telefone: '(31) 97654-3210',
      whatsapp: '(31) 97654-3210',
      documento: '456.789.123-00',
      endereco: 'Rua do Comércio, 456 - Belo Horizonte/MG',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      nome: 'Ana Costa',
      email: 'ana.costa@example.com',
      telefone: '(41) 96543-2109',
      whatsapp: '(41) 96543-2109',
      documento: '789.123.456-00',
      endereco: 'Rua XV de Novembro, 789 - Curitiba/PR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      nome: 'Pedro Almeida',
      email: 'pedro.almeida@example.com',
      telefone: '(51) 95432-1098',
      whatsapp: '(51) 95432-1098',
      documento: '321.654.987-00',
      endereco: 'Av. Independência, 321 - Porto Alegre/RS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [linksPagamento, setLinksPagamento] = useState<LinkPagamento[]>([])
  const [requerimentos, setRequerimentos] = useState<Requerimento[]>([])
  const [leads, setLeads] = useState<Lead[]>([])

  // Handlers
  const handleSaveCliente = async (clienteData: ClienteFormData) => {
    // TODO: Integrar com backend
    const novoCliente: Cliente = {
      id: Math.random().toString(36).substring(7),
      ...clienteData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setClientes(prev => [...prev, novoCliente])
  }

  const handleSaveContrato = async (contratoData: ContratoFormData) => {
    // TODO: Integrar com backend
    const novoContrato: Contrato = {
      id: Math.random().toString(36).substring(7),
      ...contratoData,
      status: 'rascunho',
      cliente: clientes.find(c => c.id === contratoData.cliente_id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setContratos(prev => [...prev, novoContrato])
  }

  const handleSaveLinkPagamento = async (linkData: LinkPagamentoFormData) => {
    // TODO: Integrar com backend
    const novoLink: LinkPagamento = {
      id: Math.random().toString(36).substring(7),
      ...linkData,
      link: `https://pay.boraexpandir.com/${Math.random().toString(36).substring(7)}`,
      status: 'ativo',
      contrato: contratos.find(c => c.id === linkData.contrato_id),
      created_at: new Date().toISOString(),
    }
    setLinksPagamento(prev => [...prev, novoLink])
  }

  const handleSaveRequerimento = async (reqData: RequerimentoFormData) => {
    // TODO: Integrar com backend
    const novoRequerimento: Requerimento = {
      id: Math.random().toString(36).substring(7),
      ...reqData,
      comercial_usuario_id: 'usuario-atual-id',
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setRequerimentos(prev => [...prev, novoRequerimento])
  }

  const handleAssinarContrato = async (contratoId: string, assinadoPor: string, tipo: 'cliente' | 'empresa') => {
    // TODO: Integrar com backend para salvar assinatura digital
    console.log('Assinando contrato:', { contratoId, assinadoPor, tipo })
    
    setContratos(prev => prev.map(c => 
      c.id === contratoId 
        ? { ...c, status: 'assinado' as const }
        : c
    ))
  }

  // Configuração da sidebar
  const sidebarGroups: SidebarGroup[] = [
    {
      label: 'Menu Principal',
      items: [
        { label: 'Dashboard', to: '/comercial', icon: Home },
        { label: 'Agendamento', to: '/comercial/agendamento', icon: Calendar },
        { label: 'Meus Agendamentos', to: '/comercial/meus-agendamentos', icon: Calendar },
        { label: 'Clientes', to: '/comercial/clientes', icon: Users },
        { label: 'Leads', to: '/comercial/leads', icon: Users },
        { label: 'Contratos', to: '/comercial/contratos', icon: FileText },
        { label: 'Pagamentos', to: '/comercial/pagamentos', icon: CreditCard },
        { label: 'Requerimentos', to: '/comercial/requerimentos', icon: AlertCircle },
        { label: 'Configurações', to: '/comercial/configuracoes', icon: Settings },
      ],
    },
  ]

  const toast = useToast()

  const handleShowGeracaoContrato = () => {
    console.log('Iniciando criação de contrato...')
    console.log(toast.info('hahahah',10))
    toast.info('Iniciando criação de contrato...', 10)
    setShowGeracaoContrato(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar groups={sidebarGroups} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Hamburger toggle button - fixed in header for mobile */}
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
          <Route 
            path="/" 
            element={
              <DashboardVendas 
                contratos={contratos}
                clientes={clientes}
                onShowGeracaoContrato={handleShowGeracaoContrato}
                onSetContratoParaAssinar={setContratoParaAssinar}
              />
            } 
          />
          <Route 
            path="/agendamento" 
            element={<Comercial1 />}
          />
          
          <Route 
            path="/clientes" 
            element={
              <ClientesPage 
                clientes={clientes}
                onShowCadastroCliente={() => setShowCadastroCliente(true)}
              />
            } 
          />
          <Route 
            path="/leads" 
            element={<LeadsPage />}
          />
          <Route 
            path="/contratos" 
            element={
              <ContratosPage 
                contratos={contratos}
                onShowGeracaoContrato={() => setShowGeracaoContrato(true)}
                onSetContratoParaAssinar={setContratoParaAssinar}
              />
            } 
          />
          <Route 
            path="/pagamentos" 
            element={
              <PagamentosPage 
                linksPagamento={linksPagamento}
                onShowGeracaoLinkPagamento={() => setShowGeracaoLinkPagamento(true)}
              />
            } 
          />
          <Route 
            path="/requerimentos" 
            element={
              <RequerimentosPage 
                requerimentos={requerimentos}
                onShowRequerimento={() => setShowRequerimento(true)}
              />
            } 
          />
          <Route 
            path="/configuracoes" 
            element={<Config />}
          />
          <Route path="*" element={<Navigate to="/comercial" replace />} />
        </Routes>
      </main>

      {/* Modals */}
      {showCadastroCliente && (
        <CadastroCliente
          onClose={() => setShowCadastroCliente(false)}
          onSave={handleSaveCliente}
        />
      )}

      {showGeracaoContrato && (
        <GeracaoContratoNovo
          onClose={() => setShowGeracaoContrato(false)}
          onSave={handleSaveContrato}
          clientes={clientes}
        />
      )}

      {showGeracaoLinkPagamento && (
        <GeracaoLinkPagamento
          onClose={() => setShowGeracaoLinkPagamento(false)}
          onSave={handleSaveLinkPagamento}
          contratos={contratos}
        />
      )}

      {showRequerimento && (
        <RequerimentoSuperadmin
          onClose={() => setShowRequerimento(false)}
          onSave={handleSaveRequerimento}
        />
      )}

      {contratoParaAssinar && (
        <AssinaturaDigital
          contrato={contratoParaAssinar}
          onClose={() => setContratoParaAssinar(null)}
          onAssinar={handleAssinarContrato}
        />
      )}

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
