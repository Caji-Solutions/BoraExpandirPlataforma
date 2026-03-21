import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../../config/SupabaseClient';
import DNAService, { UnifiedDNA } from '../DNAService';

// Mock do SupabaseClient
vi.mock('../../config/SupabaseClient', () => {
    return {
        supabase: {
            from: vi.fn(),
        }
    };
});

describe('DNAService', () => {
    const mockClienteId = 'cliente-123';
    
    // Configurando comportamento padrao do mock do Supabase
    let mockSelect: any;
    let mockEq: any;
    let mockSingle: any;
    let mockUpdate: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSingle = vi.fn().mockResolvedValue({
            data: {
                id: mockClienteId,
                status: 'lead',
                perfil_unificado: {
                    data: { nome: 'Joao', metadata_field: 'MEDIUM_DATA' },
                    metadata: { nome: 'HIGH', metadata_field: 'MEDIUM' }
                }
            },
            error: null
        });

        mockEq = vi.fn().mockReturnValue({ single: mockSingle });
        mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        
        mockUpdate = vi.fn().mockReturnValue({
             eq: vi.fn().mockResolvedValue({ data: null, error: null })
        });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'clientes') {
                return {
                    select: mockSelect,
                    update: mockUpdate
                };
            }
            return {};
        });
    });

    it('Cenario 1: Payload HIGH em campo vazio -> deve preencher e marcar como HIGH', async () => {
        const payload = { campo_vazio: 'novo_valor' };
        
        const result = await DNAService.mergeDNA(mockClienteId, payload, 'HIGH');

        expect(result).toBeDefined();
        expect(result?.data.campo_vazio).toBe('novo_valor');
        expect(result?.metadata.campo_vazio).toBe('HIGH');
        
        // Verifica se chamou o update
        expect(mockUpdate).toHaveBeenCalled();
    });

    it('Cenario 2: Payload MEDIUM em campo preenchido por HIGH -> deve IGNORAR', async () => {
        // Tenta sobrescrever 'nome' que esta como HIGH no mock inicial
        const payload = { nome: 'Joao da Silva' };
        
        const result = await DNAService.mergeDNA(mockClienteId, payload, 'MEDIUM');

        // Nao deve alterar
        expect(result?.data.nome).toBe('Joao');
        expect(result?.metadata.nome).toBe('HIGH');
    });

    it('Cenario 3: Payload HIGH em campo preenchido por MEDIUM -> deve SOBRESCREVER', async () => {
        // Tenta sobrescrever 'metadata_field' que esta como MEDIUM no mock inicial
        const payload = { metadata_field: 'NEW_HIGH_DATA' };
        
        const result = await DNAService.mergeDNA(mockClienteId, payload, 'HIGH');

        // Deve alterar e promover para HIGH
        expect(result?.data.metadata_field).toBe('NEW_HIGH_DATA');
        expect(result?.metadata.metadata_field).toBe('HIGH');
    });

    it('Deve ignorar campos __internal e valores null/undefined/empty', async () => {
        const payload = {
            __erroGeracao: 'erro',
            campo_null: null,
            campo_undefined: undefined,
            campo_vazio: '',
            campo_valido: 'valido'
        };

        const result = await DNAService.mergeDNA(mockClienteId, payload, 'MEDIUM') as UnifiedDNA;

        expect(result.data['__erroGeracao']).toBeUndefined();
        expect(result.data.campo_null).toBeUndefined();
        expect(result.data.campo_undefined).toBeUndefined();
        expect(result.data.campo_vazio).toBeUndefined();
        
        expect(result.data.campo_valido).toBe('valido');
    });

    it('Deve sincronizar chaves root como nome_completo -> nome', async () => {
        const payload = { nome_completo: 'Maria Silva', documento: '12345678900', telefone: '5511999999999' };
        
        await DNAService.mergeDNA(mockClienteId, payload, 'HIGH');

        // Pega o argumento passado para o mockUpdate
        const updatePayload = mockUpdate.mock.calls[0][0];
        
        expect(updatePayload).toHaveProperty('nome', 'Maria Silva');
        expect(updatePayload).not.toHaveProperty('cpf'); // documento nao ta em VALID_CLIENT_COLUMNS no arquivo, apenas no comentario
        expect(updatePayload).toHaveProperty('whatsapp', '5511999999999');
    });

    it('Deve retornar null se nao encontrar o cliente', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Not found') });
        
        const result = await DNAService.mergeDNA('invalid-id', { teste: '123' }, 'HIGH');
        
        expect(result).toBeNull();
    });
});
