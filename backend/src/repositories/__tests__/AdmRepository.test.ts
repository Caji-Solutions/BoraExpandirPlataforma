import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../../config/SupabaseClient';
import { AdmRepository } from '../AdmRepository';

vi.mock('../../config/SupabaseClient', () => {
    return {
        supabase: {
            from: vi.fn()
        }
    };
});

describe('derivarTipo', () => {
  it('retorna fixo quando contratoTemplateId está preenchido', () => {
    const repo = new AdmRepository();
    expect((repo as any).derivarTipo({ contratoTemplateId: 'abc-123', isAgendavel: true })).toBe('fixo');
  });
  it('retorna agendavel quando sem contrato e isAgendavel=true', () => {
    const repo = new AdmRepository();
    expect((repo as any).derivarTipo({ contratoTemplateId: null, isAgendavel: true })).toBe('agendavel');
  });
  it('retorna diverso quando sem contrato e sem agendavel', () => {
    const repo = new AdmRepository();
    expect((repo as any).derivarTipo({ contratoTemplateId: null, isAgendavel: false })).toBe('diverso');
  });
});

describe('AdmRepository - Catalogo', () => {
    let repo: AdmRepository;
    
    // Configurando comportamento padrao do mock do Supabase
    let mockSelect: any;
    let mockEq: any;
    let mockSingle: any;
    let mockOrder: any;
    let mockInsert: any;

    beforeEach(() => {
        vi.clearAllMocks();
        repo = new AdmRepository();

        mockSingle = vi.fn().mockResolvedValue({
            data: { id: 'servico-mock' },
            error: null
        });

        mockEq = vi.fn().mockReturnValue({ single: mockSingle });
        mockOrder = vi.fn().mockResolvedValue({
            data: [
                { id: '1', nome: 'Srv A', subservicos: [], requisitos: [] },
                { id: '2', nome: 'Srv B', subservicos: [{ id: 'sub-1', nome: 'Sub 1' }], requisitos: [] }
            ],
            error: null
        });
        
        mockSelect = vi.fn().mockReturnValue({ 
            eq: mockEq,
            order: mockOrder,
            single: mockSingle
        });
        
        mockInsert = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: mockSingle
            })
        });

        (supabase.from as any).mockImplementation((table: string) => {
            return {
                select: mockSelect,
                insert: mockInsert,
                update: vi.fn(),
                delete: vi.fn().mockReturnValue({ eq: vi.fn() }) // mock simplificado pra chain
            };
        });
    });

    it('getCatalogServices() Deve retornar lista com servicos, subservicos e requisitos aninhados', async () => {
        const result = await repo.getCatalogServices();
        
        expect(result).toBeDefined();
        expect(result).toHaveLength(2);
        expect(result[1].subservicos).toHaveLength(1);
        
        // Verifica a chamada correta pro Supabase
        expect(supabase.from).toHaveBeenCalledWith('catalogo_servicos');
        const selectArgs = mockSelect.mock.calls[0][0];
        expect(selectArgs).toContain('requisitos:servico_requisitos(*)');
        expect(selectArgs).toContain('subservicos:subservicos(*, requisitos:servico_requisitos(*))');
    });

    it('createCatalogService() Deve inserir servico basico', async () => {
        mockSingle.mockResolvedValueOnce({
            data: { id: 'new-service-id', nome: 'Basic Auth' },
            error: null
        });
        
        // Mock getServiceById que e chamado no final de createCatalogService
        const spyGetService = vi.spyOn(repo, 'getServiceById').mockResolvedValue({ id: 'new-service-id' } as any);

        const payload = {
            name: 'Basic Auth',
            value: 100,
            duration: 60,
            contratoTemplateId: 'template-abc',
            tipoPreco: 'fixo',
            showInCommercial: true
        };

        const result = await repo.createCatalogService(payload);

        expect(supabase.from).toHaveBeenCalledWith('catalogo_servicos');
        expect(mockInsert).toHaveBeenCalledTimes(1); 
        
        // Checando os dados mapeados para a insercao
        const insertData = mockInsert.mock.calls[0][0][0];
        expect(insertData.nome).toBe('Basic Auth');
        expect(insertData.tipo).toBe('fixo');
        
        expect(spyGetService).toHaveBeenCalledWith('new-service-id');
    });

    it('createCatalogService() Deve inserir subservicos em cascata', async () => {
         // Service insert
         mockSingle.mockResolvedValueOnce({
            data: { id: 'parent-srv-id' },
            error: null
        });
        
        // Subservice insert
        mockSingle.mockResolvedValueOnce({
            data: { id: 'child-subsrv-id' },
            error: null
        });

        // getServiceById spy
        vi.spyOn(repo, 'getServiceById').mockResolvedValue({ id: 'parent-srv-id' } as any);

        const payload = {
            name: 'Pai',
            contratoTemplateId: 'template-xyz',
            subservices: [
                { name: 'Filho 1' }
            ]
        };

        await repo.createCatalogService(payload);

        expect(supabase.from).toHaveBeenCalledWith('catalogo_servicos');
        expect(supabase.from).toHaveBeenCalledWith('subservicos');
        
        expect(mockInsert).toHaveBeenCalledTimes(2); // 1 do servico, 1 do subservico
        
        // A segunda chamada de insert (index 1) foi feita para 'subservicos'
        const subservicoInsertData = mockInsert.mock.calls[1][0][0];
        expect(subservicoInsertData.servico_id).toBe('parent-srv-id');
        expect(subservicoInsertData.nome).toBe('Filho 1');
    });
});
