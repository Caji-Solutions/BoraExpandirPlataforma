import nodemailer from 'nodemailer'

class EmailService {
    private transporter: nodemailer.Transporter | null = null

    private getTransporter(): nodemailer.Transporter {
        if (!this.transporter) {
            const host = process.env.SMTP_HOST
            const port = parseInt(process.env.SMTP_PORT || '587')
            const user = process.env.SMTP_USER
            const pass = process.env.SMTP_PASS

            if (!host || !user || !pass) {
                const faltando = [!host && 'SMTP_HOST', !user && 'SMTP_USER', !pass && 'SMTP_PASS'].filter(Boolean)
                console.warn(`[EmailService] SMTP NAO configurado. Variaveis ausentes: ${faltando.join(', ')}. Emails NAO serao enviados de verdade.`)
                return {
                    sendMail: async (opts: any) => {
                        console.log('[EmailService] [SIMULADO - SEM SMTP REAL] Email NAO enviado:', {
                            to: opts.to,
                            subject: opts.subject
                        })
                        return { messageId: 'simulated' }
                    }
                } as any
            }

            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass }
            })
        }

        return this.transporter!
    }

    /**
     * Envia email de boas-vindas ao cliente com link de login
     */
    async sendWelcomeEmail(params: {
        to: string
        clientName: string
        loginUrl: string
        email: string
        senha: string
    }): Promise<void> {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@boraexpandir.com'
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
        const loginLink = params.loginUrl || `${frontendUrl}/login`

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à Bora Expandir</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#076CA5 0%,#0A8FD4 100%);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Bora Expandir 🚀</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Plataforma de Imigração</p>
        </div>

        <!-- Content -->
        <div style="padding:32px;">
            <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:22px;">
                Olá, ${params.clientName}! 👋
            </h2>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Sua conta na plataforma <strong>Bora Expandir</strong> foi criada com sucesso!
                As informações da sua consultoria já estão disponíveis na sua área do cliente.
            </p>

            <!-- Credentials Box -->
            <div style="background:#f0f7fc;border:1px solid #d0e7f5;border-radius:12px;padding:20px;margin:0 0 24px;">
                <p style="color:#076CA5;font-weight:700;margin:0 0 12px;font-size:14px;">📧 Seus dados de acesso:</p>
                <p style="color:#333;margin:0 0 6px;font-size:14px;"><strong>E-mail:</strong> ${params.email}</p>
                <p style="color:#333;margin:0;font-size:14px;"><strong>Senha:</strong> ${params.senha}</p>
            </div>

            <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Recomendamos que altere sua senha após o primeiro acesso.
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:32px 0;">
                <a href="${loginLink}"
                   style="display:inline-block;background:#076CA5;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                    Acessar Minha Área
                </a>
            </div>

            <p style="color:#999;font-size:12px;text-align:center;margin:24px 0 0;">
                Se você não solicitou esta conta, por favor desconsidere este email.
            </p>
        </div>

        <!-- Footer -->
        <div style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#aaa;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Bora Expandir — Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>
        `.trim()

        try {
            const transporter = this.getTransporter()
            await transporter.sendMail({
                from: `"Bora Expandir" <${from}>`,
                to: params.to,
                subject: '🚀 Bem-vindo à Bora Expandir — Seus dados de acesso',
                html
            })
            console.log(`[EmailService] Email de boas-vindas enviado para ${params.to}`)
        } catch (error) {
            console.error('[EmailService] Erro ao enviar email:', error)
            throw error
        }
    }

    /**
     * Envia email genérico
     */
    async sendEmail(params: {
        to: string
        subject: string
        html: string
    }): Promise<void> {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@boraexpandir.com'

        try {
            const transporter = this.getTransporter()
            await transporter.sendMail({
                from: `"Bora Expandir" <${from}>`,
                to: params.to,
                subject: params.subject,
                html: params.html
            })
            console.log(`[EmailService] Email enviado para ${params.to}: ${params.subject}`)
        } catch (error) {
            console.error('[EmailService] Erro ao enviar email:', error)
            throw error
        }
    }

    /**
     * Envia email para o cliente preencher o formulário (após confirmação de pagamento)
     */
    async sendFormularioEmail(params: {
        to: string
        clientName: string
        formularioLink: string
        email: string
    }): Promise<void> {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@boraexpandir.com'

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pagamento Confirmado - Bora Expandir</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#076CA5 0%,#0A8FD4 100%);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Bora Expandir 🚀</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Pagamento Confirmado ✅</p>
        </div>

        <!-- Content -->
        <div style="padding:32px;">
            <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:22px;">
                Olá, ${params.clientName}! 👋
            </h2>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Seu pagamento foi <strong>confirmado com sucesso</strong>! 🎉
            </p>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Para darmos continuidade à sua consultoria, precisamos que você preencha o formulário abaixo com seus dados.
                Isso é essencial para que nosso time prepare tudo para o seu atendimento.
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:32px 0;">
                <a href="${params.formularioLink}"
                   style="display:inline-block;background:#076CA5;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                    📋 Preencher Formulário
                </a>
            </div>

            <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 16px;text-align:center;">
                Após o preenchimento, você receberá suas credenciais de acesso à plataforma.
            </p>

            <p style="color:#999;font-size:12px;text-align:center;margin:24px 0 0;">
                Se você não solicitou este serviço, por favor desconsidere este email.
            </p>
        </div>

        <!-- Footer -->
        <div style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#aaa;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Bora Expandir — Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>
        `.trim()

        try {
            const transporter = this.getTransporter()
            await transporter.sendMail({
                from: `"Bora Expandir" <${from}>`,
                to: params.to,
                subject: '✅ Pagamento Confirmado — Preencha seu formulário | Bora Expandir',
                html
            })
            console.log(`[EmailService] Email de formulario enviado para ${params.to}`)
        } catch (error) {
            console.error('[EmailService] Erro ao enviar email de formulario:', error)
            throw error
        }
    }

    /**
     * Envia email com contrato em anexo para assinatura
     */
    async sendContratoEmail(params: {
        to: string
        clientName: string
        areaClienteLink: string
        contratoArquivoUrl: string
        servicoNome: string
    }): Promise<void> {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@boraexpandir.com'

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato para Assinatura - Bora Expandir</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#076CA5 0%,#0A8FD4 100%);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Bora Expandir</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Contrato para assinatura</p>
        </div>
        <div style="padding:32px;">
            <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:22px;">
                Olá, ${params.clientName}!
            </h2>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Segue em anexo o contrato referente ao serviço <strong>${params.servicoNome}</strong>.
            </p>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Para assinar, acesse sua área do cliente e envie o arquivo assinado.
            </p>
            <div style="text-align:center;margin:32px 0;">
                <a href="${params.areaClienteLink}"
                   style="display:inline-block;background:#076CA5;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                    Acessar Área do Cliente
                </a>
            </div>
            <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 12px;">
                Caso prefira, você também pode baixar o contrato diretamente:
                <a href="${params.contratoArquivoUrl}" style="color:#076CA5;">Baixar contrato (PDF)</a>.
            </p>
            <p style="color:#999;font-size:12px;text-align:center;margin:24px 0 0;">
                Se você não solicitou este serviço, por favor desconsidere este email.
            </p>
        </div>
        <div style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#aaa;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Bora Expandir — Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>
        `.trim()

        if (!params.contratoArquivoUrl) {
            throw new Error('URL do contrato gerado nao informada para envio de email.')
        }

        const nomeServicoArquivo = String(params.servicoNome || 'assessoria')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase() || 'assessoria'

        let attachments: any[] = []
        try {
            const fileResponse = await fetch(params.contratoArquivoUrl)
            if (!fileResponse.ok) {
                throw new Error(`Falha ao baixar contrato gerado. HTTP ${fileResponse.status}`)
            }

            const contentType = fileResponse.headers.get('content-type') || ''
            const isPdf = contentType.includes('application/pdf') || /\.pdf(?:\?|$)/i.test(params.contratoArquivoUrl)

            if (!isPdf) {
                throw new Error(`Contrato gerado nao esta em PDF (content-type: ${contentType || 'desconhecido'})`)
            }

            const contractBuffer = Buffer.from(await fileResponse.arrayBuffer())
            attachments = [{
                filename: `contrato-${nomeServicoArquivo}.pdf`,
                content: contractBuffer,
                contentType: 'application/pdf'
            }]
        } catch (err) {
            console.error('[EmailService] Erro ao anexar contrato gerado no email:', err)
            throw err
        }

        try {
            const transporter = this.getTransporter()
            await transporter.sendMail({
                from: `"Bora Expandir" <${from}>`,
                to: params.to,
                subject: `Contrato para assinatura — ${params.servicoNome}`,
                html,
                attachments
            })
            console.log(`[EmailService] Email de contrato enviado para ${params.to}`)
        } catch (error) {
            console.error('[EmailService] Erro ao enviar email de contrato:', error)
            throw error
        }
    }

    /**
     * Envia email de redefinição de senha
     */
    async sendPasswordResetEmail(params: {
        to: string
        name: string
        resetUrl: string
    }): Promise<void> {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@boraexpandir.com'
        
        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha - Bora Expandir</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#076CA5 0%,#0A8FD4 100%);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Bora Expandir 🚀</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Recuperação de Senha</p>
        </div>

        <!-- Content -->
        <div style="padding:32px;">
            <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:22px;">
                Olá, ${params.name}! 👋
            </h2>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Recebemos uma solicitação para redefinir a senha da sua conta na plataforma <strong>Bora Expandir</strong>.
            </p>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Se você não fez esta solicitação, pode ignorar este email com segurança. Sua senha atual permanecerá a mesma.
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:32px 0;">
                <a href="${params.resetUrl}"
                   style="display:inline-block;background:#076CA5;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                    Redefinir Minha Senha
                </a>
            </div>

            <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 16px;text-align:center;">
                Este link expirará em breve por motivos de segurança.
            </p>

            <p style="color:#999;font-size:12px;text-align:center;margin:24px 0 0;">
                © ${new Date().getFullYear()} Bora Expandir — Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>
        `.trim()

        try {
            const transporter = this.getTransporter()
            await transporter.sendMail({
                from: `"Bora Expandir" <${from}>`,
                to: params.to,
                subject: '🔑 Recuperação de Senha — Bora Expandir',
                html
            })
            console.log(`[EmailService] Email de recuperação enviado para ${params.to}`)
        } catch (error) {
            console.error('[EmailService] Erro ao enviar email de recuperação:', error)
            throw error
        }
    }
}

export default new EmailService()
