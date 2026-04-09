import { vi, describe, it, expect, beforeEach } from 'vitest';
import ApostilamentoController from '../apostilamento/ApostilamentoController';
import ApostilamentoRepository from '../../repositories/ApostilamentoRepository';

vi.mock('../../repositories/ApostilamentoRepository');

function makeRes() {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };
}

describe('ApostilamentoController - uploadApostilado', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar 200 com dados ao fazer upload com sucesso', async () => {
        const mockResult = {
            id: 'apost-1',
            documento_apostilado_url: 'https://storage.example.com/apostilados/apost-1/doc.pdf',
            status: 'concluido',
            concluido_em: '2026-04-08T18:00:00.000Z'
        };

        (ApostilamentoRepository.uploadApostilado as any).mockResolvedValue(mockResult);

        const req: any = {
            params: { id: 'apost-1' },
            file: {
                originalname: 'doc.pdf',
                buffer: Buffer.from('fake-pdf-content'),
                mimetype: 'application/pdf'
            }
        };
        const res = makeRes();

        await ApostilamentoController.uploadApostilado(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Documento apostilado enviado com sucesso',
            data: mockResult
        });

        expect(ApostilamentoRepository.uploadApostilado).toHaveBeenCalledWith({
            apostilamentoId: 'apost-1',
            filePath: 'apostilados/apost-1/doc.pdf',
            fileBuffer: expect.any(Buffer),
            contentType: 'application/pdf',
            nomeOriginal: 'doc.pdf'
        });
    });

    it('deve retornar 400 quando nenhum arquivo e enviado', async () => {
        const req: any = {
            params: { id: 'apost-1' },
            file: undefined
        };
        const res = makeRes();

        await ApostilamentoController.uploadApostilado(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Nenhum arquivo enviado' });
        expect(ApostilamentoRepository.uploadApostilado).not.toHaveBeenCalled();
    });

    it('deve retornar 500 quando Repository lanca excecao', async () => {
        (ApostilamentoRepository.uploadApostilado as any).mockRejectedValue(
            new Error('Storage upload failed')
        );

        const req: any = {
            params: { id: 'apost-1' },
            file: {
                originalname: 'doc.pdf',
                buffer: Buffer.from('content'),
                mimetype: 'application/pdf'
            }
        };
        const res = makeRes();

        await ApostilamentoController.uploadApostilado(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao enviar documento apostilado',
            details: 'Storage upload failed'
        });
    });

    it('deve construir o filePath corretamente a partir do id e nome do arquivo', async () => {
        (ApostilamentoRepository.uploadApostilado as any).mockResolvedValue({ id: 'apost-42' });

        const req: any = {
            params: { id: 'apost-42' },
            file: {
                originalname: 'certidao_apostilada.pdf',
                buffer: Buffer.from('content'),
                mimetype: 'application/pdf'
            }
        };
        const res = makeRes();

        await ApostilamentoController.uploadApostilado(req, res);

        expect(ApostilamentoRepository.uploadApostilado).toHaveBeenCalledWith(
            expect.objectContaining({
                filePath: 'apostilados/apost-42/certidao_apostilada.pdf'
            })
        );
    });
});
