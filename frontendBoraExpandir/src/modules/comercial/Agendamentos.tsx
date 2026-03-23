import React, { useMemo, useState, useEffect } from 'react'
import { Calendar, Clock, Filter, Search, X, CreditCard, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Agendamento } from '../../types/comercial'
import { Badge } from '../../components/ui/Badge'
import { GerenciamentoAgendamentoModal } from './components/GerenciamentoAgendamentoModal'

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; label: string }> = {
	agendado: {
		variant: 'success',
		label: 'Agendado',
	},
	confirmado: {
		variant: 'success',
		label: 'Confirmado',
	},
	realizado: {
		variant: 'default',
		label: 'Realizado',
	},
	cancelado: {
		variant: 'destructive',
		label: 'Cancelado',
	},
	aguardando_verificacao: {
		variant: 'warning',
		label: 'Aguardando Verif.',
	},
	Conflito: {
		variant: 'warning',
		label: 'Conflito',
	},
	reagendar: {
		variant: 'warning',
		label: 'Reagendar',
	},
}

const getStatusConfig = (status: string) =>
	statusConfig[status] || { variant: 'secondary' as const, label: status }

interface AgendamentosPageProps {
	agendamentos: Agendamento[]
	onRefresh?: () => void
}

export default function AgendamentosPage({ agendamentos, onRefresh }: AgendamentosPageProps) {
	const navigate = useNavigate()
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<'todos' | Agendamento['status']>('todos')
	const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null)

	useEffect(() => {
		onRefresh?.()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const filtered = useMemo(() => {
		return agendamentos
			.filter(a => (status === 'todos' ? true : a.status === status))
			.filter(a => {
				if (!search.trim()) return true
				const term = search.toLowerCase()
				return (
					(a.cliente?.nome || '').toLowerCase().includes(term) ||
					(a.produto || '').toLowerCase().includes(term) ||
					a.data.includes(term)
				)
			})
			.sort((a, b) => new Date(a.data + ' ' + a.hora).getTime() - new Date(b.data + ' ' + b.hora).getTime())
	}, [agendamentos, search, status])

	return (
		<div>
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Meus Agendamentos</h1>
					<p className="text-gray-600 dark:text-gray-400">Visualize e gerencie todos os agendamentos</p>
				</div>
				</div>

			<div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-4 mb-4">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
					<div className="flex-1 relative">
						<Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
						<input
							value={search}
							onChange={e => setSearch(e.target.value)}
							placeholder="Buscar por cliente, produto ou data"
							className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
						/>
						{search && (
							<button
								onClick={() => setSearch('')}
								className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
								aria-label="Limpar busca"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
						<select
							value={status}
							onChange={e => setStatus(e.target.value as typeof status)}
							className="px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
						>
							<option value="todos">Todos</option>
							<option value="agendado">Agendados</option>
							<option value="confirmado">Confirmados</option>
							<option value="realizado">Realizados</option>
							<option value="cancelado">Cancelados</option>
							<option value="aguardando_verificacao">Aguardando Verificação</option>
					<option value="reagendar">Reagendar</option>
						</select>
					</div>
				</div>
			</div>

			<div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
				{filtered.length === 0 ? (
					<div className="p-12 text-center">
						<Calendar className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
						<p className="text-gray-600 dark:text-gray-400">Nenhum agendamento encontrado</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Data</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Hora</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Duração</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Produto</th>
									<th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Pagamento</th>
									<th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Formulário</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
								{filtered.map(agendamento => {
									const isConfirmed = agendamento.status === 'confirmado' || agendamento.status === 'realizado'
									const isCancelled = agendamento.status === 'cancelado'
									const isCronBlocked = isCancelled && agendamento.pagamento_nota_recusa?.includes('[SISTEMA]')
									const isLocked = !!agendamento.cliente_is_user && agendamento.status === 'agendado'
									const isEditable = !isConfirmed && !isLocked && !isCancelled

									return (
										<tr
											key={agendamento.id}
											className={`transition-colors ${isCronBlocked
													? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-l-red-600'
													: isCancelled
													? 'bg-gray-50 dark:bg-neutral-800/40 border-l-4 border-l-gray-400 dark:border-l-neutral-600'
													: agendamento.status === 'reagendar'
													? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-400'
													: agendamento.conflito_horario
													? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-400'
													: ''
												} ${isEditable
													? 'hover:bg-gray-50 dark:hover:bg-neutral-700/50 cursor-pointer'
													: isCancelled
														? 'opacity-70 cursor-pointer hover:opacity-90'
														: isLocked
															? 'opacity-40 grayscale-[0.5] cursor-not-allowed pointer-events-none'
															: 'hover:bg-gray-50 dark:hover:bg-neutral-700/50 cursor-pointer'
												}`}
											onClick={() => {
												if (!isLocked) {
													navigate(`/comercial/agendamento/${agendamento.id}`)
												}
											}}
										>
											<td className="px-6 py-4 align-middle">
												<p className="font-medium text-gray-900 dark:text-white">{agendamento.cliente?.nome || 'Cliente'}</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">ID: {agendamento.cliente?.client_id || agendamento.cliente_id || 'Desconhecido'}</p>
												{agendamento.conflito_horario && (
													<span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase animate-pulse">⚠ Conflito de horário</span>
												)}
											</td>
											<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle">
												{new Date(agendamento.data).toLocaleDateString('pt-BR')}
											</td>
											<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle">
												<div className="flex items-center gap-1">
													<Clock className="h-4 w-4 text-gray-400" />
													{agendamento.hora}
												</div>
											</td>
											<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle">{agendamento.duracao_minutos} min</td>
											<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate align-middle" title={agendamento.produto}>
												{agendamento.produto}
											</td>

											{/* Coluna Pagamento */}
											<td className="px-6 py-4 align-middle text-center">
												{agendamento.pagamento_status === 'aprovado' ? (
													<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
														<span className="w-2 h-2 rounded-full bg-emerald-500" /> Aprovado
													</span>
												) : agendamento.pagamento_status === 'em_analise' ? (
													<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
														<span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Em Análise
													</span>
												) : agendamento.pagamento_status === 'pendente' ? (
													<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
														<span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Pendente
													</span>
												) : agendamento.pagamento_status === 'recusado' ? (
													<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
														<span className="w-2 h-2 rounded-full bg-red-500" /> Recusado
													</span>
												) : agendamento.comprovante_url ? (
													<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
														<span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Enviado
													</span>
												) : (
													<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 dark:bg-neutral-700 dark:text-gray-400">
														<span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse-scale" /> Sem envio
													</span>
												)}
											</td>

											{/* Coluna Formulário */}
											<td className="px-6 py-4 align-middle text-center">
												{agendamento.cliente_is_user ? (
													<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
														<span className="w-2 h-2 rounded-full bg-emerald-500" /> Preenchido
													</span>
												) : isCancelled ? (
													<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
														<span className="w-2 h-2 rounded-full bg-red-500" /> Recusado
													</span>
												) : (
													<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
														<span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-scale" /> Pendente
													</span>
												)}
											</td>

											<td className="px-6 py-4 align-middle">
												<Badge variant={getStatusConfig(agendamento.status).variant}>
													{getStatusConfig(agendamento.status).label}
												</Badge>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{agendamentoSelecionado && (
				<GerenciamentoAgendamentoModal
					agendamento={agendamentoSelecionado}
					onClose={() => setAgendamentoSelecionado(null)}
					onAtualizado={() => {}}
				/>
			)}
		</div>
	)
}
