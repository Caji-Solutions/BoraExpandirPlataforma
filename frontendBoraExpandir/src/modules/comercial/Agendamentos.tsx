import React, { useMemo, useState } from 'react'
import { Calendar, Clock, Filter, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Agendamento } from '../../types/comercial'
import { Badge } from '../../components/ui/Badge'

const statusConfig: Record<Agendamento['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; label: string }> = {
	agendado: {
		variant: 'success',
		label: 'Agendado',
	},
	realizado: {
		variant: 'default',
		label: 'Realizado',
	},
	cancelado: {
		variant: 'destructive',
		label: 'Cancelado',
	},
}

interface AgendamentosPageProps {
	agendamentos: Agendamento[]
}

export default function AgendamentosPage({ agendamentos }: AgendamentosPageProps) {
	const navigate = useNavigate()
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<'todos' | Agendamento['status']>('todos')

	const filtered = useMemo(() => {
		return agendamentos
			.filter(a => (status === 'todos' ? true : a.status === status))
			.filter(a => {
				if (!search.trim()) return true
				const term = search.toLowerCase()
				return (
					a.cliente?.nome.toLowerCase().includes(term) ||
					a.produto.toLowerCase().includes(term) ||
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
				<div className="flex gap-2">
					<button
						onClick={() => navigate('/comercial/agendamento')}
						className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
					>
						Novo agendamento
					</button>
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
							<option value="realizado">Realizados</option>
							<option value="cancelado">Cancelados</option>
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
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
								{filtered.map(agendamento => (
									<tr key={agendamento.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
										<td className="px-6 py-4">
											<p className="font-medium text-gray-900 dark:text-white">{agendamento.cliente?.nome || 'Cliente'}</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">ID: {agendamento.id}</p>
										</td>
										<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
											{new Date(agendamento.data).toLocaleDateString('pt-BR')}
										</td>
										<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
											<Clock className="h-4 w-4 text-gray-400" />
											{agendamento.hora}
										</td>
										<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{agendamento.duracao_minutos} min</td>
										<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={agendamento.produto}>
											{agendamento.produto}
										</td>
										<td className="px-6 py-4">
											<Badge variant={statusConfig[agendamento.status].variant}>
												{statusConfig[agendamento.status].label}
											</Badge>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}
