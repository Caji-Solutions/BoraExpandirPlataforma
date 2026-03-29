/**
 * Utilitários de data/hora com comportamento fixo em America/Sao_Paulo.
 * Regra:
 * - Sem timezone (sem Z/offset): interpretar como horário BRT.
 * - Com timezone explícito: converter para BRT na exibição.
 */

const BRT_TIME_ZONE = 'America/Sao_Paulo'
const TZ_SUFFIX_REGEX = /(Z|[+-]\d{2}:\d{2})$/i
const ISO_NO_TZ_REGEX = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/

function hasExplicitTimezone(dateStr: string): boolean {
    return TZ_SUFFIX_REGEX.test(dateStr)
}

function parseNoTimezoneAsBrt(dateStr: string): Date | null {
    const match = dateStr.match(ISO_NO_TZ_REGEX)
    if (!match) return null

    const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw, secondRaw, milliRaw] = match
    const year = Number(yearRaw)
    const month = Number(monthRaw)
    const day = Number(dayRaw)
    const hour = Number(hourRaw || '0')
    const minute = Number(minuteRaw || '0')
    const second = Number(secondRaw || '0')
    const millisecond = Number((milliRaw || '0').padEnd(3, '0'))

    if ([year, month, day, hour, minute, second, millisecond].some(Number.isNaN)) {
        return null
    }

    // BRT (UTC-3) -> UTC (+3h) para representar o instante corretamente
    return new Date(Date.UTC(year, month - 1, day, hour + 3, minute, second, millisecond))
}

function getBrtDateParts(date: Date): { year: string; month: string; day: string } {
    const parts = new Intl.DateTimeFormat('pt-BR', {
        timeZone: BRT_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date)

    const year = parts.find((part) => part.type === 'year')?.value || '0000'
    const month = parts.find((part) => part.type === 'month')?.value || '00'
    const day = parts.find((part) => part.type === 'day')?.value || '00'

    return { year, month, day }
}

function getBrtTimeParts(date: Date): { hour: string; minute: string } {
    const parts = new Intl.DateTimeFormat('pt-BR', {
        timeZone: BRT_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).formatToParts(date)

    const hour = parts.find((part) => part.type === 'hour')?.value || '00'
    const minute = parts.find((part) => part.type === 'minute')?.value || '00'

    return { hour, minute }
}

export function parseBackendDate(dateStr: string | Date): Date {
    if (!dateStr) return new Date()
    if (dateStr instanceof Date) return dateStr

    if (!hasExplicitTimezone(dateStr)) {
        const parsed = parseNoTimezoneAsBrt(dateStr)
        if (parsed) return parsed
        return new Date(`${dateStr}-03:00`)
    }

    return new Date(dateStr)
}

export function getBrtDateKey(dateStr: string | Date): string {
    if (typeof dateStr === 'string' && !hasExplicitTimezone(dateStr)) {
        const match = dateStr.match(ISO_NO_TZ_REGEX)
        if (match) {
            const [, year, month, day] = match
            return `${year}-${month}-${day}`
        }
    }

    const dt = parseBackendDate(dateStr)
    const { year, month, day } = getBrtDateParts(dt)
    return `${year}-${month}-${day}`
}

export function getBrtHhMm(dateStr: string | Date): string {
    if (typeof dateStr === 'string' && !hasExplicitTimezone(dateStr)) {
        const match = dateStr.match(ISO_NO_TZ_REGEX)
        if (match) {
            const hour = (match[4] || '00').padStart(2, '0')
            const minute = (match[5] || '00').padStart(2, '0')
            return `${hour}:${minute}`
        }
    }

    const dt = parseBackendDate(dateStr)
    const { hour, minute } = getBrtTimeParts(dt)
    return `${hour}:${minute}`
}

export function formatDataHora(dateStr: string | Date): string {
    if (!dateStr) return '—'
    try {
        const dataStr = getBrtDateKey(dateStr)
        const horaStr = getBrtHhMm(dateStr)
        const [year, month, day] = dataStr.split('-')
        return `${day}/${month}/${year} às ${horaStr}`
    } catch {
        return String(dateStr)
    }
}

export function formatHoraOnly(dateStr: string | Date): string {
    if (!dateStr) return '—'
    try {
        return getBrtHhMm(dateStr)
    } catch {
        return String(dateStr)
    }
}

export function extractLocalTimeMapping(rawDate: string | undefined | null): { dataStr: string, horaStr: string } {
    const source = rawDate || new Date()
    return {
        dataStr: getBrtDateKey(source),
        horaStr: getBrtHhMm(source)
    }
}

