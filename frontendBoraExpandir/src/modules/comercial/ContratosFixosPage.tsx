import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Loader2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import comercialService from './services/comercialService'
import type { ContratoServico } from '../../types/comercial'

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
    return contrato.servico_nome || contrato.servico?.nome || 'Serviço'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Contratos Fixos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe contratos e status de pagamento.</p>
        </div>
      </div>

      {contratos.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-12 text-center">
          <p className="text-sm text-gray-500">Nenhum contrato cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contratos.map((contrato) => (
            <button
              key={contrato.id}
              onClick={() => navigate(`/comercial/contratos/${contrato.id}`)}
              className="w-full text-left bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-300 transition"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getServicoNome(contrato)}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getClienteNome(contrato)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={assinaturaVariant(contrato.assinatura_status)}>
                  Assinatura: {contrato.assinatura_status}
                </Badge>
                <Badge variant={pagamentoVariant(contrato.pagamento_status)}>
                  Pagamento: {contrato.pagamento_status}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
