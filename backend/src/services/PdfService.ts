import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { supabase } from '../config/SupabaseClient';

class PdfService {
    /**
     * Preenche o contrato mock DOCX com os dados do formulário e faz o upload para o storage.
     * Continuamos chamando "PdfService" para não quebrar referências, mas o arquivo é DOCX.
     */
    async gerarContratoAssessoria(contratoId: string, payload: any): Promise<string | null> {
        try {
            console.log(`[PdfService] Iniciando geração de DOCX para o contrato ${contratoId}`);
            
            // 1. Caminho para o DOCX original ajustado
            const docPath = path.resolve(__dirname, '../../assets/contrato-mock.docx');
            if (!fs.existsSync(docPath)) {
                throw new Error(`Template de contrato não encontrado em: ${docPath}`);
            }

            // 2. Lê e carrega o DOCX
            const content = fs.readFileSync(docPath, 'binary');
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                delimiters: { start: '{{', end: '}}' },
                nullGetter: () => '' // Return empty string for undefined variables
            });

            // 3. Modifica o DOCX com payload
            // Certifique-se de que a formatação da data seja preenchida se não houver
            const dataAtual = new Date().toLocaleDateString('pt-BR');
            doc.render({
                nome: payload.nome || '',
                nacionalidade: payload.nacionalidade || '',
                estado_civil: payload.estado_civil || '',
                profissao: payload.profissao || '',
                documento: payload.documento || '',
                endereco: payload.endereco || '',
                email: payload.email || '',
                telefone: payload.telefone || '',
                tipo_servico: payload.tipo_servico || '',
                descricao_pessoas: payload.descricao_pessoas || payload.servicoDescricao || '',
                valor_pavao: payload.valor_pavao || '',
                valor_desconto: payload.valor_desconto || '',
                valor_consultoria: payload.valor_consultoria || '',
                forma_pagamento: payload.forma_pagamento || '',
                data: payload.data || dataAtual
            });

            // 4. Salva o novo documento DOCX em um buffer
            const buf = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE'
            });

            // 5. Faz upload no Supabase Storage
            // Incluir nome do servico e subservico no nome do arquivo
            const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const servicoNome = sanitize(payload.tipo_servico || 'servico');
            const subservicoNome = payload.subservico_nome ? `_${sanitize(payload.subservico_nome)}` : '';
            const pathStorage = `contratos-gerados/${servicoNome}${subservicoNome}_${contratoId}_${Date.now()}.docx`;
            const { data: uploadData, error: uploadError } = await supabase.storage
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
            console.error('[PdfService] Erro na geração do contrato DOCX:', error);
            return null;
        }
    }
}

export default new PdfService();
