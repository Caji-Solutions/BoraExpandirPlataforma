import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PeriodFilter, computePeriod } from '../PeriodFilter'

describe('PeriodFilter', () => {
    it('renderiza todos os presets', () => {
        const { start, end } = computePeriod('mes')
        render(<PeriodFilter value={{ preset: 'mes', start, end }} onChange={() => {}} />)
        expect(screen.getByText('Hoje')).toBeInTheDocument()
        expect(screen.getByText('Esta semana')).toBeInTheDocument()
        expect(screen.getByText('Este mês')).toBeInTheDocument()
        expect(screen.getByText('Este ano')).toBeInTheDocument()
        expect(screen.getByText('Custom')).toBeInTheDocument()
    })

    it('chama onChange com novo período ao clicar em preset', () => {
        const onChange = vi.fn()
        const { start, end } = computePeriod('mes')
        render(<PeriodFilter value={{ preset: 'mes', start, end }} onChange={onChange} />)
        fireEvent.click(screen.getByText('Hoje'))
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ preset: 'hoje' })
        )
    })

    it('exibe inputs de data quando preset = custom', () => {
        const { start, end } = computePeriod('mes')
        render(
            <PeriodFilter value={{ preset: 'custom', start, end }} onChange={() => {}} />
        )
        const inputs = document.querySelectorAll('input[type=date]')
        expect(inputs.length).toBe(2)
    })
})
