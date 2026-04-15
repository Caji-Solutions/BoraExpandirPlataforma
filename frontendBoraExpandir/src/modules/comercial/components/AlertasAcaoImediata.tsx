import React, { useMemo, useState } from 'react'
import { AlertTriangle, Clock, FileSignature, ListChecks, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import type { Cliente, Agendamento, ContratoServico, Requerimento } from '@/types/comercial'

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000
const TRES_DIAS_MS = 3 * 24 * 60 * 60 * 1000

interface AlertasAcaoImediataProps {
  leads: Cliente[]
  agendamentos: Agendamento[]
  contratos: ContratoServico[]
  requerimentos: Requerimento[]
  onNavigateToLead?: (leadId: string) => void
  onNavigateToAgendamento?: (agendamentoId: string) => void
  onNavigateToContrato?: (contratoId: string) => void
}

interface CategoriaAlerta {
  key: string
  titulo: string
  icon: React.ReactNode
  cor: string
  corBg: string
  corBorder: string
  itens: { id: string; nome: string; detalhe?: string; onAcao?: () => void }[]
}

export default function AlertasAcaoImediata({
  leads,
  agendamentos,
  contratos,
  requerimentos,
  onNavigateToLead,
  onNavigateToAgendamento,
  onNavigateToContrato,
}: AlertasAcaoImediataProps) {
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({})

  const categorias = useMemo<CategoriaAlerta[]>(() => {
    const agora = Date.now()

    const leadsFrios = leads.filter(
      l => l.status !== 'cliente' && agora - new Date(l.created_at).getTime() > SETE_DIAS_MS
    )

    const agendamentosPendentes = agendamentos.filter(
      a => a.status === 'confirmado' && a.pagamento_status !== 'aprovado'
    )

    const contratosAguardando = contratos.filter(
      c =>
        c.assinatura_status === 'pendente' &&
        c.criado_em &&
        agora - new Date(c.criado_em).getTime() > TRES_DIAS_MS
    )

    const requerimentosPendentes = requerimentos.filter(r => r.status === 'pendente')

    return [
      {
        key: 'leads_frios',
        titulo: 'Leads Frios (+7 dias)',
        icon: <AlertTriangle className="h-4 w-4" />,
        cor: 'text-orange-600',
        corBg: 'bg-orange-50',
        corBorder: 'border-orange-200',
        itens: leadsFrios.map(l => ({
          id: l.id,
          nome: l.nome,
          detalhe: `Cadastrado em ${new Date(l.created_at).toLocaleDateString('pt-BR')}`,
          onAcao: onNavigateToLead ? () => onNavigateToLead(l.id) : undefined,
        })),
      },
      {
        key: 'pagamento_pendente',
        titulo: 'Pagamento Pendente',
        icon: <Clock className="h-4 w-4" />,
        cor: 'text-yellow-600',
        corBg: 'bg-yellow-50',
        corBorder: 'border-yellow-200',
        itens: agendamentosPendentes.map(a => ({
          id: a.id,
          nome: a.cliente?.nome || 'Cliente sem identificacao',
          detalhe: `${a.data} as ${a.hora}`,
          onAcao: onNavigateToAgendamento ? () => onNavigateToAgendamento(a.id) : undefined,
        })),
      },
      {
        key: 'contrato_assinatura',
        titulo: 'Aguardando Assinatura (+3 dias)',
        icon: <FileSignature className="h-4 w-4" />,
        cor: 'text-blue-600',
        corBg: 'bg-blue-50',
        corBorder: 'border-blue-200',
        itens: contratosAguardando.map(c => ({
          id: c.id,
          nome: c.cliente_nome || 'Cliente sem identificacao',
          detalhe: c.servico_nome || undefined,
          onAcao: onNavigateToContrato ? () => onNavigateToContrato(c.id) : undefined,
        })),
      },
      {
        key: 'requerimentos_pendentes',
        titulo: 'Requerimentos Pendentes',
        icon: <ListChecks className="h-4 w-4" />,
        cor: 'text-purple-600',
        corBg: 'bg-purple-50',
        corBorder: 'border-purple-200',
        itens: requerimentosPendentes.map(r => ({
          id: r.id,
          nome: r.titulo,
          detalhe: r.descricao?.slice(0, 60) + (r.descricao?.length > 60 ? '...' : '') || undefined,
        })),
      },
    ]
  }, [leads, agendamentos, contratos, requerimentos, onNavigateToLead, onNavigateToAgendamento, onNavigateToContrato])

  const totalAlertas = categorias.reduce((acc, c) => acc + c.itens.length, 0)

  const toggleExpandido = (key: string) => {
    setExpandidos(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Alertas de Acao Imediata</h2>
        {totalAlertas > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {totalAlertas}
          </span>
        )}
      </div>

      {totalAlertas === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">Nenhum alerta no momento</div>
        </div>
      ) : (
        <div className="space-y-3">
          {categorias.map(cat => {
            if (cat.itens.length === 0) return null
            const aberto = !!expandidos[cat.key]
            return (
              <div key={cat.key} className={`rounded-lg border ${cat.corBorder} ${cat.corBg} overflow-hidden`}>
                <button
                  className="w-full flex items-center justify-between px-4 py-3"
                  onClick={() => toggleExpandido(cat.key)}
                >
                  <div className="flex items-center gap-2">
                    <span className={cat.cor}>{cat.icon}</span>
                    <span className={`text-sm font-semibold ${cat.cor}`}>{cat.titulo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white border ${cat.corBorder} ${cat.cor}`}>
                      {cat.itens.length}
                    </span>
                    {aberto ? (
                      <ChevronUp className={`h-4 w-4 ${cat.cor}`} />
                    ) : (
                      <ChevronDown className={`h-4 w-4 ${cat.cor}`} />
                    )}
                  </div>
                </button>

                {aberto && (
                  <div className="border-t border-white/60 divide-y divide-white/40">
                    {cat.itens.map(item => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-2.5 bg-white/50">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.nome}</p>
                          {item.detalhe && (
                            <p className="text-xs text-gray-500 truncate">{item.detalhe}</p>
                          )}
                        </div>
                        {item.onAcao && (
                          <button
                            onClick={item.onAcao}
                            className={`ml-3 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${cat.corBorder} ${cat.cor} bg-white hover:opacity-80 transition-opacity whitespace-nowrap`}
                          >
                            Ver
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
