import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
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

            const docPath = path.resolve(__dirname, '../../assets/contrato-mock.docx');
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
                nome: payload.nome || '',
                nacionalidade: payload.nacionalidade || '',
                estado_civil: payload.estado_civil || '',
                profissao: payload.profissao || '',
                documento: documentoApresentacao,
                endereco: payload.endereco || '',
                email: payload.email || '',
                telefone: formatPhoneDisplay(payload.telefone || ''),
                tipo_servico: payload.tipo_servico || '',
                descricao_pessoas: payload.descricao_pessoas || payload.servicoDescricao || '',
                valor_pavao: payload.valor_pavao || '',
                valor_desconto: payload.valor_desconto || '',
                valor_consultoria: payload.valor_consultoria || '',
                forma_pagamento: payload.forma_pagamento || '',
                data: payload.data || dataAtual
            });

            const buf = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE'
            });

            const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const servicoNome = sanitize(payload.tipo_servico || 'servico');
            const subservicoNome = payload.subservico_nome ? `_${sanitize(payload.subservico_nome)}` : '';
            const pathStorage = `contratos-gerados/${servicoNome}${subservicoNome}_${contratoId}_${Date.now()}.docx`;
            const { error: uploadError } = await supabase.storage
                .from('contratos')
                .upload(pathStorage, buf, {
                    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
