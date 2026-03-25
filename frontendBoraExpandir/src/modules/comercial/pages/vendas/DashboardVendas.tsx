import React, { useEffect, useState, useMemo } from 'react'
import { TrendingUp, Target, Plus, DollarSign, Percent, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import type { Contrato, Cliente, ContratoServico, Agendamento, Requerimento } from '../../../types/comercial'
import { Badge } from '@/modules/shared/components/ui/badge'
import comercialService from '../../services/comercialService'
import { useAuth } from '../../../../contexts/AuthContext'
import FunnelVendas from './components/FunnelVendas'
import AlertasAcaoImediata from './components/AlertasAcaoImediata'
import GraficoEvolucaoVendas from './components/GraficoEvolucaoVendas'
import FeedAtividadeRecente from './components/FeedAtividadeRecente'
import type { Atividade } from './components/FeedAtividadeRecente'

interface DashboardVendasProps {
  contratos: Contrato[]
  clientes: Cliente[]
  onShowGeracaoContrato: () => void
  onSetContratoParaAssinar: (contrato: Contrato) => void
}

function buildAtividades(
  contratosServico: ContratoServico[],
  agendamentos: Agendamento[],
  requerimentos: Requerimento[]
): Atividade[] {
  const atividades: Atividade[] = []

  for (const c of contratosServico) {
    if (c.assinatura_status === 'aprovado') {
      atividades.push({
        id: `contrato_assinado_${c.id}`,
        tipo: 'contrato_assinado',
        titulo: `Contrato assinado por ${c.cliente_nome || 'Cliente'}`,
        descricao: c.servico_nome || undefined,
        data: c.atualizado_em || c.criado_em || new Date().toISOString(),
      })
    }
    if (c.pagamento_status === 'aprovado') {
      atividades.push({
        id: `pagamento_aprovado_${c.id}`,
        tipo: 'pagamento_aprovado',
        titulo: `Pagamento aprovado para ${c.servico_nome || 'servico'}`,
        descricao: c.cliente_nome || undefined,
        data: c.atualizado_em || c.criado_em || new Date().toISOString(),
      })
    }
  }

  for (const a of agendamentos) {
    if (a.status === 'confirmado' || a.status === 'realizado') {
      atividades.push({
        id: `lead_agendou_${a.id}`,
        tipo: 'lead_agendou',
        titulo: `${a.cliente?.nome || 'Lead'} agendou reuniao`,
        descricao: `${a.data} as ${a.hora}`,
        data: a.created_at,
      })
    }
  }

  for (const r of requerimentos) {
    if (r.status === 'aprovado') {
      atividades.push({
        id: `req_aprovado_${r.id}`,
        tipo: 'requerimento_aprovado',
        titulo: `Requerimento aprovado pelo admin`,
        descricao: r.titulo,
        data: r.updated_at,
      })
    }
  }

  return atividades.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
}

export default function DashboardVendas({
  contratos,
  clientes,
  onShowGeracaoContrato,
  onSetContratoParaAssinar
}: DashboardVendasProps) {
  const { profile } = useAuth()

  const [contratosServico, setContratosServico] = useState<ContratoServico[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [requerimentos, setRequerimentos] = useState<Requerimento[]>([])
  const [todosClientes, setTodosClientes] = useState<Cliente[]>(clientes)

  useEffect(() => {
    comercialService.getContratosServicos().then(setContratosServico).catch(() => {})
    comercialService.getAllRequerimentos().then(setRequerimentos).catch(() => {})
    comercialService.getAllClientes().then(setTodosClientes).catch(() => {})
    if (profile?.id) {
      comercialService.getAgendamentosByUsuario(profile.id).then(setAgendamentos).catch(() => {})
    }
  }, [profile?.id])

  // Calculos de KPI (baseados nos contratos antigos passados por props)
  const metaVendas = 50000
  const vendidoNoMes = contratos
    .filter(c => c.status === 'assinado')
    .reduce((acc, c) => acc + c.valor, 0)
  const percentualMeta = Math.round((vendidoNoMes / metaVendas) * 100)

  const contratosPendentes = contratos.filter(c => c.status === 'aguardando_assinatura')
  const contratosAssinados = contratos.filter(c => c.status === 'assinado')
  const taxaConversao = contratos.length > 0
    ? Math.round((contratosAssinados.length / contratos.length) * 100)
    : 0

  const comissaoEstimada = vendidoNoMes * 0.1
  const comissaoEstimadaPendente = contratosPendentes.reduce((acc, c) => acc + (c.valor * 0.1), 0)

  const leadsQuentes = contratosPendentes.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 5)

  // Dados para os novos componentes
  const leads = useMemo(() => todosClientes.filter(c => c.status !== 'cliente'), [todosClientes])

  const funilProps = {
    leadsCount: leads.length,
    agendamentosCount: agendamentos.length,
    contratosGeradosCount: contratosServico.length,
    contratosAssinadosCount: contratosServico.filter(c => c.assinatura_status === 'aprovado').length,
    pagamentosConfirmadosCount: contratosServico.filter(c => c.pagamento_status === 'aprovado').length,
  }

  const atividades = useMemo(
    () => buildAtividades(contratosServico, agendamentos, requerimentos),
    [contratosServico, agendamentos, requerimentos]
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard de Vendas</h1>
        <p className="text-gray-600 dark:text-gray-400">Foco em metas, comissoes e oportunidades</p>
      </div>

      {/* KPIs em Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-900">Minha Meta</h3>
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-3xl font-bold text-blue-900">{percentualMeta}%</p>
              <span className="text-sm text-blue-700">atingido</span>
            </div>
            <p className="text-sm text-blue-700">
              R$ {vendidoNoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {metaVendas.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(percentualMeta, 100)}%` }}
            />
          </div>
          {percentualMeta >= 100 && (
            <p className="text-xs text-green-700 font-medium mt-2">Meta atingida!</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-emerald-900">Vendas no Mes</h3>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-900 mb-2">
            R$ {vendidoNoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-emerald-700">
            {contratosAssinados.length} contrato{contratosAssinados.length !== 1 ? 's' : ''} assinado{contratosAssinados.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-purple-900">Comissao</h3>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900 mb-2">
            R$ {comissaoEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-purple-700">
            + R$ {comissaoEstimadaPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-orange-900">Taxa de Conversao</h3>
            <Percent className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-900 mb-2">{taxaConversao}%</p>
          <p className="text-sm text-orange-700">
            {contratosAssinados.length} de {contratos.length} propostas
          </p>
        </div>
      </div>

      {/* Funil de Vendas */}
      <div className="mb-6">
        <FunnelVendas {...funilProps} />
      </div>

      {/* Grafico + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <GraficoEvolucaoVendas contratos={contratosServico} />
        </div>
        <div>
          <AlertasAcaoImediata
            leads={leads}
            agendamentos={agendamentos}
            contratos={contratosServico}
            requerimentos={requerimentos}
          />
        </div>
      </div>

      {/* Leads Quentes + Feed Atividade + Acoes Rapidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">Leads Quentes - Acao Imediata</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Contratos visualizados que ainda nao foram assinados
              </p>
            </div>

            {leadsQuentes.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum lead quente no momento!</p>
                <p className="text-sm text-gray-500 mt-2">Todos os seus contratos foram assinados</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {leadsQuentes.map(contrato => (
                  <div key={contrato.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {contrato.cliente?.nome || 'Cliente sem identificacao'}
                          </h3>
                          <Badge variant="warning">Aguardando</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{contrato.titulo}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            Valor: <strong>R$ {contrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          </span>
                          <span className="text-gray-500 text-xs">
                            Atualizado: {new Date(contrato.updated_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onSetContratoParaAssinar(contrato)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm whitespace-nowrap transition-colors"
                      >
                        Assinar
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FeedAtividadeRecente atividades={atividades} />
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Acoes Rapidas</h3>

            <button
              onClick={onShowGeracaoContrato}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors mb-3 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Gerar Contrato em 3 Cliques
            </button>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-emerald-900 font-medium mb-1">Dica</p>
              <p className="text-xs text-emerald-700">
                Quanto mais rapido voce fecha o contrato, mais comissao voce ganha!
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 bg-blue-600 rounded-full" />
                <p className="text-sm text-gray-700">{contratosPendentes.length} propostas pendentes</p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 bg-green-600 rounded-full" />
                <p className="text-sm text-gray-700">{contratosAssinados.length} ja fechadas</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recebido</span>
                <span className="font-semibold text-green-600">
                  R$ {comissaoEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pendente</span>
                <span className="font-semibold text-orange-600">
                  R$ {comissaoEstimadaPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total Estimado</span>
                <span className="font-bold text-blue-600">
                  R$ {(comissaoEstimada + comissaoEstimadaPendente).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
