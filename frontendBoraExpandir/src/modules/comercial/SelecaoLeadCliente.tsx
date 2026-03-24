import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Loader2, UserPlus, Users } from 'lucide-react'
import comercialService from './services/comercialService'
import { useAuth } from '../../contexts/AuthContext'
import Toast, { useToast, ToastContainer } from '@/components/ui/Toast'
import type { Cliente } from '../../types/comercial'

interface LocationState {
  servicoId: string;
  servicoNome: string;
  subservicoId?: string;
  subservicoNome?: string;
}

export default function SelecaoLeadCliente() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeProfile } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedClienteId, setSelectedClienteId] = useState('')

  const state = location.state as LocationState | null

  useEffect(() => {
    if (!state?.servicoId) {
      navigate('/comercial/servicos')
      return
    }

    const fetchClientes = async () => {
      try {
        setLoading(true)
        const clientesData = await comercialService.getAllClientes()
        setClientes(clientesData || [])
      } catch (err) {
        console.error('Erro ao carregar clientes:', err)
        toast.error('Erro ao carregar lista de clientes')
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [state, navigate])

  const handleConfirmarContrato = async () => {
    if (!state?.servicoId || !selectedClienteId) {
      toast.warning('Selecione um cliente ou lead para prosseguir')
      return
    }

    try {
      setCreating(true)
      const res = await comercialService.createContratoServico({
        cliente_id: selectedClienteId,
        servico_id: state.servicoId,
        usuario_id: activeProfile?.id || undefined,
        subservico_id: state.subservicoId,
        subservico_nome: state.subservicoNome
      })
      const contrato = res?.data || res
      
      toast.success('Rascunho criado, redirecionando para formulário...')
      if (contrato?.id) {
        navigate(`/comercial/contratos/assessoria/${contrato.id}`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao criar contrato')
    } finally {
      setCreating(false)
    }
  }

  const clientesAtivos = clientes.filter((c) => c.status !== 'LEAD')
  const leads = clientes.filter((c) => c.status === 'LEAD')

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!state) return null

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/comercial/servicos')}
        className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para serviços
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Selecionar Cliente/Lead</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Para quem este contrato será gerado?
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 space-y-6">
        {/* Resumo do Serviço */}
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Serviço Selecionado</h3>
          <p className="text-blue-900 dark:text-blue-200 font-medium">
            {state.servicoNome}
            {state.subservicoNome && ` - ${state.subservicoNome}`}
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Selecione na lista abaixo
          </label>
          <div className="relative">
            <select
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(e.target.value)}
              className="w-full h-12 border-2 border-gray-200 dark:border-neutral-700 rounded-xl px-4 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
            >
              <option value="" disabled>Escolha um lead ou cliente...</option>
              {clientesAtivos.length > 0 && (
                <optgroup label="Clientes Ativos" className="font-semibold px-2 py-1 bg-gray-50 dark:bg-neutral-800 text-gray-500">
                  {clientesAtivos.map((cliente) => (
                    <option key={cliente.id} value={cliente.id} className="text-gray-900 dark:text-white bg-white dark:bg-neutral-900">
                      🏢 {cliente.nome}
                    </option>
                  ))}
                </optgroup>
              )}
              {leads.length > 0 && (
                <optgroup label="Leads" className="font-semibold px-2 py-1 mt-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
                  {leads.map((cliente) => (
                    <option key={cliente.id} value={cliente.id} className="text-gray-900 dark:text-white bg-white dark:bg-neutral-900">
                      🎯 {cliente.nome} (Lead)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirmarContrato}
          disabled={!selectedClienteId || creating}
          className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Criando rascunho...
            </>
          ) : (
            <>
              Continuar para Rascunho
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </>
          )}
        </button>
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
