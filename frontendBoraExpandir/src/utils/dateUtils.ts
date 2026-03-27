/**
 * Utilitário para lidar com as datas do sistema que estão no fuso horário de Brasília.
 * O backend envia strings pre-formatadas sem 'Z' para blindar offsets automáticos no browser.
 */

export function parseBackendDate(dateStr: string | Date): Date {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string') {
        // Se vier com Z (UTC), JavaScript interpreta automaticamente e converte para local
        // Se vier sem Z, assume que é uma string que já foi convertida para BRT no frontend
        return new Date(dateStr);
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
