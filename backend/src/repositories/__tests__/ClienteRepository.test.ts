import { vi, describe, it, expect, beforeEach } from 'vitest';
import ClienteRepository from '../ClienteRepository';
import { supabase } from '../../config/SupabaseClient';

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn(),
            single: vi.fn()
        })
    }
}));

describe('ClienteRepository', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('register (Lead/Cliente)', () => {
        it('should insert a new client/lead when no existing record is found', async () => {
            // Arrange
            const mockSelect = vi.fn().mockReturnThis();
            const mockOr = vi.fn().mockReturnThis();
            const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
            
            const mockInsert = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({ 
                data: { id: 'new-id', nome: 'Test', email: 'test@example.com', status: 'LEAD' }, 
                error: null 
            });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'clientes') {
                    return {
                        select: mockSelect,
                        or: mockOr,
                        maybeSingle: mockMaybeSingle,
                        insert: mockInsert,
                        update: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: mockSingle
                    };
                }
            });

            const newClientData = { 
                nome: 'Test', 
                email: 'test@example.com', 
                whatsapp: '5511999999999', 
                status: 'LEAD' 
            };

            // Act
            const result = await ClienteRepository.register(newClientData as any);

            // Assert
            expect(result).toBeDefined();
            expect(result.status).toBe('LEAD');
            expect(mockInsert).toHaveBeenCalledTimes(1);
            expect(mockInsert.mock.calls[0][0][0]).toMatchObject({
                nome: 'Test',
                email: 'test@example.com',
                status: 'LEAD'
            });
        });

        it('should update an existing record if found by email/whatsapp', async () => {
            // Arrange
            const existingClient = { id: 'existing-id', email: 'test@example.com', status: 'LEAD' };
            const mockMaybeSingle = vi.fn().mockResolvedValue({ data: existingClient, error: null });
            
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({ 
                data: { ...existingClient, nome: 'Updated Name', status: 'cliente' }, 
                error: null 
            });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'clientes') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        or: vi.fn().mockReturnThis(),
                        maybeSingle: mockMaybeSingle,
                        update: mockUpdate,
                        eq: mockEq,
                        single: mockSingle
                    };
                }
            });

            const updateData = { 
                nome: 'Updated Name', 
                email: 'test@example.com', 
                status: 'cliente' 
            };

            // Act
            const result = await ClienteRepository.register(updateData as any);

            // Assert
            expect(result).toBeDefined();
            expect(result.status).toBe('cliente');
            expect(mockUpdate).toHaveBeenCalledTimes(1);
            expect(mockEq).toHaveBeenCalledWith('id', 'existing-id');
        });
    });

    describe('attStatusById', () => {
        it('should update the status array/field by ID', async () => {
            // Arrange
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({ 
                data: { id: 'client-id', status: 'cliente' }, 
                error: null 
            });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'clientes') {
                    return {
                        update: mockUpdate,
                        eq: mockEq,
                        select: mockSelect,
                        single: mockSingle
                    };
                }
            });

            // Act
            const result = await ClienteRepository.attStatusById('client-id', 'cliente');

            // Assert
            expect(mockUpdate).toHaveBeenCalledWith({ status: 'cliente' });
            expect(mockEq).toHaveBeenCalledWith('id', 'client-id');
            expect(result.status).toBe('cliente');
        });
    });
});
