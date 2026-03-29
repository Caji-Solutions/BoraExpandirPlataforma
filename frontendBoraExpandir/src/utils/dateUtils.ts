/**
 * Utilitário para lidar com as datas do sistema que estão no fuso horário de Brasília.
 * O backend envia strings pre-formatadas sem 'Z' para blindar offsets automáticos no browser.
 */

export function parseBackendDate(dateStr: string | Date): Date {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string') {
        // Se vier com Z (UTC), JavaScript interpreta automaticamente e converte para local
        // Se vier sem Z, assume que é uma string já em BRT — trata como horário local
        // (auto-consistente com os slots de horário que também usam horário local)
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

/**
 * Função testável para extrair de forma estrita Date e Time forçando leitura UTC (caso ausente) 
 * e saída local cravada no timezone 'America/Sao_Paulo', evitando offsets por relógios do sistema host.
 */
export function extractLocalTimeMapping(rawDate: string | undefined | null): { dataStr: string, horaStr: string } {
    let dateStr = rawDate || '';
    if (dateStr && !dateStr.includes('Z') && !dateStr.match(/[+-]\d\d:\d\d$/)) {
        dateStr += 'Z';
    }
    const dataHora = dateStr ? new Date(dateStr) : new Date();

    const optsDate: Intl.DateTimeFormatOptions = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
    const baseDateStr = dataHora.toLocaleDateString('pt-BR', optsDate);
    const dataStrResult = baseDateStr.split('/').reverse().join('-');
    const horaStr = dataHora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });

    return { dataStr: dataStrResult, horaStr };
}

