import fs from 'fs';
import path from 'path';
import { supabase } from '../config/SupabaseClient';
import htmlPdf from 'html-pdf-node';
import Handlebars from 'handlebars';
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
    pendencias?: string; // JSON string of Array<{nome, parentesco, valor}>
}

function sanitizeText(str: string): string {
    return String(str || '').replace(/<[^>]*>/g, '').trim();
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

            const templateSource = fs.readFileSync(templatePath, 'utf-8');

            // Formatar dados
            const documentoDigits = String(payload.documento || '').replace(/\D/g, '');
            const documentoFormatado = documentoDigits.length === 11
                ? formatCpfDisplay(documentoDigits)
                : String(payload.documento || '');
            const telefoneFormatado = formatPhoneDisplay(payload.telefone || '');

            // Parsear pendencias
            let pendenciasArray: Array<{nome: string, parentesco: string, valor: string}> = [];
            if (payload.pendencias) {
                try {
                    const parsed = JSON.parse(payload.pendencias);
                    if (Array.isArray(parsed)) {
                        pendenciasArray = parsed.filter(p => p.nome || p.valor);
                    }
                } catch {
                    console.warn('[HtmlPdfService] Falha ao parsear pendencias');
                }
            }

            // Compilar template com Handlebars
            const template = Handlebars.compile(templateSource);

            const context: Record<string, any> = {
                nome: sanitizeText(payload.nome),
                nacionalidade: sanitizeText(payload.nacionalidade),
                estado_civil: sanitizeText(payload.estado_civil),
                profissao: sanitizeText(payload.profissao),
                documento: documentoFormatado,
                endereco: sanitizeText(payload.endereco),
                email: sanitizeText(payload.email),
                telefone: telefoneFormatado,
                tipo_servico: sanitizeText(payload.tipo_servico),
                descricao_pessoas: payload.descricao_pessoas || '',
                valor_pavao: payload.valor_pavao || '',
                valor_desconto: payload.valor_desconto || '',
                valor_consultoria: payload.valor_consultoria || '',
                forma_pagamento: payload.forma_pagamento || '',
                data: payload.data || new Date().toLocaleDateString('pt-BR'),
                pendencias: pendenciasArray.length > 0 ? pendenciasArray : null,
            };

            const html = template(context);

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
