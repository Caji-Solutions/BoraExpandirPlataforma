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
                console.warn('[EmailService] Variáveis SMTP não configuradas. Emails não serão enviados.')
                // Retorna um transporter "fantasma" que apenas faz log
                return {
                    sendMail: async (opts: any) => {
                        console.log('[EmailService] (SMTP não configurado) Email simulado:', {
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

        return this.transporter
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
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3010'
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
     * Envia email para o cliente definir a senha (após confirmação de pagamento PIX)
     */
    async sendPasswordSetupEmail(params: {
        to: string
        clientName: string
        resetLink: string
        email: string
    }): Promise<void> {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@boraexpandir.com'

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Defina sua senha - Bora Expandir</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#076CA5 0%,#0A8FD4 100%);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Bora Expandir 🚀</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Acesso Liberado</p>
        </div>

        <!-- Content -->
        <div style="padding:32px;">
            <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:22px;">
                Olá, ${params.clientName}! 👋
            </h2>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Sua conta na plataforma <strong>Bora Expandir</strong> foi ativada com sucesso!
                Seu pagamento foi confirmado e seu acesso está liberado.
            </p>

            <div style="background:#f0f7fc;border:1px solid #d0e7f5;border-radius:12px;padding:20px;margin:0 0 24px;">
                <p style="color:#076CA5;font-weight:700;margin:0 0 12px;font-size:14px;">📧 Seu e-mail de acesso:</p>
                <p style="color:#333;margin:0;font-size:14px;"><strong>${params.email}</strong></p>
            </div>

            <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Para começar, clique no botão abaixo para definir sua senha de acesso segura:
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:32px 0;">
                <a href="${params.resetLink}" 
                   style="display:inline-block;background:#076CA5;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                    Definir Minha Senha
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
                subject: '🚀 Acesso Liberado — Defina sua senha na Bora Expandir',
                html
            })
            console.log(`[EmailService] Email de setup de senha enviado para ${params.to}`)
        } catch (error) {
            console.error('[EmailService] Erro ao enviar email de setup de senha:', error)
            throw error
        }
    }
}

export default new EmailService()
