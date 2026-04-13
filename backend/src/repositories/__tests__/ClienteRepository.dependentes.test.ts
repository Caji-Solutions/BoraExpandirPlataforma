import { vi, describe, it, expect, beforeEach } from 'vitest';
import ClienteRepository from '../ClienteRepository';
import { supabase } from '../../config/SupabaseClient';

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}));

function mockSupabaseInsert(resolvedValue: { data: any; error: any }) {
    const mockSingle = vi.fn().mockResolvedValue(resolvedValue);
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    (supabase.from as any).mockReturnValue({ insert: mockInsert });
    return { mockInsert, mockSelect, mockSingle };
}

function mockSupabaseSelect(resolvedValue: { data: any; error: any }) {
    const mockOrder = vi.fn().mockResolvedValue(resolvedValue);
    const mockEqTipo = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEqCliente = vi.fn().mockReturnValue({ eq: mockEqTipo });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEqCliente });
    (supabase.from as any).mockReturnValue({ select: mockSelect });
    return { mockSelect, mockEqCliente, mockEqTipo, mockOrder };
}

describe('ClienteRepository - createDependent (parentesco como texto)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve salvar parentesco como texto livre sem normalizacao', async () => {
        const mockData = {
            id: 'dep-1',
            cliente_id: 'cli-1',
            nome_completo: 'Maria Silva',
            parentesco: 'Tutor Legal',
            status: 'ativo'
        };
        const { mockInsert } = mockSupabaseInsert({ data: mockData, error: null });

        const result = await ClienteRepository.createDependent({
            clienteId: 'cli-1',
            nomeCompleto: 'Maria Silva',
            parentesco: 'Tutor Legal'
        });

        expect(result).toEqual(mockData);
        const insertedRecord = mockInsert.mock.calls[0][0][0];
        expect(insertedRecord.parentesco).toBe('Tutor Legal');
    });

    it('deve omitir parentesco quando valor e string vazia', async () => {
        const mockData = {
            id: 'dep-2',
            cliente_id: 'cli-1',
            nome_completo: 'Joao Silva',
            status: 'ativo'
        };
        mockSupabaseInsert({ data: mockData, error: null });

        await ClienteRepository.createDependent({
            clienteId: 'cli-1',
            nomeCompleto: 'Joao Silva',
            parentesco: ''
        });

        const insertedRecord = (supabase.from as any).mock.results[0].value.insert.mock.calls[0][0][0];
        expect(insertedRecord).not.toHaveProperty('parentesco');
    });

    it('deve omitir parentesco quando valor e apenas espacos', async () => {
        const mockData = { id: 'dep-3', cliente_id: 'cli-1', nome_completo: 'Ana', status: 'ativo' };
        mockSupabaseInsert({ data: mockData, error: null });

        await ClienteRepository.createDependent({
            clienteId: 'cli-1',
            nomeCompleto: 'Ana',
            parentesco: '   '
        });

        const insertedRecord = (supabase.from as any).mock.results[0].value.insert.mock.calls[0][0][0];
        expect(insertedRecord).not.toHaveProperty('parentesco');
    });

    it('deve salvar parentesco padrao (ex: "filho") como texto simples', async () => {
        const mockData = {
            id: 'dep-4',
            cliente_id: 'cli-1',
            nome_completo: 'Pedro',
            parentesco: 'filho',
            status: 'ativo'
        };
        const { mockInsert } = mockSupabaseInsert({ data: mockData, error: null });

        await ClienteRepository.createDependent({
            clienteId: 'cli-1',
            nomeCompleto: 'Pedro',
            parentesco: 'filho'
        });

        const insertedRecord = mockInsert.mock.calls[0][0][0];
        expect(insertedRecord.parentesco).toBe('filho');
    });

    it('deve salvar parentesco customizado com acentos sem normalizar', async () => {
        const mockData = {
            id: 'dep-5',
            cliente_id: 'cli-1',
            nome_completo: 'Carlos',
            parentesco: 'Guardião',
            status: 'ativo'
        };
        const { mockInsert } = mockSupabaseInsert({ data: mockData, error: null });

        await ClienteRepository.createDependent({
            clienteId: 'cli-1',
            nomeCompleto: 'Carlos',
            parentesco: 'Guardião'
        });

        const insertedRecord = mockInsert.mock.calls[0][0][0];
        expect(insertedRecord.parentesco).toBe('Guardião');
    });

    it('deve propagar erro do Supabase', async () => {
        mockSupabaseInsert({ data: null, error: { message: 'insert failed' } });

        await expect(
            ClienteRepository.createDependent({
                clienteId: 'cli-1',
                nomeCompleto: 'Erro Test'
            })
        ).rejects.toEqual({ message: 'insert failed' });
    });

    it('deve omitir parentesco quando undefined', async () => {
        const mockData = { id: 'dep-6', cliente_id: 'cli-1', nome_completo: 'Sem Parentesco', status: 'ativo' };
        mockSupabaseInsert({ data: mockData, error: null });

        await ClienteRepository.createDependent({
            clienteId: 'cli-1',
            nomeCompleto: 'Sem Parentesco'
        });

        const insertedRecord = (supabase.from as any).mock.results[0].value.insert.mock.calls[0][0][0];
        expect(insertedRecord).not.toHaveProperty('parentesco');
    });
});

describe('ClienteRepository - tipo discriminador (dependente vs titular_adicional)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve inserir tipo = "dependente" por padrao quando tipo nao e passado', async () => {
        const mockData = { id: 'dep-10', cliente_id: 'cli-1', nome_completo: 'Padrao', tipo: 'dependente', status: 'ativo' };
        const { mockInsert } = mockSupabaseInsert({ data: mockData, error: null });

        await ClienteRepository.createDependent({ clienteId: 'cli-1', nomeCompleto: 'Padrao' });

        const record = mockInsert.mock.calls[0][0][0];
        expect(record.tipo).toBe('dependente');
    });

    it('deve inserir tipo = "titular_adicional" quando explicitamente passado', async () => {
        const mockData = { id: 'dep-11', cliente_id: 'cli-1', nome_completo: 'Titular', tipo: 'titular_adicional', status: 'ativo' };
        const { mockInsert } = mockSupabaseInsert({ data: mockData, error: null });

        await ClienteRepository.createDependent({
            clienteId: 'cli-1',
            nomeCompleto: 'Titular',
            tipo: 'titular_adicional'
        });

        const record = mockInsert.mock.calls[0][0][0];
        expect(record.tipo).toBe('titular_adicional');
    });

    it('deve inserir tipo = "dependente" quando passado explicitamente', async () => {
        const mockData = { id: 'dep-12', cliente_id: 'cli-1', nome_completo: 'Dep Explicito', tipo: 'dependente', status: 'ativo' };
        const { mockInsert } = mockSupabaseInsert({ data: mockData, error: null });

        await ClienteRepository.createDependent({
            clienteId: 'cli-1',
            nomeCompleto: 'Dep Explicito',
            tipo: 'dependente'
        });

        const record = mockInsert.mock.calls[0][0][0];
        expect(record.tipo).toBe('dependente');
    });

    it('getDependentesByClienteId deve filtrar por tipo = "dependente"', async () => {
        const mockDependentes = [
            { id: 'dep-20', cliente_id: 'cli-1', nome_completo: 'Dep A', tipo: 'dependente' }
        ];
        mockSupabaseSelect({ data: mockDependentes, error: null });

        const result = await ClienteRepository.getDependentesByClienteId('cli-1');

        expect(result).toEqual(mockDependentes);
        // Verificar que o segundo .eq foi chamado com 'tipo' e 'dependente'
        const fromResult = (supabase.from as any).mock.results[0].value;
        const firstEq = fromResult.select.mock.results[0].value.eq;
        const secondEq = firstEq.mock.results[0].value.eq;
        expect(secondEq.mock.calls[0]).toEqual(['tipo', 'dependente']);
    });

    it('getDependentesByClienteId deve retornar array vazio quando data e null', async () => {
        mockSupabaseSelect({ data: null, error: null });

        const result = await ClienteRepository.getDependentesByClienteId('cli-1');

        expect(result).toEqual([]);
    });

    it('getDependentesByClienteId deve propagar erro do Supabase', async () => {
        mockSupabaseSelect({ data: null, error: { message: 'select failed' } });

        await expect(
            ClienteRepository.getDependentesByClienteId('cli-1')
        ).rejects.toEqual({ message: 'select failed' });
    });
});
