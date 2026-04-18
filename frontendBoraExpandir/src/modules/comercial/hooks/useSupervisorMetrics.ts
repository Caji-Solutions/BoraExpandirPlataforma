import { useQuery } from '@tanstack/react-query'
import {
    getSupervisorTeamMetrics,
    getSupervisorFuncionarioDetalhes,
} from '../services/comercialService'

export function useTeamMetrics(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ['supervisor-team-metrics', startDate, endDate],
        queryFn: () => getSupervisorTeamMetrics(startDate, endDate),
        staleTime: 60_000,
        enabled: !!startDate && !!endDate,
    })
}

export function useFuncionarioDetails(
    funcionarioId: string | null,
    startDate: string,
    endDate: string
) {
    return useQuery({
        queryKey: ['supervisor-funcionario-details', funcionarioId, startDate, endDate],
        queryFn: () =>
            getSupervisorFuncionarioDetalhes(funcionarioId as string, startDate, endDate),
        staleTime: 60_000,
        enabled: !!funcionarioId && !!startDate && !!endDate,
    })
}
