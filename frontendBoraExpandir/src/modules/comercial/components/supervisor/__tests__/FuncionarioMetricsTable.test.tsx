import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FuncionarioMetricsTable } from '../FuncionarioMetricsTable'
import type { FuncionarioMetricas } from '../../../types/supervisorMetrics'

const baseFunc: FuncionarioMetricas = {
    id: '',
    nome: '',
    nivel: 'C1',
    leadsCriados: 0,
    consultoriasAgendadas: 0,
    consultoriasRealizadas: 0,
    taxaComparecimento: 0,
    taxaConversaoLeadConsultoria: 0,
    assessoriasIniciadas: null,
    assessoriasFechadas: null,
    taxaConversaoConsultoriaAssessoria: null,
    ticketMedio: null,
    faturamentoGerado: null,
    comissaoAcumulada: 0,
    ranking: 0,
}

describe('FuncionarioMetricsTable', () => {
    it('mostra empty state quando lista vazia', () => {
        render(<FuncionarioMetricsTable funcionarios={[]} onSelect={() => {}} />)
        expect(screen.getByText(/Nenhum funcionário/)).toBeInTheDocument()
    })

    it('agrupa por C1 e C2 e mostra os títulos', () => {
        const funcs: FuncionarioMetricas[] = [
            { ...baseFunc, id: '1', nome: 'C1-A', nivel: 'C1' },
            {
                ...baseFunc,
                id: '2',
                nome: 'C2-A',
                nivel: 'C2',
                assessoriasFechadas: 1,
                faturamentoGerado: 100,
            },
        ]
        render(<FuncionarioMetricsTable funcionarios={funcs} onSelect={() => {}} />)
        expect(screen.getByText(/C2 — Closer/)).toBeInTheDocument()
        expect(screen.getByText(/C1 — Hunter/)).toBeInTheDocument()
        expect(screen.getByText('C1-A')).toBeInTheDocument()
        expect(screen.getByText('C2-A')).toBeInTheDocument()
    })

    it('chama onSelect com id ao clicar na linha', () => {
        const onSelect = vi.fn()
        render(
            <FuncionarioMetricsTable
                funcionarios={[{ ...baseFunc, id: 'abc', nome: 'X' }]}
                onSelect={onSelect}
            />
        )
        fireEvent.click(screen.getByText('X'))
        expect(onSelect).toHaveBeenCalledWith('abc')
    })
})
