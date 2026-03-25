import { useEffect, useState } from 'react'
import { AlertTriangle, FileCheck, FileText, Loader2, XCircle } from 'lucide-react'
import { Badge } from '@/modules/shared/components/ui/badge'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { clienteService } from '../../services/clienteService'
import type { ContratoServico } from '../../../../types/comercial'

interface ClienteContratosProps {
  clienteId: string
}

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

export default function ClienteContratos({ clienteId }: ClienteContratosProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [contratos, setContratos] = useState<ContratoServico[]>([])

  const fetchContratos = async () => {
    if (!clienteId) return
    try {
      setLoading(true)
      const data = await clienteService.getContratos(clienteId)
      setContratos(data || [])
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar contratos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContratos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId])

  const getServicoNome = (contrato: ContratoServico) => {
    return contrato.servico_nome || contrato.servico?.nome || 'Servico'
  }

  const getActionMessage = (contrato: ContratoServico) => {
    if (contrato.assinatura_status === 'pendente') {
      return 'Acao necessaria: envie o contrato assinado para continuar.'
    }

    if (contrato.assinatura_status === 'recusado') {
      return contrato.assinatura_recusa_nota || 'Acao necessaria: contrato recusado, envie uma nova versao assinada.'
    }

    if (contrato.assinatura_status === 'aprovado' && contrato.pagamento_status === 'pendente') {
      return 'Acao necessaria: envie o comprovante de pagamento.'
    }

    if (contrato.assinatura_status === 'aprovado' && contrato.pagamento_status === 'recusado') {
      return contrato.pagamento_nota_recusa || 'Acao necessaria: comprovante recusado, envie um novo arquivo.'
    }

    return null
  }

  const handleUploadContrato = async (contratoId: string, file: File) => {
    try {
      await clienteService.uploadContratoAssinado(contratoId, clienteId, file)
      toast.success('Contrato enviado com sucesso')
      await fetchContratos()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar contrato')
    }
  }

  const handleUploadComprovante = async (contratoId: string, file: File) => {
    try {
      await clienteService.uploadComprovanteContrato(contratoId, clienteId, file)
      toast.success('Comprovante enviado com sucesso')
      await fetchContratos()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar comprovante')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contratos.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-12 text-center">
          <p className="text-sm text-gray-500">Nenhum contrato disponivel.</p>
        </div>
      ) : (
        contratos.map((contrato) => {
          const actionMessage = getActionMessage(contrato)
          const isLead = String(contrato.cliente?.status || '').toUpperCase() === 'LEAD'

          return (
            <div key={contrato.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getServicoNome(contrato)}</h3>
                  <p className="text-xs text-gray-500">Contrato #{contrato.id.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={assinaturaVariant(contrato.assinatura_status)}>
                    Assinatura: {contrato.assinatura_status}
                  </Badge>
                  <Badge variant={pagamentoVariant(contrato.pagamento_status)}>
                    Pagamento: {contrato.pagamento_status}
                  </Badge>
                </div>
              </div>

              {actionMessage && (
                <div className="text-sm rounded-lg border border-amber-200 bg-amber-50 text-amber-800 p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <span>{actionMessage}</span>
                </div>
              )}

              {isLead && (
                <div className="text-sm rounded-lg border border-blue-200 bg-blue-50 text-blue-800 p-3">
                  Este contratante ainda e lead. O acesso completo no portal e liberado apos aprovacao do comprovante.
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Contrato</h4>
                {contrato.contrato_gerado_url && (
                  <a
                    href={contrato.contrato_gerado_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="w-4 h-4" /> Baixar contrato gerado
                  </a>
                )}
                {contrato.contrato_assinado_url && (
                  <a
                    href={contrato.contrato_assinado_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="w-4 h-4" /> Ver contrato assinado enviado
                  </a>
                )}
                {contrato.assinatura_recusa_nota && (
                  <div className="text-sm text-red-600 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {contrato.assinatura_recusa_nota}
                  </div>
                )}
                {(contrato.assinatura_status === 'pendente' || contrato.assinatura_status === 'recusado') && !isLead && (
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadContrato(contrato.id, file)
                    }}
                  />
                )}
                {contrato.assinatura_status === 'em_analise' && (
                  <p className="text-xs text-gray-500">Contrato em analise pelo comercial.</p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Comprovante de pagamento</h4>
                {contrato.pagamento_comprovante_url && (
                  <a
                    href={contrato.pagamento_comprovante_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FileCheck className="w-4 h-4" /> Ver comprovante
                  </a>
                )}
                {contrato.pagamento_nota_recusa && (
                  <div className="text-sm text-red-600 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {contrato.pagamento_nota_recusa}
                  </div>
                )}
                {(contrato.pagamento_status === 'pendente' || contrato.pagamento_status === 'recusado') && contrato.assinatura_status === 'aprovado' && !isLead && (
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadComprovante(contrato.id, file)
                    }}
                  />
                )}
                {contrato.pagamento_status === 'em_analise' && (
                  <p className="text-xs text-gray-500">Comprovante em analise pelo financeiro.</p>
                )}
                {contrato.pagamento_status === 'aprovado' && (
                  <p className="text-xs text-emerald-600">Pagamento aprovado.</p>
                )}
              </div>
            </div>
          )
        })
      )}

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
