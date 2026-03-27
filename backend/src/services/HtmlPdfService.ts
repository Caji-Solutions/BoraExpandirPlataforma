import fs from 'fs';
import path from 'path';
import { supabase } from '../config/SupabaseClient';
import htmlPdf from 'html-pdf-node';
import Handlebars from 'handlebars';
import { PDFDocument } from 'pdf-lib';
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

export interface SignaturePosition {
    x: number; // percentual 0-100 da largura da pagina
    y: number; // percentual 0-100 da altura da pagina
    z: number; // numero da pagina (1-indexed)
}

export interface ContratoPdfResult {
    buffer: Buffer;
    totalPages: number;
    signaturePositions: {
        cliente: SignaturePosition;
        empresa: SignaturePosition;
    };
}

function sanitizeText(str: string): string {
    return String(str || '').replace(/<[^>]*>/g, '').trim();
}

// Constantes de 1 ponto PDF = 1/72 inch = 0.3528mm
const MM_TO_POINTS = 2.8346; // 1mm = 2.8346 PDF points
const PT_TO_MM = 0.3528;     // 1pt CSS = 0.3528mm

/**
 * Calcula as coordenadas exatas das assinaturas na pagina de assinatura,
 * baseado nas dimensoes reais da pagina do PDF e no layout CSS do template.
 *
 * Layout CSS da pagina de assinatura (contrato-assessoria.html PAGE 10):
 *   .page { padding: 20mm 20mm 25mm 20mm }
 *   .signature-block { page-break-before: always; margin-top: 0 }
 *     <p>&nbsp;</p>                        ~15pt height (line-height 1.6 * 10.5pt)
 *     <p>Ribeirao Preto, {{data}}.</p>     ~15pt height
 *     <p>&nbsp;</p>                        ~15pt height
 *     .signature-row { margin-top: 16pt }
 *       .signature-field (flex: 1)
 *         .signature-marker (height: 0)    <- posicao da assinatura
 *         .signature-line { margin-top: 36pt }
 *     gap entre campos: 40pt
 */
function calcularPosicoesAssinatura(
    pageWidthPts: number,
    pageHeightPts: number,
    totalPages: number
): { cliente: SignaturePosition; empresa: SignaturePosition } {
    const pageWidthMm = pageWidthPts / MM_TO_POINTS;
    const pageHeightMm = pageHeightPts / MM_TO_POINTS;

    // Distancia vertical do topo da pagina ate os markers de assinatura
    const paddingTopMm = 20;
    const paraHeightMm = 15 * PT_TO_MM;   // ~15pt por paragrafo (font 10.5pt * line-height 1.6)
    const numParagraphs = 3;               // 3 paragrafos antes da signature-row
    const signatureRowMarginTopMm = 16 * PT_TO_MM; // margin-top: 16pt
    const signatureLineMarginTopMm = 36 * PT_TO_MM; // margin-top: 36pt da .signature-line

    // Posicao Y do marker (que fica ANTES da signature-line)
    // O marker esta acima da linha, entao a assinatura fica sobre a linha
    const sigMarkerFromTopMm = paddingTopMm
        + (paraHeightMm * numParagraphs) // 3 paragrafos
        + signatureRowMarginTopMm        // gap antes da row
        + (signatureLineMarginTopMm * 0.5); // metade do margin-top da linha (assinatura fica entre marker e linha)

    const sigY = (sigMarkerFromTopMm / pageHeightMm) * 100;

    // Distancia horizontal dos campos de assinatura
    const paddingLeftMm = 20;
    const paddingRightMm = 20;
    const gapMm = 40 * PT_TO_MM; // gap: 40pt entre os 2 campos
    const contentWidthMm = pageWidthMm - paddingLeftMm - paddingRightMm;
    const fieldWidthMm = (contentWidthMm - gapMm) / 2;

    // Centro horizontal de cada campo
    const clienteCenterMm = paddingLeftMm + (fieldWidthMm / 2);
    const empresaCenterMm = paddingLeftMm + fieldWidthMm + gapMm + (fieldWidthMm / 2);

    // Converter para percentuais, arredondar para 1 casa decimal
    const clienteX = Math.round((clienteCenterMm / pageWidthMm) * 1000) / 10;
    const empresaX = Math.round((empresaCenterMm / pageWidthMm) * 1000) / 10;
    const roundedY = Math.round(sigY * 10) / 10;

    return {
        cliente: { x: clienteX, y: roundedY, z: totalPages },
        empresa: { x: empresaX, y: roundedY, z: totalPages }
    };
}

class HtmlPdfService {
    private getTemplatePath(): string {
        return path.resolve(__dirname, '../../assets/contrato-assessoria.html');
    }

    async gerarContratoAssessoria(contratoId: string, payload: ContratoPayload): Promise<ContratoPdfResult | null> {
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

            // Ler dimensoes reais da pagina e calcular posicoes exatas das assinaturas
            let totalPages = 1;
            let signaturePositions: ContratoPdfResult['signaturePositions'];

            try {
                const pdfDoc = await PDFDocument.load(pdfBuffer);
                totalPages = pdfDoc.getPageCount();

                // Pegar dimensoes reais da ultima pagina (pagina de assinatura)
                const lastPage = pdfDoc.getPage(totalPages - 1);
                const { width, height } = lastPage.getSize();

                signaturePositions = calcularPosicoesAssinatura(width, height, totalPages);

                console.log(`[HtmlPdfService] PDF: ${totalPages} paginas, ultima pagina: ${width.toFixed(1)}x${height.toFixed(1)}pts`);
            } catch (pdfError) {
                console.warn('[HtmlPdfService] Fallback: usando coordenadas padrao A4', pdfError);
                // Fallback: A4 em pontos (595.28 x 841.89)
                signaturePositions = calcularPosicoesAssinatura(595.28, 841.89, totalPages);
            }

            console.log(`[HtmlPdfService] PDF gerado com sucesso (${pdfBuffer.length} bytes, ${totalPages} paginas)`);
            return { buffer: pdfBuffer, totalPages, signaturePositions };

        } catch (error) {
            console.error('[HtmlPdfService] Erro ao gerar PDF:', error);
            return null;
        }
    }
}

export default new HtmlPdfService();

