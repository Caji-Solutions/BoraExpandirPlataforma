export function toUtcFromBrt(dateStr: string): string {
    if (!dateStr) return dateStr;
    // Extrai componentes diretamente da string para evitar interpretação de timezone pelo runtime.
    // new Date("YYYY-MM-DDTHH:mm:ss") sem sufixo é lido como horário LOCAL do servidor,
    // o que causaria dupla-conversão em servidores rodando em BRT.
    const clean = dateStr.replace('Z', '').substring(0, 19);
    const [datePart, timePart = '00:00:00'] = clean.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, sec = 0] = timePart.split(':').map(Number);
    // BRT = UTC-3: soma 3 horas para obter UTC
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour + 3, minute, sec));
    return utcDate.toISOString();
}

export function toBrtFromUtc(dateObjOrStr: string | Date | null | undefined): string | null {
    if (!dateObjOrStr) return null;
    const date = new Date(dateObjOrStr);
    
    // Fallback se não for uma data válida
    if (isNaN(date.getTime())) {
        if (typeof dateObjOrStr === 'string') return dateObjOrStr;
        return null;
    }
    
    // Converte para Fuso de São Paulo usando Intl.
    // Locale sv-SE retorna "YYYY-MM-DD HH:mm:ss", o que é similar ao ISO 8601 sem T
    const brtString = date.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    
    // Retorna "YYYY-MM-DDTHH:mm:ss"
    return brtString.replace(' ', 'T'); 
}
