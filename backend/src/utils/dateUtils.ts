export function toUtcFromBrt(dateStr: string): string {
    if (!dateStr) return dateStr;
    // Remove qualquer Z ou indicativo de timezone existente para forçar a leitura cega
    // Pega apenas a parte YYYY-MM-DDTHH:mm:ss 
    const clean = dateStr.replace('Z', '').substring(0, 19);
    // Assume que a string de entrada está em America/Sao_Paulo (UTC-3)
    return `${clean}-03:00`;
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
