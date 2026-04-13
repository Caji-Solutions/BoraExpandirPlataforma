/**
 * Testes unitarios: parsing de titulares adicionais no AssessoriaJuridica.
 *
 * A logica de parse do campo draft_dados.titularesAdicionais e isolada
 * aqui para cobrir os cenarios de entrada sem montar o componente completo.
 */

import { describe, it, expect } from 'vitest';

// Replica a logica de parse do AssessoriaJuridica para teste isolado.
// Se a logica mudar no componente, esse teste deve ser atualizado tambem.
function parseTitularesAdicionais(rawTitulares: unknown): { nome: string; documento?: string }[] {
    let parsedTitulares: any[] = [];

    if (rawTitulares === undefined || rawTitulares === null) {
        parsedTitulares = [];
    } else if (typeof rawTitulares === 'string') {
        try {
            parsedTitulares = JSON.parse(rawTitulares);
        } catch {
            parsedTitulares = [];
        }
    } else if (Array.isArray(rawTitulares)) {
        parsedTitulares = rawTitulares;
    }

    return parsedTitulares
        .map((t: any) => ({
            nome: t.nome || t.nome_completo || '',
            documento: t.documento || t.cpf || undefined
        }))
        .filter((t: any) => t.nome);
}

describe('AssessoriaJuridica - parseTitularesAdicionais', () => {
    it('retorna array com itens quando input e array valido', () => {
        const input = [
            { nome: 'Ana Silva', documento: '111.222.333-44' },
            { nome: 'Carlos Souza' }
        ];
        const result = parseTitularesAdicionais(input);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ nome: 'Ana Silva', documento: '111.222.333-44' });
        expect(result[1]).toEqual({ nome: 'Carlos Souza', documento: undefined });
    });

    it('aceita nome_completo como campo alternativo a nome', () => {
        const input = [{ nome_completo: 'Maria Santos', cpf: '999.888.777-66' }];
        const result = parseTitularesAdicionais(input);
        expect(result).toHaveLength(1);
        expect(result[0].nome).toBe('Maria Santos');
        expect(result[0].documento).toBe('999.888.777-66');
    });

    it('aceita cpf como campo alternativo a documento', () => {
        const input = [{ nome: 'Pedro', cpf: '123.456.789-00' }];
        const result = parseTitularesAdicionais(input);
        expect(result[0].documento).toBe('123.456.789-00');
    });

    it('filtra itens sem nome', () => {
        const input = [
            { nome: '', documento: '123' },
            { nome: 'Valido' }
        ];
        const result = parseTitularesAdicionais(input);
        expect(result).toHaveLength(1);
        expect(result[0].nome).toBe('Valido');
    });

    it('retorna array vazio quando input e string JSON valida com array vazio', () => {
        const result = parseTitularesAdicionais('[]');
        expect(result).toEqual([]);
    });

    it('retorna array quando input e string JSON valida com titulares', () => {
        const jsonStr = JSON.stringify([{ nome: 'Titular JSON', documento: '000.111.222-33' }]);
        const result = parseTitularesAdicionais(jsonStr);
        expect(result).toHaveLength(1);
        expect(result[0].nome).toBe('Titular JSON');
    });

    it('retorna array vazio quando input e string JSON invalida', () => {
        const result = parseTitularesAdicionais('nao-e-json{');
        expect(result).toEqual([]);
    });

    it('retorna array vazio quando input e undefined', () => {
        const result = parseTitularesAdicionais(undefined);
        expect(result).toEqual([]);
    });

    it('retorna array vazio quando input e null', () => {
        const result = parseTitularesAdicionais(null);
        expect(result).toEqual([]);
    });

    it('retorna array vazio quando input e array vazio', () => {
        const result = parseTitularesAdicionais([]);
        expect(result).toEqual([]);
    });
});
