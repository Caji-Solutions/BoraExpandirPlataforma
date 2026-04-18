import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTeamMetrics } from '../../hooks/useSupervisorMetrics'
import { PeriodFilter, computePeriod } from '../../components/supervisor/PeriodFilter'
import { MetricsTeamSummary } from '../../components/supervisor/MetricsTeamSummary'
import { FuncionarioMetricsTable } from '../../components/supervisor/FuncionarioMetricsTable'
import { FuncionarioDetailsModal } from '../../components/supervisor/FuncionarioDetailsModal'
import type { PeriodValue } from '../../types/supervisorMetrics'

const EMPTY_KPIS = {
    totalLeads: 0,
    consultoriasAgendadas: 0,
    consultoriasRealizadas: 0,
    taxaComparecimento: 0,
    assessoriasFechadas: 0,
    ticketMedio: 0,
    faturamentoTotal: 0,
    comissaoTimeTotal: 0,
}

export default function SupervisorComercialPage() {
    const { activeProfile } = useAuth()
    const queryClient = useQueryClient()

    const [period, setPeriod] = useState<PeriodValue>(() => {
        const { start, end } = computePeriod('mes')
        return { preset: 'mes', start, end }
    })
    const [selectedFuncId, setSelectedFuncId] = useState<string | null>(null)

    const { data, isLoading, isFetching, error } = useTeamMetrics(period.start, period.end)

    if (!activeProfile) return null
    const isSupervisor =
        activeProfile.role === 'comercial' && activeProfile.is_supervisor === true
    if (!isSupervisor) return <Navigate to="/comercial" replace />

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['supervisor-team-metrics'] })
    }

    return (
        <div className="container max-w-7xl mx-auto p-4 space-y-5">
            <header className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Métricas do Time</h1>
                    <p className="text-sm text-muted-foreground">
                        Visão consolidada da performance dos seus delegados.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isFetching}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-card hover:bg-muted text-sm disabled:opacity-60"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Atualizar
                </button>
            </header>

            <PeriodFilter value={period} onChange={setPeriod} />

            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    Erro ao carregar métricas.{' '}
                    <button className="underline" onClick={handleRefresh}>
                        Tentar novamente
                    </button>
                </div>
            )}

            <MetricsTeamSummary
                kpis={data?.kpisTime ?? EMPTY_KPIS}
                loading={isLoading}
            />

            <FuncionarioMetricsTable
                funcionarios={data?.funcionarios ?? []}
                loading={isLoading}
                onSelect={setSelectedFuncId}
            />

            <FuncionarioDetailsModal
                funcionarioId={selectedFuncId}
                startDate={period.start}
                endDate={period.end}
                onClose={() => setSelectedFuncId(null)}
            />
        </div>
    )
}
