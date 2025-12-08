import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '../../components/ui/Sidebar'
import type { SidebarGroup } from '../../components/ui/Sidebar'
import DashboardVendas from './DashboardVendas'
import CadastroCliente from './CadastroCliente'
import GeracaoContrato from './GeracaoContrato'
import GeracaoLinkPagamento from './GeracaoLinkPagamento'
import RequerimentoSuperadmin from './RequerimentoSuperadmin'
import AssinaturaDigital from './AssinaturaDigital'
import Comercial1 from './Comercial1'
import { Plus, Home, Users, FileText, CreditCard, AlertCircle, PenTool, CheckCircle, Calendar } from 'lucide-react'
import type { 
  Cliente, 
  ClienteFormData, 
  Contrato, 
  ContratoFormData,
  LinkPagamento,
  LinkPagamentoFormData,
  Requerimento,
  RequerimentoFormData
} from '../../types/comercial'

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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Comercial</h1>
      <p className="text-gray-600 mb-8">Visão geral das atividades comerciais</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total de Clientes</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{clientes.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Contratos Ativos</h3>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {contratos.filter(c => c.status === 'assinado').length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Links de Pagamento</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{linksPagamento.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Requerimentos</h3>
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {requerimentos.filter(r => r.status === 'pendente').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={onShowCadastroCliente}
          className="bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
        >
          <Plus className="h-8 w-8 text-emerald-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Cadastrar Cliente</h3>
          <p className="text-sm text-gray-600 mt-1">Adicionar novo cliente ao sistema</p>
        </button>

        <button
          onClick={onShowGeracaoContrato}
          className="bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <FileText className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Gerar Contrato</h3>
          <p className="text-sm text-gray-600 mt-1">Criar novo contrato para cliente</p>
        </button>

        <button
          onClick={onShowGeracaoLinkPagamento}
          className="bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
        >
          <CreditCard className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Gerar Link de Pagamento</h3>
          <p className="text-sm text-gray-600 mt-1">Criar link para recebimento</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes cadastrados</p>
        </div>
        <button
          onClick={onShowCadastroCliente}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {clientes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum cliente cadastrado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientes.map(cliente => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{cliente.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cliente.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cliente.documento}</td>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contratos</h1>
          <p className="text-gray-600">Gerencie contratos e assinaturas digitais</p>
        </div>
        <button
          onClick={onShowGeracaoContrato}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Contrato
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {contratos.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum contrato criado ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contratos.map(contrato => (
              <div key={contrato.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{contrato.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-2">{contrato.cliente?.nome}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Valor: <strong className="text-gray-900">R$ {contrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contrato.status === 'assinado' ? 'bg-green-100 text-green-700' :
                        contrato.status === 'aguardando_assinatura' ? 'bg-yellow-100 text-yellow-700' :
                        contrato.status === 'rascunho' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Links de Pagamento</h1>
          <p className="text-gray-600">Gerencie links de pagamento gerados</p>
        </div>
        <button
          onClick={onShowGeracaoLinkPagamento}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Link
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {linksPagamento.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum link de pagamento criado ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {linksPagamento.map(link => (
              <div key={link.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{link.descricao}</h3>
                    <p className="text-sm text-gray-600 mb-2">{link.contrato?.titulo}</p>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span className="text-gray-600">
                        Valor: <strong className="text-gray-900">R$ {link.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        link.status === 'pago' ? 'bg-green-100 text-green-700' :
                        link.status === 'ativo' ? 'bg-blue-100 text-blue-700' :
                        link.status === 'expirado' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {link.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.link}
                        readOnly
                        className="flex-1 text-sm px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(link.link)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Requerimentos ao Superadmin</h1>
          <p className="text-gray-600">Envie solicitações e acompanhe status</p>
        </div>
        <button
          onClick={onShowRequerimento}
          className="px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Requerimento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {requerimentos.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum requerimento enviado ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requerimentos.map(req => (
              <div key={req.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{req.titulo}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    req.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                    req.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{req.descricao}</p>
                <p className="text-xs text-gray-500">Tipo: {req.tipo}</p>
                {req.resposta_admin && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-1">Resposta do Admin:</p>
                    <p className="text-sm text-blue-800">{req.resposta_admin}</p>
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
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [linksPagamento, setLinksPagamento] = useState<LinkPagamento[]>([])
  const [requerimentos, setRequerimentos] = useState<Requerimento[]>([])

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
        { label: 'Clientes', to: '/comercial/clientes', icon: Users },
        { label: 'Contratos', to: '/comercial/contratos', icon: FileText },
        { label: 'Pagamentos', to: '/comercial/pagamentos', icon: CreditCard },
        { label: 'Requerimentos', to: '/comercial/requerimentos', icon: AlertCircle },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar groups={sidebarGroups} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Hamburger toggle button - fixed in header for mobile */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 transition"
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
                onShowGeracaoContrato={() => setShowGeracaoContrato(true)}
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
        <GeracaoContrato
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
    </div>
  )
}
