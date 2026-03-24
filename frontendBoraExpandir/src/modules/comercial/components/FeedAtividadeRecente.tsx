import React from 'react'
import { FileCheck, DollarSign, Calendar, CheckCircle } from 'lucide-react'

export interface Atividade {
  id: string
  tipo: 'contrato_assinado' | 'pagamento_aprovado' | 'lead_agendou' | 'requerimento_aprovado'
  titulo: string
  descricao?: string
  data: string
}

interface FeedAtividadeRecenteProps {
  atividades: Atividade[]
  maxItems?: number
}

function tempoRelativo(dataStr: string): string {
  const agora = Date.now()
  const diff = agora - new Date(dataStr).getTime()
  const minutos = Math.floor(diff / 60000)
  if (minutos < 60) return `ha ${minutos || 1} minuto${minutos !== 1 ? 's' : ''}`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `ha ${horas} hora${horas !== 1 ? 's' : ''}`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return `ha ${dias} dia${dias !== 1 ? 's' : ''}`
  const semanas = Math.floor(dias / 7)
  return `ha ${semanas} semana${semanas !== 1 ? 's' : ''}`
}

const CONFIG_TIPO = {
  contrato_assinado: {
    icon: <FileCheck className="h-4 w-4" />,
    cor: 'bg-green-100 text-green-600',
    bordaCor: 'border-green-300',
  },
  pagamento_aprovado: {
    icon: <DollarSign className="h-4 w-4" />,
    cor: 'bg-emerald-100 text-emerald-600',
    bordaCor: 'border-emerald-300',
  },
  lead_agendou: {
    icon: <Calendar className="h-4 w-4" />,
    cor: 'bg-blue-100 text-blue-600',
    bordaCor: 'border-blue-300',
  },
  requerimento_aprovado: {
    icon: <CheckCircle className="h-4 w-4" />,
    cor: 'bg-purple-100 text-purple-600',
    bordaCor: 'border-purple-300',
  },
}

export default function FeedAtividadeRecente({ atividades, maxItems = 15 }: FeedAtividadeRecenteProps) {
  const itens = atividades.slice(0, maxItems)
  const temMais = atividades.length > maxItems

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Atividade Recente</h2>

      {itens.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Nenhuma atividade recente
        </div>
      ) : (
        <div className="relative max-h-96 overflow-y-auto pr-1">
          <div className="space-y-0">
            {itens.map((atividade, index) => {
              const config = CONFIG_TIPO[atividade.tipo]
              const ultimo = index === itens.length - 1

              return (
                <div key={atividade.id} className="flex gap-3">
                  {/* Linha vertical + icone */}
                  <div className="flex flex-col items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${config.bordaCor} ${config.cor}`}>
                      {config.icon}
                    </div>
                    {!ultimo && <div className="w-px flex-1 bg-gray-200 my-1" />}
                  </div>

                  {/* Conteudo */}
                  <div className={`flex-1 pb-4 ${ultimo ? '' : ''}`}>
                    <p className="text-sm font-medium text-gray-800 leading-snug">{atividade.titulo}</p>
                    {atividade.descricao && (
                      <p className="text-xs text-gray-500 mt-0.5">{atividade.descricao}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{tempoRelativo(atividade.data)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {temMais && (
            <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
              + {atividades.length - maxItems} atividade{atividades.length - maxItems !== 1 ? 's' : ''} mais antigas
            </p>
          )}
        </div>
      )}
    </div>
  )
}
