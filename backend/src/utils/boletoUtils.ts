export type MetodoPagamento = 'pix' | 'boleto' | 'wise'

function pad2(value: number): string {
    return String(value).padStart(2, '0')
}

function getBrtDateParts(dateInput: string | Date): { year: number; month: number; day: number } {
    const date = new Date(dateInput)
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })

    const parts = fmt.formatToParts(date)
    const year = Number(parts.find(p => p.type === 'year')?.value || '0')
    const month = Number(parts.find(p => p.type === 'month')?.value || '1')
    const day = Number(parts.find(p => p.type === 'day')?.value || '1')

    return { year, month, day }
}

function getLastDayOfMonth(year: number, monthIndex: number): number {
    return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

export function normalizeMetodoPagamento(value: any): MetodoPagamento {
    const normalized = String(value || '').toLowerCase()
    if (normalized === 'boleto') return 'boleto'
    if (normalized === 'wise') return 'wise'
    return 'pix'
}

export function clampQuantidadeParcelas(value: any): number {
    const num = Number(value)
    if (!Number.isFinite(num)) return 0
    return Math.max(0, Math.min(3, Math.trunc(num)))
}

export function parseMoneyInput(value: any): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Number(value.toFixed(2))
    }

    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    if (!trimmed) return null

    let normalized = trimmed.replace(/[^\d,.\-]/g, '')
    const lastComma = normalized.lastIndexOf(',')
    const lastDot = normalized.lastIndexOf('.')

    if (lastComma > -1 && lastDot > -1) {
        if (lastComma > lastDot) {
            normalized = normalized.replace(/\./g, '').replace(',', '.')
        } else {
            normalized = normalized.replace(/,/g, '')
        }
    } else if (lastComma > -1) {
        normalized = normalized.replace(',', '.')
    }

    const parsed = Number.parseFloat(normalized)
    if (!Number.isFinite(parsed)) return null
    return Number(parsed.toFixed(2))
}

export function getAnchorDayFromDate(baseDate: string | Date): number {
    const { day } = getBrtDateParts(baseDate)
    return Math.max(1, Math.min(31, day))
}

/**
 * Calcula vencimento mensal preservando o dia-âncora:
 * Ex.: ancora 31 => fevereiro vira 28/29, março volta 31.
 */
export function calcularDataVencimentoBoleto(baseDate: string | Date, monthOffset: number, anchorDay?: number): string {
    const { year, month, day } = getBrtDateParts(baseDate)
    const anchor = Math.max(1, Math.min(31, anchorDay || day))

    const targetMonthZeroBased = (month - 1) + monthOffset
    const targetYear = year + Math.floor(targetMonthZeroBased / 12)
    const targetMonthIndex = ((targetMonthZeroBased % 12) + 12) % 12
    const lastDay = getLastDayOfMonth(targetYear, targetMonthIndex)
    const targetDay = Math.min(anchor, lastDay)

    return `${targetYear}-${pad2(targetMonthIndex + 1)}-${pad2(targetDay)}`
}

export function isOverdueDate(vencimentoDate: string, now = new Date()): boolean {
    const hojeBrt = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now)

    return vencimentoDate <= hojeBrt
}
