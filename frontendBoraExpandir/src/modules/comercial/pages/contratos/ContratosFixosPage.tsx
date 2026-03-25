import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, FileText, Loader2, PencilLine, CheckCircle2, Clock, CreditCard, ChevronRight } from 'lucide-react'
import { Badge } from '@/modules/shared/components/ui/badge'
import comercialService from '../../services/comercialService'
import type { ContratoServico } from '../../../types/comercial'

const assinaturaVariant = (status: string) => {
  if (status === 'aprovado') return 'success'
  if (status === 'em_analise') return 'warning'
  if (status === 'recusado') return 'destructive'
  return 'secondary'
}

const pagamentoVariant = (status: string) => {
  if (status === 'aprovado') return 'success'
  if (status === 'em_analise') return 'warning'
  if (status === 'recusado') return 'destructive'
  return 'secondary'
}

const assinaturaLabel = (status: string) => {
  if (status === 'aprovado') return 'Aprovada'
  if (status === 'em_analise') return 'Em analise'
  if (status === 'recusado') return 'Recusada'
  return 'Pendente'
}

const pagamentoLabel = (status: string) => {
  if (status === 'aprovado') return 'Confirmado'
  if (status === 'em_analise') return 'Em analise'
  if (status === 'recusado') return 'Recusado'
  return 'Pendente'
}

export default function ContratosFixosPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [contratos, setContratos] = useState<ContratoServico[]>([])

  useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true)
        const data = await comercialService.getContratosServicos()
        setContratos(data || [])
      } catch (err) {
        console.error('Erro ao buscar contratos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContratos()
  }, [])

  const getClienteNome = (contrato: ContratoServico) => {
    return contrato.cliente_nome || contrato.cliente?.nome || 'Cliente'
  }

  const getServicoNome = (contrato: ContratoServico) => {
    return contrato.servico_nome || contrato.servico?.nome || 'Servico'
  }

  const getEtapaLabel = (etapa?: number) => {
    const etapaNumerica = Number(etapa || 1)
    const labels: Record<number, string> = {
      1: 'Dados Pessoais',
      2: 'Servicos e Valores',
      3: 'Pagamento',
      4: 'Resumo'
    }
    return labels[etapaNumerica] || `Etapa ${etapaNumerica}`
  }

  const handleOpenContrato = (contrato: ContratoServico) => {
    if (contrato.is_draft) {
      navigate(`/comercial/contratos/assessoria/${contrato.id}`)
      return
    }

    navigate(`/comercial/contratos/${contrato.id}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Carregando contratos...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Contratos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Acompanhe contratos, etapas e status de pagamento.</p>
        </div>
      </div>

      {contratos.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Nenhum contrato cadastrado ainda.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Crie um contrato a partir de Servicos no menu lateral.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contratos.map((contrato) => {
            const hasDraftError = contrato.draft_dados?.__erroGeracao?.ativo

            return (
              <button
                key={contrato.id}
                onClick={() => handleOpenContrato(contrato)}
                className={`w-full text-left bg-white dark:bg-neutral-900 border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 group hover:shadow-lg active:scale-[0.99] ${
                  hasDraftError
                    ? 'border-red-200 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-800'
                    : 'border-gray-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hasDraftError
                      ? 'bg-red-100 dark:bg-red-900/20'
                      : contrato.is_draft
                        ? 'bg-amber-100 dark:bg-amber-900/20'
                        : 'bg-emerald-100 dark:bg-emerald-900/20'
                  }`}>
                    {hasDraftError ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : contrato.is_draft ? (
                      <PencilLine className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {getServicoNome(contrato)}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{getClienteNome(contrato)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {contrato.is_draft && (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {getEtapaLabel(contrato.etapa_fluxo)}
                    </Badge>
                  )}
                  {hasDraftError && (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Erro
                    </Badge>
                  )}
                  <Badge variant={assinaturaVariant(contrato.assinatura_status)}>
                    <PencilLine className="w-3 h-3 mr-1" />
                    {assinaturaLabel(contrato.assinatura_status)}
                  </Badge>
                  <Badge variant={pagamentoVariant(contrato.pagamento_status)}>
                    <CreditCard className="w-3 h-3 mr-1" />
                    {pagamentoLabel(contrato.pagamento_status)}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-gray-400 hidden md:block group-hover:text-emerald-500 transition-colors ml-1" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
