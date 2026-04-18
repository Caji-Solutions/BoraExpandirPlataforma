import { useMemo } from 'react'
import type { PeriodPreset, PeriodValue } from '../../types/supervisorMetrics'

interface Props {
    value: PeriodValue
    onChange: (next: PeriodValue) => void
}

const PRESETS: Array<{ key: PeriodPreset; label: string }> = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: 'Esta semana' },
    { key: 'mes', label: 'Este mês' },
    { key: 'ano', label: 'Este ano' },
    { key: 'custom', label: 'Custom' },
]

export function computePeriod(
    preset: PeriodPreset,
    customStart?: string,
    customEnd?: string
): { start: string; end: string } {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    if (preset === 'hoje') {
        return { start: startOfDay.toISOString(), end: endOfDay.toISOString() }
    }
    if (preset === 'semana') {
        const day = now.getDay() // 0 = domingo
        const diff = day === 0 ? 6 : day - 1
        const monday = new Date(startOfDay)
        monday.setDate(monday.getDate() - diff)
        return { start: monday.toISOString(), end: endOfDay.toISOString() }
    }
    if (preset === 'mes') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1)
        return { start: first.toISOString(), end: endOfDay.toISOString() }
    }
    if (preset === 'ano') {
        const first = new Date(now.getFullYear(), 0, 1)
        return { start: first.toISOString(), end: endOfDay.toISOString() }
    }
    return {
        start: customStart ? new Date(customStart).toISOString() : startOfDay.toISOString(),
        end: customEnd ? new Date(customEnd).toISOString() : endOfDay.toISOString(),
    }
}

export function PeriodFilter({ value, onChange }: Props) {
    const isCustom = value.preset === 'custom'

    const handlePreset = (preset: PeriodPreset) => {
        if (preset === 'custom') {
            onChange({ ...value, preset })
            return
        }
        const { start, end } = computePeriod(preset)
        onChange({ preset, start, end })
    }

    const handleCustomChange = (field: 'start' | 'end', val: string) => {
        if (!val) return
        const start = field === 'start' ? new Date(val).toISOString() : value.start
        const end = field === 'end' ? new Date(val).toISOString() : value.end
        onChange({ preset: 'custom', start, end })
    }

    const customStartDate = useMemo(() => value.start.slice(0, 10), [value.start])
    const customEndDate = useMemo(() => value.end.slice(0, 10), [value.end])

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1">
                {PRESETS.map((p) => (
                    <button
                        key={p.key}
                        type="button"
                        onClick={() => handlePreset(p.key)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            value.preset === p.key
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/70'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
            {isCustom && (
                <div className="flex items-center gap-2 ml-2">
                    <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => handleCustomChange('start', e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-muted-foreground">→</span>
                    <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => handleCustomChange('end', e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                    />
                </div>
            )}
        </div>
    )
}
