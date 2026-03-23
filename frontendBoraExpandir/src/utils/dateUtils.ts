/**
 * Utilitário para lidar com as datas do sistema que estão no fuso horário de Brasília.
 * O backend envia strings pre-formatadas sem 'Z' para blindar offsets automáticos no browser.
 */

export function parseBackendDate(dateStr: string | Date): Date {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string') {
        // Limpamos o Z ou offsets se existirem (fallback) para forçar leitura como local time nominais
        const cleanStr = dateStr.replace('Z', '').split('-')[0].length === 4 ? dateStr.substring(0, 19) : dateStr;
        return new Date(cleanStr);
    }
    return new Date(dateStr);
}

export function formatDataHora(dateStr: string | Date): string {
    if (!dateStr) return '—';
    try {
        const dt = parseBackendDate(dateStr);
        return `${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
        return String(dateStr);
    }
}

export function formatHoraOnly(dateStr: string | Date): string {
    if (!dateStr) return '—';
    try {
        const dt = parseBackendDate(dateStr);
        return dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return String(dateStr);
    }
}
