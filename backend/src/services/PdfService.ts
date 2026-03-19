import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { supabase } from '../config/SupabaseClient'
import { formatCpfDisplay, formatPhoneDisplay } from '../utils/normalizers'

class PdfService {
    private formatValue(value: any): string {
        if (value === null || value === undefined) return ''
        return String(value).trim()
    }

    private formatCurrency(value: any): string {
        if (value === null || value === undefined || value === '') return '-'
        const normalized = String(value).replace(/\./g, '').replace(',', '.')
        const parsed = Number(normalized)
        if (!Number.isFinite(parsed)) return String(value)
        return parsed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    private sanitizeFileName(value: string): string {
        return String(value || 'servico')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '')
    }

    private wrapText(text: string, maxWidth: number, size: number, widthOfTextAtSize: (txt: string) => number): string[] {
        const content = String(text || '').trim()
        if (!content) return ['']

        const words = content.split(/\s+/)
        const lines: string[] = []
        let currentLine = ''

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word
            if (widthOfTextAtSize(testLine) <= maxWidth) {
                currentLine = testLine
                continue
            }

            if (currentLine) {
                lines.push(currentLine)
                currentLine = word
                continue
            }

            // Palavra maior que a largura disponivel. Quebra por caractere.
            let chunk = ''
            for (const char of word) {
                const testChunk = `${chunk}${char}`
                if (widthOfTextAtSize(testChunk) <= maxWidth) {
                    chunk = testChunk
                } else {
                    if (chunk) lines.push(chunk)
                    chunk = char
                }
            }
            currentLine = chunk
        }

        if (currentLine) {
            lines.push(currentLine)
        }

        return lines.length > 0 ? lines : ['']
    }

    /**
     * Gera contrato em PDF com os dados do formulario e faz upload no bucket.
     */
    async gerarContratoAssessoria(contratoId: string, payload: any): Promise<string | null> {
        try {
            console.log(`[PdfService] Iniciando geracao de PDF para o contrato ${contratoId}`)

            const pdfDoc = await PDFDocument.create()
            const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

            const pageWidth = 595.28
            const pageHeight = 841.89
            const margin = 50
            const contentWidth = pageWidth - (margin * 2)
            const minY = 70
            const lineHeight = 15

            let page = pdfDoc.addPage([pageWidth, pageHeight])
            let y = pageHeight - 60

            const drawText = (text: string, options?: {
                size?: number
                bold?: boolean
                after?: number
                color?: { r: number; g: number; b: number }
            }) => {
                const size = options?.size ?? 11
                const font = options?.bold ? fontBold : fontRegular
                const color = options?.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0.11, 0.11, 0.11)
                const wrapped = this.wrapText(
                    text,
                    contentWidth,
                    size,
                    (txt) => font.widthOfTextAtSize(txt, size)
                )

                for (const line of wrapped) {
                    if (y <= minY) {
                        page = pdfDoc.addPage([pageWidth, pageHeight])
                        y = pageHeight - 60
                    }

                    page.drawText(line, {
                        x: margin,
                        y,
                        size,
                        font,
                        color
                    })
                    y -= lineHeight
                }

                y -= options?.after ?? 4
            }

            const dataAtual = new Date().toLocaleDateString('pt-BR')
            const nome = this.formatValue(payload?.nome) || 'Nao informado'
            const nacionalidade = this.formatValue(payload?.nacionalidade) || 'Nao informado'
            const estadoCivil = this.formatValue(payload?.estado_civil) || 'Nao informado'
            const profissao = this.formatValue(payload?.profissao) || 'Nao informado'
            const documentoDigits = String(payload?.documento || '').replace(/\D/g, '')
            const documento = documentoDigits.length === 11
                ? formatCpfDisplay(documentoDigits)
                : this.formatValue(payload?.documento) || 'Nao informado'
            const endereco = this.formatValue(payload?.endereco) || 'Nao informado'
            const email = this.formatValue(payload?.email) || 'Nao informado'
            const telefone = formatPhoneDisplay(payload?.telefone || '') || 'Nao informado'
            const tipoServico = this.formatValue(payload?.tipo_servico || payload?.servico_nome) || 'Assessoria de Imigracao'
            const descricaoPessoas = this.formatValue(payload?.descricao_pessoas || payload?.servicoDescricao) || 'Nao informado'
            const formaPagamento = this.formatValue(payload?.forma_pagamento || payload?.formaPagamento) || 'Nao informado'
            const valorPavao = this.formatCurrency(payload?.valor_pavao)
            const valorDesconto = this.formatCurrency(payload?.valor_desconto)
            const valorConsultoria = this.formatCurrency(payload?.valor_consultoria)

            drawText('CONTRATO DE PRESTACAO DE SERVICOS', { size: 16, bold: true, after: 8 })
            drawText('ASSESSORIA DE IMIGRACAO', { size: 13, bold: true, after: 16, color: { r: 0.03, g: 0.42, b: 0.65 } })

            drawText(`Data de emissao: ${this.formatValue(payload?.data) || dataAtual}`, { size: 10, after: 10 })
            drawText(`Contrato: ${contratoId}`, { size: 10, after: 16 })

            drawText('1. DADOS DO CONTRATANTE', { size: 12, bold: true, after: 8 })
            drawText(`Nome: ${nome}`)
            drawText(`Nacionalidade: ${nacionalidade}`)
            drawText(`Estado civil: ${estadoCivil}`)
            drawText(`Profissao: ${profissao}`)
            drawText(`Documento: ${documento}`)
            drawText(`Endereco: ${endereco}`)
            drawText(`Email: ${email}`)
            drawText(`Telefone: ${telefone}`, { after: 12 })

            drawText('2. OBJETO DO CONTRATO', { size: 12, bold: true, after: 8 })
            drawText(`Servico contratado: ${tipoServico}`)
            drawText(`Descricao: ${descricaoPessoas}`, { after: 12 })

            drawText('3. CONDICOES COMERCIAIS', { size: 12, bold: true, after: 8 })
            drawText(`Valor base (Pavao): ${valorPavao}`)
            drawText(`Valor com desconto: ${valorDesconto}`)
            drawText(`Valor final da consultoria: ${valorConsultoria}`)
            drawText(`Forma de pagamento: ${formaPagamento}`, { after: 12 })

            drawText('4. TERMOS GERAIS', { size: 12, bold: true, after: 8 })
            drawText('4.1 A contratada prestara os servicos tecnicos de assessoria de imigracao, com base nas informacoes fornecidas pelo contratante.')
            drawText('4.2 O contratante se compromete a fornecer dados e documentos verdadeiros, completos e atualizados durante todo o processo.')
            drawText('4.3 Alteracoes de escopo, necessidade de novos documentos ou revisoes legais podem demandar ajustes de prazo e de custos.')
            drawText('4.4 Este documento confirma os termos comerciais acordados entre as partes para inicio do atendimento.', { after: 20 })

            drawText('Assinaturas', { size: 12, bold: true, after: 12 })
            drawText('________________________________________')
            drawText('Contratante', { after: 16 })
            drawText('________________________________________')
            drawText('Bora Expandir', { after: 4 })

            const pdfBytes = await pdfDoc.save()
            const pdfBuffer = Buffer.from(pdfBytes)

            const servicoNome = this.sanitizeFileName(tipoServico)
            const subservicoNome = payload?.subservico_nome ? `_${this.sanitizeFileName(payload.subservico_nome)}` : ''
            const pathStorage = `contratos-gerados/${servicoNome}${subservicoNome}_${contratoId}_${Date.now()}.pdf`

            const { error: uploadError } = await supabase.storage
                .from('contratos')
                .upload(pathStorage, pdfBuffer, {
                    contentType: 'application/pdf',
                    upsert: true
                })

            if (uploadError) {
                console.error('[PdfService] Erro ao fazer upload do PDF gerado:', uploadError)
                throw uploadError
            }

            const { data: publicUrlData } = supabase.storage
                .from('contratos')
                .getPublicUrl(pathStorage)

            console.log(`[PdfService] PDF gerado com sucesso. URL: ${publicUrlData.publicUrl}`)
            return publicUrlData.publicUrl
        } catch (error) {
            console.error('[PdfService] Erro na geracao do contrato PDF:', error)
            return null
        }
    }
}

export default new PdfService()
