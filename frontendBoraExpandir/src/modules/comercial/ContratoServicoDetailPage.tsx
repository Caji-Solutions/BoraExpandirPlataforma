import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, FileCheck, FileText, Loader2, XCircle } from 'lucide-react'
import comercialService from './services/comercialService'
import type { ContratoServico } from '../../types/comercial'
import { Badge } from '../../components/ui/Badge'
import { useToast, ToastContainer } from '../../components/ui/Toast'
import { useAuth } from '../../contexts/AuthContext'
import { formatPhoneDisplay } from '../../utils/formatters'

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
    if (!contrato) return { nome: 'ServiÃ§o', id: '' }
    return {
      nome: contrato.servico_nome || contrato.servico?.nome || 'ServiÃ§o',
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
    navigate('/comercial/agendamento', {
      state: {
        preSelectedClient: {
          id: contrato.cliente_id,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone
        },
        preSelectedProduto: servico.id,
        step: 'data_hora',
        paid: true
      }
    })
  }

  if (loading || !contrato) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const clienteInfo = getClienteInfo()
  const servicoInfo = getServicoInfo()

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{servicoInfo.nome}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{clienteInfo.nome}</p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant={assinaturaVariant(contrato.assinatura_status)}>
            Assinatura: {contrato.assinatura_status}
          </Badge>
          <Badge variant={pagamentoVariant(contrato.pagamento_status)}>
            Pagamento: {contrato.pagamento_status}
          </Badge>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assinatura do contrato</h2>

        {contrato.contrato_assinado_url && (
          <a
            href={contrato.contrato_assinado_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <FileText className="w-4 h-4" /> Ver contrato assinado
          </a>
        )}

        {contrato.assinatura_status === 'pendente' || contrato.assinatura_status === 'recusado' ? (
          <div className="space-y-3">
            {contrato.assinatura_recusa_nota && (
              <div className="text-sm text-red-600 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {contrato.assinatura_recusa_nota}
              </div>
            )}
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUploadContrato(file)
              }}
              disabled={uploadingContrato}
            />
          </div>
        ) : null}

        {contrato.assinatura_status === 'em_analise' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Contrato enviado pelo cliente. Aguardando aprovaÃ§Ã£o.</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAprovar}
                disabled={processing}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Aprovar
              </button>
              <button
                onClick={handleRecusar}
                disabled={processing}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                Recusar
              </button>
            </div>
            <textarea
              value={notaRecusa}
              onChange={(e) => setNotaRecusa(e.target.value)}
              placeholder="Motivo da recusa"
              className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg p-2 text-sm"
              rows={3}
            />
          </div>
        )}

        {contrato.assinatura_status === 'aprovado' && (
          <p className="text-sm text-emerald-600">Contrato aprovado.</p>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comprovante de pagamento</h2>

        {contrato.pagamento_status === 'pendente' || contrato.pagamento_status === 'recusado' ? (
          <div className="space-y-3">
            {contrato.pagamento_nota_recusa && (
              <div className="text-sm text-red-600 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {contrato.pagamento_nota_recusa}
              </div>
            )}
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUploadComprovante(file)
              }}
              disabled={uploadingComprovante || contrato.assinatura_status !== 'aprovado'}
            />
            {contrato.assinatura_status !== 'aprovado' && (
              <p className="text-xs text-gray-500">Aguarde a aprovaÃ§Ã£o do contrato para enviar o comprovante.</p>
            )}
          </div>
        ) : null}

        {contrato.pagamento_status === 'em_analise' && (
          <p className="text-sm text-gray-500">Comprovante em anÃ¡lise pelo financeiro.</p>
        )}

        {contrato.pagamento_status === 'aprovado' && (
          <div className="flex items-center gap-2">
            <Badge variant="success">Pagamento aprovado</Badge>
            <button
              onClick={handleAgendar}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Agendar serviÃ§o
            </button>
          </div>
        )}

        {contrato.pagamento_comprovante_url && (
          <a
            href={contrato.pagamento_comprovante_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <FileCheck className="w-4 h-4" /> Ver comprovante enviado
          </a>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
