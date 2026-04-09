import { describe, it, expect } from 'vitest';
import { normalizeMetodoPagamento } from '../boletoUtils';

describe('normalizeMetodoPagamento', () => {

    it('deve retornar "pix" para input "pix"', () => {
        expect(normalizeMetodoPagamento('pix')).toBe('pix');
    });

    it('deve retornar "boleto" para input "boleto"', () => {
        expect(normalizeMetodoPagamento('boleto')).toBe('boleto');
    });

    it('deve retornar "wise" para input "wise"', () => {
        expect(normalizeMetodoPagamento('wise')).toBe('wise');
    });

    it('deve ser case-insensitive para "WISE"', () => {
        expect(normalizeMetodoPagamento('WISE')).toBe('wise');
    });

    it('deve ser case-insensitive para "Boleto"', () => {
        expect(normalizeMetodoPagamento('Boleto')).toBe('boleto');
    });

    it('deve ser case-insensitive para "PIX"', () => {
        expect(normalizeMetodoPagamento('PIX')).toBe('pix');
    });

    it('deve retornar "pix" para valor desconhecido', () => {
        expect(normalizeMetodoPagamento('cartao')).toBe('pix');
        expect(normalizeMetodoPagamento('transferencia')).toBe('pix');
        expect(normalizeMetodoPagamento('dinheiro')).toBe('pix');
    });

    it('deve retornar "pix" para null', () => {
        expect(normalizeMetodoPagamento(null)).toBe('pix');
    });

    it('deve retornar "pix" para undefined', () => {
        expect(normalizeMetodoPagamento(undefined)).toBe('pix');
    });

    it('deve retornar "pix" para string vazia', () => {
        expect(normalizeMetodoPagamento('')).toBe('pix');
    });

    it('deve retornar "pix" para numero', () => {
        expect(normalizeMetodoPagamento(123)).toBe('pix');
    });

    it('deve retornar "pix" para boolean', () => {
        expect(normalizeMetodoPagamento(true)).toBe('pix');
        expect(normalizeMetodoPagamento(false)).toBe('pix');
    });
});
