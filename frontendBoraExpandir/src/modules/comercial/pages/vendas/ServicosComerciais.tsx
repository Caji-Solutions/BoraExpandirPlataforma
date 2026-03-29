import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, FileText, Layers, Loader2, Search } from 'lucide-react'
import { catalogService, Service } from '../../../adm/services/catalogService'
import comercialService from '../../services/comercialService'
import { useAuth } from '../../../../contexts/AuthContext'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import type { Cliente } from '../../../types/comercial'

export default function ServicosComerciais() {
  const navigate = useNavigate()
  const { activeProfile } = useAuth()
  const toast = useToast()
  const nivel = activeProfile?.nivel || 'C1'

  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])

  const [selectedServico, setSelectedServico] = useState<Service | null>(null)
  const [showSubserviceModal, setShowSubserviceModal] = useState(false)
  const [subSearchTerm, setSubSearchTerm] = useState('')

  const filteredSubservices = useMemo(() => {
    if (!selectedServico?.subservices) return []
    if (!subSearchTerm.trim()) return selectedServico.subservices
    return selectedServico.subservices.filter(sub =>
      sub.name.toLowerCase().includes(subSearchTerm.toLowerCase())
    )
  }, [selectedServico?.subservices, subSearchTerm])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const catalog = await catalogService.getCatalogServices()
        setServices(catalog || [])
      } catch (err) {
        console.error('Erro ao carregar servicos:', err)
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
    // Nova regra: Comercial NÃO seleciona subserviço. Isso é responsabilidade do Jurídico depois.
    navigate('/comercial/selecao-lead-cliente', {
      state: {
        servicoId: servico.id,
        servicoNome: servico.name
      }
    })
  }

  const handleSelectSubservice = (subserverId: string, subserverNome: string) => {
    // Mantido por compatibilidade se necessário, mas não chamado pelo card.
    if (!selectedServico) return
    
    setShowSubserviceModal(false)
    navigate('/comercial/selecao-lead-cliente', {
      state: {
        servicoId: selectedServico.id,
        servicoNome: selectedServico.name,
        subservicoId: subserverId,
        subservicoNome: subserverNome
      }
    })
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
          Serviços com Agendamento
        </div>
        {grouped.agendaveis.length === 0 ? (
          <div className="text-sm text-gray-500">Nenhum serviço com agendamento cadastrado.</div>
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

      {nivel !== 'C1' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <FileText className="w-5 h-5 text-blue-600" />
            Contratos
          </div>
          {grouped.fixos.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhum contrato cadastrado.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped.fixos.map((servico) => (
                <div key={servico.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{servico.name}</h3>
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
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Layers className="w-5 h-5 text-gray-600" />
          Serviços Diversos
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

      {showSubserviceModal && selectedServico && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Qual o tipo de Assessoria?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              {selectedServico.name}
            </p>

            {(selectedServico.subservices?.length || 0) > 4 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar subservico..."
                  value={subSearchTerm}
                  onChange={(e) => setSubSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {filteredSubservices.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubservice(sub.id, sub.name)}
                  className="p-4 text-left border border-gray-200 dark:border-neutral-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{sub.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Clique para selecionar</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800">
              <button
                onClick={() => setShowSubserviceModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
