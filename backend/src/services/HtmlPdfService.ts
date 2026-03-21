import fs from 'fs';
import path from 'path';
import { supabase } from '../config/SupabaseClient';
import htmlPdf from 'html-pdf-node';
import { formatCpfDisplay, formatPhoneDisplay } from '../utils/normalizers';

interface ContratoPayload {
    nome: string;
    nacionalidade: string;
    estado_civil: string;
    profissao: string;
    documento: string;
    endereco: string;
    email: string;
    telefone: string;
    tipo_servico: string;
    descricao_pessoas?: string;
    valor_pavao?: string;
    valor_desconto?: string;
    valor_consultoria?: string;
    forma_pagamento?: string;
    data: string;
}

class HtmlPdfService {
    private getTemplatePath(): string {
        return path.resolve(__dirname, '../../assets/contrato-assessoria.html');
    }

    async gerarContratoAssessoria(contratoId: string, payload: ContratoPayload): Promise<Buffer | null> {
        try {
            console.log(`[HtmlPdfService] Gerando contrato para: ${payload.nome}`);

            const templatePath = this.getTemplatePath();
            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template nao encontrado: ${templatePath}`);
            }

            let html = fs.readFileSync(templatePath, 'utf-8');

            // Formatar dados
            const documentoDigits = String(payload.documento || '').replace(/\D/g, '');
            const documentoFormatado = documentoDigits.length === 11
                ? formatCpfDisplay(documentoDigits)
                : String(payload.documento || '');
            const telefoneFormatado = formatPhoneDisplay(payload.telefone || '');

            // Substituir variáveis
            html = html
                .replace(/\{\{NOME\}\}/g, payload.nome || '')
                .replace(/\{\{nacionalidade\}\}/g, payload.nacionalidade || '')
                .replace(/\{\{estado.?civil\}\}/gi, payload.estado_civil || '')
                .replace(/\{\{profissão\}\}/gi, payload.profissao || '')
                .replace(/\{\{nome do\(s\) documento\(s\) e número\(s\)\}\}/gi, documentoFormatado)
                .replace(/\{\{endereço\}\}/gi, payload.endereco || '')
                .replace(/\{\{.*email.*\}\}/gi, payload.email || '')
                .replace(/\{\{.*telefone.*\}\}/gi, telefoneFormatado)
                .replace(/\{\{TIPO DE SERVIÇO\}\}/gi, payload.tipo_servico || '')
                .replace(/\{\{Titulares.*\}\}/gi, payload.descricao_pessoas || '')
                .replace(/\{\{VALOR PAVÃO.*\}\}/gi, payload.valor_pavao || '')
                .replace(/\{\{VALOR TOTAL.*\}\}/gi, payload.valor_desconto || '')
                .replace(/\{\{VALOR TOTAL CONSULTORIA.*\}\}/gi, payload.valor_consultoria || '')
                .replace(/\{\{FORMA DE PAGAMENTO\}\}/gi, payload.forma_pagamento || '')
                .replace(/\{\{data\}\}/g, payload.data || new Date().toLocaleDateString('pt-BR'));

            // Gerar PDF
            const file = { content: html };
            const pdfBuffer = await htmlPdf.generatePdf(file, { format: 'A4' }) as unknown as Buffer;

            console.log(`[HtmlPdfService] PDF gerado com sucesso (${pdfBuffer.length} bytes)`);
            return pdfBuffer;

        } catch (error) {
            console.error('[HtmlPdfService] Erro ao gerar PDF:', error);
            return null;
        }
    }
}

export default new HtmlPdfService();
