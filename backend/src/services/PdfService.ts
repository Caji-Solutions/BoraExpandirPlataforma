import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs';
import ILovePDFFile from '@ilovepdf/ilovepdf-nodejs/ILovePDFFile';
import os from 'os';
import { supabase } from '../config/SupabaseClient';
import { formatCpfDisplay, formatPhoneDisplay } from '../utils/normalizers';

class PdfService {
    /**
     * Preenche o contrato mock DOCX com os dados do formulario e faz o upload para o storage.
     * Continuamos chamando "PdfService" para nao quebrar referencias, mas o arquivo final e DOCX.
     */
    async gerarContratoAssessoria(contratoId: string, payload: any): Promise<string | null> {
        try {
            console.log(`[PdfService] Iniciando geracao de DOCX para o contrato ${contratoId}`);

            const docPath = path.resolve(__dirname, '../../assets/contrato-base.docx');
            if (!fs.existsSync(docPath)) {
                throw new Error(`Template de contrato nao encontrado em: ${docPath}`);
            }

            const content = fs.readFileSync(docPath, 'binary');
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                delimiters: { start: '{{', end: '}}' },
                nullGetter: () => ''
            });

            const dataAtual = new Date().toLocaleDateString('pt-BR');
            const documentoRaw = payload.documento || '';
            const documentoDigits = String(documentoRaw).replace(/\D/g, '');
            const documentoApresentacao = documentoDigits.length === 11
                ? formatCpfDisplay(documentoDigits)
                : String(documentoRaw);

            doc.render({
                'NOME': payload.nome || '',
                'nacionalidade': payload.nacionalidade || '',
                'estado civil': payload.estado_civil || '',
                'profissão': payload.profissao || '',
                'nome do(s) documento(s) e número(s)': documentoApresentacao,
                'endereço': payload.endereco || '',
                'email': payload.email || '',
                'TELEFONE': formatPhoneDisplay(payload.telefone || ''),
                '(preencher o tipo de consultoria contratada. Ex: CONSULTORIA COMPLETA – NACIONALIDADE PORTUGUESA / ASSESSORIA JURÍDICA COMPLETA….)': payload.tipo_servico || '',
                'nome completo de todos os envolvidos': payload.descricao_pessoas || payload.servicoDescricao || '',
                'valor por extenso': payload.valor_pavao || '',
                'valor atualizado referente ao serviço': payload.valor_desconto || '',
                '(valor final da consultoria por extenso)': payload.valor_consultoria || '',
                'FORMA DE PAGAMENTO': payload.forma_pagamento || '',
                'data': payload.data || dataAtual
            });

            // Remover marcacoes (grifados) de todos os arquivos XML antes de exportar
            const zipExport = doc.getZip();
            for (const fileKey in zipExport.files) {
                if (fileKey.endsWith('.xml')) {
                    let xmlContent = zipExport.files[fileKey].asText();
                    if (xmlContent.includes('w:highlight') || xmlContent.includes('FFFF00') || xmlContent.includes('ffff00')) {
                        // Remove tags de grifado da formatacao dos runs
                        xmlContent = xmlContent.replace(/<w:highlight[^>]*\/>/g, '');
                        // Remove shading amarelo de paragrafos e runs (background color)
                        xmlContent = xmlContent.replace(/<w:shd[^>]*w:fill="(FFFF00|ffff00)"[^>]*\/>/g, '');
                        zipExport.file(fileKey, xmlContent);
                    }
                }
            }

            const buf = zipExport.generate({
                type: 'nodebuffer',
                compression: 'DEFLATE'
            });

            console.log(`[PdfService] Convertendo DOCX para PDF usando ILovePDF...`);
            let pdfBuf: Buffer;
            const tempDocxPath = path.join(os.tmpdir(), `temp_contrato_${Date.now()}.docx`);
            
            try {
                const ilovepdfPublicKey = process.env.ILOVE_PUBLIC_KEY;
                const ilovepdfSecretKey = process.env.ILOVE_SECRET_KEY;
                
                if (!ilovepdfPublicKey || !ilovepdfSecretKey) {
                    throw new Error('Chaves da API do ILovePDF (ILOVE_PUBLIC_KEY e ILOVE_SECRET_KEY) nao estao configuradas no .env');
                }
                
                fs.writeFileSync(tempDocxPath, buf);

                const instance = new ILovePDFApi(ilovepdfPublicKey, ilovepdfSecretKey);
                const task = instance.newTask('officepdf');
                
                await task.start();
                const file = new ILovePDFFile(tempDocxPath);
                await task.addFile(file);
                await task.process();
                const pdfData = await task.download();

                pdfBuf = Buffer.from(pdfData);
                
            } catch (convErr) {
                console.error('[PdfService] Erro ao converter para PDF via ILovePDF:', convErr);
                throw new Error('Falha na conversao para PDF via ILovePDF.');
            } finally {
                try {
                    if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
                } catch (cleanupErr) {
                    console.error('[PdfService] Falha ao limpar arquivo temporario:', cleanupErr);
                }
            }

            const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const servicoNome = sanitize(payload.tipo_servico || 'servico');
            const subservicoNome = payload.subservico_nome ? `_${sanitize(payload.subservico_nome)}` : '';
            const pathStorage = `contratos-gerados/${servicoNome}${subservicoNome}_${contratoId}_${Date.now()}.pdf`;
            
            const { error: uploadError } = await supabase.storage
                .from('contratos')
                .upload(pathStorage, pdfBuf, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (uploadError) {
                console.error('[PdfService] Erro ao fazer upload do DOCX gerado:', uploadError);
                throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage
                .from('contratos')
                .getPublicUrl(pathStorage);

            console.log(`[PdfService] DOCX gerado com sucesso. URL: ${publicUrlData.publicUrl}`);
            return publicUrlData.publicUrl;

        } catch (error) {
            console.error('[PdfService] Erro na geracao do contrato DOCX:', error);
            return null;
        }
    }
}

export default new PdfService();
