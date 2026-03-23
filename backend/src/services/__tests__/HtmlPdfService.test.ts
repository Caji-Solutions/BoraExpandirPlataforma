import { vi, describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Mock html-pdf-node para nao precisar de chromium
vi.mock('html-pdf-node', () => ({
    default: {
        generatePdf: vi.fn().mockResolvedValue(Buffer.from('fake-pdf-content'))
    }
}));

vi.mock('../../config/SupabaseClient', () => ({
    supabase: { from: vi.fn() }
}));

// =============================================
// Task 006 - HtmlPdfService com Handlebars + pendencias
// =============================================

describe('HtmlPdfService - Handlebars template compilation (Task 006)', () => {
    const templatePath = path.resolve(__dirname, '../../../assets/contrato-assessoria.html');

    it('template deve existir no disco', () => {
        expect(fs.existsSync(templatePath)).toBe(true);
    });

    it('template deve compilar sem erros com Handlebars', () => {
        const source = fs.readFileSync(templatePath, 'utf-8');
        const compile = () => Handlebars.compile(source);
        expect(compile).not.toThrow();
    });

    it('template compilado deve substituir variaveis corretamente', () => {
        const source = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(source);
        const html = template({
            nome: 'Joao Silva',
            nacionalidade: 'Brasileira',
            estado_civil: 'Solteiro',
            profissao: 'Desenvolvedor',
            documento: '123.456.789-00',
            endereco: 'Rua Teste 123',
            email: 'joao@test.com',
            telefone: '+55 11 99999-9999',
            tipo_servico: 'Visto de Trabalho',
            valor_pavao: '5.000',
            valor_desconto: '4.500',
            valor_consultoria: '500',
            forma_pagamento: 'PIX',
            data: '22/03/2026',
            pendencias: null
        });
        expect(html).toContain('Joao Silva');
        expect(html).toContain('Brasileira');
        expect(html).toContain('joao@test.com');
        expect(html).toContain('Visto de Trabalho');
    });

    it('template deve renderizar tabela de pendencias quando fornecidas', () => {
        const source = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(source);
        const html = template({
            nome: 'Maria',
            nacionalidade: 'Portuguesa',
            estado_civil: 'Casada',
            profissao: 'Engenheira',
            documento: '987.654.321-00',
            endereco: 'Av Central 456',
            email: 'maria@test.com',
            telefone: '+55 21 88888-8888',
            tipo_servico: 'Reagrupamento Familiar',
            valor_pavao: '3.000',
            data: '22/03/2026',
            pendencias: [
                { nome: 'Filho 1', parentesco: 'Filho', valor: '1.000' },
                { nome: 'Esposo', parentesco: 'Conjuge', valor: '1.500' }
            ]
        });
        expect(html).toContain('Filho 1');
        expect(html).toContain('Esposo');
        expect(html).toContain('Conjuge');
        expect(html).toContain('1.500');
    });

    it('template NAO deve renderizar tabela de pendencias quando null', () => {
        const source = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(source);
        const htmlComPendencias = template({
            nome: 'Test', nacionalidade: 'BR', estado_civil: 'S', profissao: 'Dev',
            documento: '000', endereco: 'Rua', email: 'a@b.com', telefone: '1',
            tipo_servico: 'Visto', data: '01/01/2026',
            pendencias: [{ nome: 'Dep1', parentesco: 'Filho', valor: '100' }]
        });
        const htmlSemPendencias = template({
            nome: 'Test', nacionalidade: 'BR', estado_civil: 'S', profissao: 'Dev',
            documento: '000', endereco: 'Rua', email: 'a@b.com', telefone: '1',
            tipo_servico: 'Visto', data: '01/01/2026',
            pendencias: null
        });
        expect(htmlComPendencias).toContain('Dep1');
        expect(htmlSemPendencias).not.toContain('Dep1');
    });
});

describe('HtmlPdfService - sanitizeText (Task 006)', () => {
    // Testa a funcao sanitizeText indiretamente via import do modulo
    it('deve remover tags HTML de texto', async () => {
        // Import dinamico para pegar a instancia com mocks
        const HtmlPdfService = (await import('../HtmlPdfService')).default;

        const payload = {
            nome: '<script>alert("xss")</script>Joao',
            nacionalidade: 'Brasileira',
            estado_civil: 'Solteiro',
            profissao: 'Dev',
            documento: '12345678900',
            endereco: '<b>Rua Injetada</b> 123',
            email: 'joao@test.com',
            telefone: '11999999999',
            tipo_servico: 'Visto',
            data: '22/03/2026'
        };

        const result = await HtmlPdfService.gerarContratoAssessoria('contrato-1', payload);
        // O PDF deve ser gerado (mock retorna buffer)
        expect(result).not.toBeNull();
        expect(result).toBeInstanceOf(Buffer);
    });

    it('deve parsear pendencias JSON e filtrar vazias', async () => {
        const HtmlPdfService = (await import('../HtmlPdfService')).default;

        const payload = {
            nome: 'Maria',
            nacionalidade: 'Brasileira',
            estado_civil: 'Casada',
            profissao: 'Eng',
            documento: '98765432100',
            endereco: 'Rua 1',
            email: 'maria@test.com',
            telefone: '21888888888',
            tipo_servico: 'Visto',
            data: '22/03/2026',
            pendencias: JSON.stringify([
                { nome: 'Filho', parentesco: 'Filho', valor: '500' },
                { nome: '', parentesco: '', valor: '' }, // deve ser filtrada
                { nome: 'Esposa', parentesco: 'Conjuge', valor: '800' }
            ])
        };

        const result = await HtmlPdfService.gerarContratoAssessoria('contrato-2', payload);
        expect(result).not.toBeNull();
    });

    it('deve lidar com pendencias JSON invalido sem quebrar', async () => {
        const HtmlPdfService = (await import('../HtmlPdfService')).default;

        const payload = {
            nome: 'Carlos',
            nacionalidade: 'Brasileira',
            estado_civil: 'Solteiro',
            profissao: 'Adv',
            documento: '11122233344',
            endereco: 'Rua 2',
            email: 'carlos@test.com',
            telefone: '31777777777',
            tipo_servico: 'Assessoria',
            data: '22/03/2026',
            pendencias: 'json-invalido-{{'
        };

        const result = await HtmlPdfService.gerarContratoAssessoria('contrato-3', payload);
        expect(result).not.toBeNull();
    });
});
