import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, CheckCircle2, FileCheck, FileText, Loader2, Upload, XCircle, CreditCard, PenTool, Eye } from 'lucide-react'
import comercialService from '../../services/comercialService'
import type { ContratoServico } from '../../../types/comercial'
import { Badge } from '@/modules/shared/components/ui/badge'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { useAuth } from '../../../../contexts/AuthContext'
import { formatPhoneDisplay } from '../../../../utils/formatters'

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

export default function ContratoServicoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activeProfile } = useAuth()
  const toast = useToast()

  const [contrato, setContrato] = useState<ContratoServico | null>(null)
  const [loading, setLoading] = useState(true)
  const [notaRecusa, setNotaRecusa] = useState('')
  const [uploadingContrato, setUploadingContrato] = useState(false)
  const [uploadingComprovante, setUploadingComprovante] = useState(false)
  const [processing, setProcessing] = useState(false)

  const fetchContrato = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await comercialService.getContratoServicoById(id)
      if (data?.is_draft) {
        navigate(`/comercial/contratos/assessoria/${id}`, { replace: true })
        return
      }
      setContrato(data)
    } catch (err) {
      console.error('Erro ao buscar contrato:', err)
      toast.error('Erro ao carregar contrato')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContrato()
  }, [id])

  const getClienteInfo = () => {
    if (!contrato) return { nome: 'Cliente', email: '', telefone: '' }
    return {
      nome: contrato.cliente_nome || contrato.cliente?.nome || 'Cliente',
      email: contrato.cliente_email || contrato.cliente?.email || '',
      telefone: formatPhoneDisplay(contrato.cliente_telefone || contrato.cliente?.whatsapp || '')
    }
  }

  const getServicoInfo = () => {
    if (!contrato) return { nome: 'Servico', id: '' }
    return {
      nome: contrato.servico_nome || contrato.servico?.nome || 'Servico',
      id: contrato.servico_id || contrato.servico?.id || ''
    }
  }

  const handleUploadContrato = async (file: File) => {
    if (!id) return
    try {
      setUploadingContrato(true)
      await comercialService.uploadContratoAssinado(id, file, activeProfile?.id)
      toast.success('Contrato enviado')
      await fetchContrato()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao enviar contrato')
    } finally {
      setUploadingContrato(false)
    }
  }

  const handleAprovar = async () => {
    if (!id) return
    try {
      setProcessing(true)
      await comercialService.aprovarContratoServico(id, activeProfile?.id)
      toast.success('Contrato aprovado')
      await fetchContrato()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao aprovar contrato')
    } finally {
      setProcessing(false)
    }
  }

  const handleRecusar = async () => {
    if (!id) return
    if (!notaRecusa.trim()) {
      toast.warning('Informe o motivo da recusa')
      return
    }
    try {
      setProcessing(true)
      await comercialService.recusarContratoServico(id, notaRecusa)
      toast.success('Contrato recusado')
      setNotaRecusa('')
      await fetchContrato()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao recusar contrato')
    } finally {
      setProcessing(false)
    }
  }

  const handleUploadComprovante = async (file: File) => {
    if (!id) return
    try {
      setUploadingComprovante(true)
      await comercialService.uploadComprovanteContrato(id, file)
      toast.success('Comprovante enviado')
      await fetchContrato()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar comprovante')
    } finally {
      setUploadingComprovante(false)
    }
  }

  const handleAgendar = () => {
    if (!contrato) return
    const cliente = getClienteInfo()
    const servico = getServicoInfo()
    const draft = contrato.draft_dados as any
    const valorReal = (() => {
      if (draft?.valor_desconto) {
        const parsed = parseFloat(String(draft.valor_desconto).replace(/\./g, '').replace(',', '.'))
        if (!isNaN(parsed) && parsed > 0) return parsed
      }
      return contrato.servico_valor
    })()
    navigate('/comercial/agendamento', {
      state: {
        preSelectedClient: {
          id: contrato.cliente_id,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone
        },
        preSelectedProduto: servico.id,
        preSelectedValor: valorReal,
        step: 'data_hora',
        paid: true
      }
    })
  }

  if (loading || !contrato) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Carregando contrato...</p>
      </div>
    )
  }

  const clienteInfo = getClienteInfo()
  const servicoInfo = getServicoInfo()

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-4xl mx-auto space-y-6">
      {/* Voltar */}
      <button
        onClick={() => navigate('/comercial/contratos')}
        className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Contratos
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{servicoInfo.nome}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{clienteInfo.nome}</p>
              {clienteInfo.email && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{clienteInfo.email} | {clienteInfo.telefone}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={assinaturaVariant(contrato.assinatura_status)}>
              <PenTool className="w-3 h-3 mr-1" />
              {assinaturaLabel(contrato.assinatura_status)}
            </Badge>
            <Badge variant={pagamentoVariant(contrato.pagamento_status)}>
              <CreditCard className="w-3 h-3 mr-1" />
              {pagamentoLabel(contrato.pagamento_status)}
            </Badge>
          </div>
        </div>

        {/* Contrato gerado link */}
        {contrato.contrato_gerado_url && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <a
              href={contrato.contrato_gerado_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
            >
              <Eye className="w-4 h-4" /> Visualizar contrato gerado
            </a>
          </div>
        )}
      </div>

      {/* Assinatura Card */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-600" />
            Assinatura do contrato
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {contrato.contrato_assinado_url && (
            <a
              href={contrato.contrato_assinado_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-500/20 transition-colors"
            >
              <FileCheck className="w-4 h-4" /> Ver contrato assinado
            </a>
          )}

          {(contrato.assinatura_status === 'pendente' || contrato.assinatura_status === 'recusado') && (
            <div className="space-y-3">
              {contrato.assinatura_recusa_nota && (
                <div className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2 bg-red-50 dark:bg-red-500/10 rounded-xl p-3 border border-red-100 dark:border-red-500/20">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{contrato.assinatura_recusa_nota}</span>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all text-gray-600 dark:text-gray-400 font-medium text-sm">
                <Upload className="w-5 h-5" />
                {uploadingContrato ? 'Enviando...' : 'Enviar contrato assinado'}
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadContrato(file)
                  }}
                  disabled={uploadingContrato}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {contrato.assinatura_status === 'em_analise' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-xl text-sm border border-amber-100 dark:border-amber-500/20">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Contrato enviado pelo cliente. Aguardando aprovacao.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAprovar}
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 transition-all active:scale-95 shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Aprovar
                </button>
                <button
                  onClick={handleRecusar}
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-all active:scale-95 shadow-lg shadow-red-600/20 flex items-center gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Recusar
                </button>
              </div>

              <textarea
                value={notaRecusa}
                onChange={(e) => setNotaRecusa(e.target.value)}
                placeholder="Motivo da recusa (obrigatorio para recusar)"
                className="w-full border border-gray-200 dark:border-neutral-700 rounded-xl p-3 text-sm bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                rows={3}
              />
            </div>
          )}

          {contrato.assinatura_status === 'aprovado' && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-sm border border-emerald-100 dark:border-emerald-500/20 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Contrato aprovado com sucesso.
            </div>
          )}
        </div>
      </div>

      {/* Pagamento Card */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Comprovante de pagamento
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {(contrato.pagamento_status === 'pendente' || contrato.pagamento_status === 'recusado') && (
            <div className="space-y-3">
              {contrato.pagamento_nota_recusa && (
                <div className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2 bg-red-50 dark:bg-red-500/10 rounded-xl p-3 border border-red-100 dark:border-red-500/20">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{contrato.pagamento_nota_recusa}</span>
                </div>
              )}
              <label className={`flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed rounded-xl text-sm font-medium transition-all ${
                contrato.assinatura_status !== 'aprovado'
                  ? 'border-gray-200 dark:border-neutral-800 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 dark:border-neutral-700 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 text-gray-600 dark:text-gray-400'
              }`}>
                <Upload className="w-5 h-5" />
                {uploadingComprovante ? 'Enviando...' : 'Enviar comprovante de pagamento'}
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadComprovante(file)
                  }}
                  disabled={uploadingComprovante || contrato.assinatura_status !== 'aprovado'}
                  className="hidden"
                />
              </label>
              {contrato.assinatura_status !== 'aprovado' && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Aguarde a aprovacao do contrato para enviar o comprovante.</p>
              )}
            </div>
          )}

          {contrato.pagamento_status === 'em_analise' && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-xl text-sm border border-amber-100 dark:border-amber-500/20">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Comprovante em analise pelo financeiro.</span>
            </div>
          )}

          {contrato.pagamento_status === 'aprovado' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-sm border border-emerald-100 dark:border-emerald-500/20 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Pagamento aprovado!
              </div>
              <button
                onClick={handleAgendar}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Agendar servico
              </button>
            </div>
          )}

          {contrato.pagamento_comprovante_url && (
            <a
              href={contrato.pagamento_comprovante_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-500/20 transition-colors"
            >
              <FileCheck className="w-4 h-4" /> Ver comprovante enviado
            </a>
          )}
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
