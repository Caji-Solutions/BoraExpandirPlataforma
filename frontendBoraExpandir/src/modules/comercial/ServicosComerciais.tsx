import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, FileText, Layers, Loader2 } from 'lucide-react'
import { catalogService, Service } from '../adm/services/catalogService'
import comercialService from './services/comercialService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast, ToastContainer } from '../../components/ui/Toast'
import type { Cliente } from '../../types/comercial'

export default function ServicosComerciais() {
  const navigate = useNavigate()
  const { activeProfile } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])

  const [selectedServico, setSelectedServico] = useState<Service | null>(null)
  const [selectedClienteId, setSelectedClienteId] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [catalog, clientesData] = await Promise.all([
          catalogService.getCatalogServices(),
          comercialService.getAllClientes()
        ])
        setServices(catalog || [])
        setClientes(clientesData || [])
      } catch (err) {
        console.error('Erro ao carregar serviços:', err)
        toast.error('Erro ao carregar serviços')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const visibleServices = useMemo(() => {
    return (services || []).filter((s) => s.showInCommercial)
  }, [services])

  const grouped = useMemo(() => {
    const fixos: Service[] = []
    const agendaveis: Service[] = []
    const diversos: Service[] = []

    visibleServices.forEach((s) => {
      const tipo = s.type || 'agendavel'
      if (tipo === 'fixo') fixos.push(s)
      else if (tipo === 'diverso') diversos.push(s)
      else agendaveis.push(s)
    })

    return { fixos, agendaveis, diversos }
  }, [visibleServices])

  const formatValor = (value: string) => {
    const num = Number(value)
    if (Number.isNaN(num)) return value
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  const handleAgendar = (servico: Service) => {
    navigate('/comercial/agendamento', {
      state: {
        preSelectedProduto: servico.id,
        step: 'cliente'
      }
    })
  }

  const handleCriarContrato = (servico: Service) => {
    setSelectedServico(servico)
    setSelectedClienteId('')
    setShowModal(true)
  }

  const handleConfirmarContrato = async () => {
    if (!selectedServico || !selectedClienteId) {
      toast.warning('Selecione um cliente ou lead')
      return
    }

    try {
      setCreating(true)
      const contrato = await comercialService.createContratoServico({
        cliente_id: selectedClienteId,
        servico_id: selectedServico.id,
        usuario_id: activeProfile?.id || undefined
      })
      toast.success('Contrato criado e enviado para assinatura')
      setShowModal(false)
      if (contrato?.id) {
        navigate(`/comercial/contratos/${contrato.id}`)
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

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Serviços</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Escolha um serviço para iniciar o fluxo comercial.</p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Agendáveis
        </div>
        {grouped.agendaveis.length === 0 ? (
          <div className="text-sm text-gray-500">Nenhum serviço agendável cadastrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grouped.agendaveis.map((servico) => (
              <div key={servico.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{servico.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor: € {formatValor(servico.value)}</p>
                </div>
                <button
                  onClick={() => handleAgendar(servico)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
                >
                  Agendar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <FileText className="w-5 h-5 text-blue-600" />
          Fixos
        </div>
        {grouped.fixos.length === 0 ? (
          <div className="text-sm text-gray-500">Nenhum serviço fixo cadastrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grouped.fixos.map((servico) => (
              <div key={servico.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{servico.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor: € {formatValor(servico.value)}</p>
                </div>
                <button
                  onClick={() => handleCriarContrato(servico)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Criar Contrato
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Layers className="w-5 h-5 text-gray-600" />
          Diversos
        </div>
        {grouped.diversos.length === 0 ? (
          <div className="text-sm text-gray-500">Nenhum serviço diverso cadastrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grouped.diversos.map((servico) => (
              <div key={servico.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{servico.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor: € {formatValor(servico.value)}</p>
                </div>
                <button
                  disabled
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm font-semibold cursor-not-allowed"
                >
                  Em breve
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && selectedServico && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-neutral-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Criar contrato</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Serviço: {selectedServico.name}</p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Selecione o cliente/lead</label>
              <select
                value={selectedClienteId}
                onChange={(e) => setSelectedClienteId(e.target.value)}
                className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
              >
                <option value="">Selecione...</option>
                {clientesAtivos.length > 0 && (
                  <optgroup label="Clientes">
                    {clientesAtivos.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </optgroup>
                )}
                {leads.length > 0 && (
                  <optgroup label="Leads">
                    {leads.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} (Lead)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarContrato}
                disabled={creating}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {creating ? 'Criando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
