import React, { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Phone,
  Copy,
  Check,
  Loader2
} from 'lucide-react'

const PIX_CNPJ = '55.218.947/0001-65'

export type FormStepState =
  | 'loading'
  | 'form'
  | 'submitting'
  | 'success'
  | 'status_aprovado'
  | 'status_em_analise'
  | 'status_pendente'
  | 'status_recusado'
  | 'status_ja_preenchido'
  | 'expirado'
  | 'cancelado'
  | 'bloqueado'
  | 'nao_encontrado'

export type PagamentoStatus = 'pendente' | 'aprovado' | 'em_analise' | 'recusado' | null

interface StatusScreenProps {
  step: FormStepState
  pagamentoStatus?: PagamentoStatus
  comprovanteUrl?: string | null
  emailEnviado?: string
}

export function StatusScreen({ step, pagamentoStatus, comprovanteUrl, emailEnviado }: StatusScreenProps) {
  const [copiedPix, setCopiedPix] = useState(false)

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CNPJ)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 3000)
    } catch {
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 3000)
    }
  }

  // Common wrapper for single-card screens
  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
        {children}
      </div>
    </div>
  )

  switch (step) {
    case 'loading':
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-semibold">Verificando seu agendamento...</p>
            <p className="text-gray-400 mt-2">Aguarde um momento</p>
          </div>
        </div>
      )

    case 'submitting':
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-semibold">Processando seu formulário...</p>
            <p className="text-gray-400 mt-2">Criando sua conta e confirmando o agendamento</p>
          </div>
        </div>
      )

    case 'status_aprovado':
      return (
        <CardWrapper>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Parabéns! 🎉</h1>
          <p className="text-gray-300 text-lg mb-2">
            Sua nova conta na <span className="text-blue-400 font-bold">Bora Expandir</span> foi criada com sucesso!
          </p>
          <p className="text-gray-400 text-sm mb-8">
            O pagamento foi confirmado e suas credenciais de acesso foram enviadas para o seu email.
          </p>
          <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <p className="text-emerald-400 font-bold">Pagamento Aprovado</p>
            </div>
            <p className="text-gray-400 text-sm">
              Verifique sua caixa de entrada (e spam) para encontrar as credenciais de acesso à plataforma.
            </p>
          </div>
        </CardWrapper>
      )

    case 'status_em_analise':
      return (
        <CardWrapper>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Clock className="h-12 w-12 text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Quase lá! ⏳</h1>
          <p className="text-gray-300 text-lg mb-2">
            Seu formulário já foi recebido e o pagamento está sendo verificado pela nossa equipe.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Tenha um pouquinho de paciência — em breve tudo estará pronto!
          </p>
          <div className="bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <p className="text-blue-400 font-bold">Pagamento em Análise</p>
            </div>
            <p className="text-gray-400 text-sm">
              Assim que o comprovante for verificado, você receberá um email com os dados de acesso à plataforma Bora Expandir.
            </p>
          </div>
        </CardWrapper>
      )

    case 'status_pendente':
      return (
        <CardWrapper>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Formulário Recebido! ✅</h1>
          <p className="text-gray-300 text-lg mb-2">
            Seus dados foram salvos com sucesso. Agora só falta o pagamento para liberar sua conta!
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Realize o pagamento via PIX usando a chave abaixo e envie o comprovante ao seu consultor.
          </p>

          <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20 mb-6">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Chave PIX (CNPJ)</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-2xl font-bold text-white tracking-wider">{PIX_CNPJ}</code>
              <button
                onClick={handleCopyPix}
                className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-bold hover:bg-amber-500/30 transition-colors flex items-center gap-1"
              >
                {copiedPix ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar</>}
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-blue-400" />
              <p className="text-blue-400 font-semibold">Envie o comprovante ao seu consultor</p>
            </div>
            <p className="text-gray-400 text-sm">
              Após o pagamento, envie o comprovante via WhatsApp para o consultor que lhe atendeu. Sua conta será criada assim que o pagamento for confirmado.
            </p>
          </div>
        </CardWrapper>
      )

    case 'status_recusado':
      return (
        <CardWrapper>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Pagamento Recusado 😔</h1>
          <p className="text-gray-300 text-lg mb-2">
            Infelizmente, o pagamento referente à sua consultoria foi recusado.
          </p>
          <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <p className="text-emerald-400 font-bold">Seus dados foram salvos!</p>
            </div>
            <p className="text-gray-400 text-sm">
              Você <strong className="text-white">não precisa preencher o formulário novamente</strong>. Seus dados estão seguros em nosso sistema.
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-blue-400" />
              <p className="text-blue-400 font-semibold">Entre em contato com seu consultor</p>
            </div>
            <p className="text-gray-400 text-sm">
              Para resolver essa questão, entre em contato com o consultor que lhe atendeu via WhatsApp ou email.
            </p>
          </div>
        </CardWrapper>
      )

    case 'expirado':
      return (
        <CardWrapper>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <Clock className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Formulário Expirado ⏰</h1>
          <p className="text-gray-300 text-lg mb-6">
            O prazo para preenchimento deste formulário encerrou. O formulário deve ser enviado com pelo menos 1 hora de antecedência da reunião.
          </p>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-blue-400" />
              <p className="text-blue-400 font-semibold">Entre em contato com seu consultor</p>
            </div>
            <p className="text-gray-400 text-sm">
              Fale com o consultor que lhe atendeu para remarcar ou obter um novo link.
            </p>
          </div>
        </CardWrapper>
      )

    case 'bloqueado':
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-red-500/30 p-10 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Formulário Indisponível 🚫</h1>
            <p className="text-gray-300 text-lg mb-4">
              Este formulário não está mais disponível para preenchimento.
            </p>
            <div className="bg-red-500/10 rounded-2xl p-5 border border-red-500/20 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-400 font-bold">Agendamento bloqueado</p>
              </div>
              <p className="text-gray-400 text-sm">
                O formulário não foi preenchido dentro do prazo estipulado (até 1 hora antes da reunião) e o agendamento foi cancelado automaticamente pelo sistema.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <p className="text-blue-400 font-semibold">Entre em contato com seu consultor</p>
              </div>
              <p className="text-gray-400 text-sm">
                Para remarcar sua consultoria, entre em contato com o consultor que lhe atendeu via WhatsApp ou email.
              </p>
            </div>
          </div>
        </div>
      )

    case 'nao_encontrado':
      return (
        <CardWrapper>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-500/20 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Agendamento não encontrado</h1>
          <p className="text-gray-300 text-lg mb-6">
            O link que você acessou parece estar inválido ou o agendamento não existe mais no sistema.
          </p>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-blue-400" />
              <p className="text-blue-400 font-semibold">Precisa de ajuda?</p>
            </div>
            <p className="text-gray-400 text-sm">
              Entre em contato com a equipe comercial solicitando um novo link para o seu formulário.
            </p>
          </div>
        </CardWrapper>
      )

    case 'cancelado':
      return (
        <CardWrapper>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Agendamento Cancelado</h1>
          <p className="text-gray-300 text-lg mb-6">
            Este agendamento foi cancelado. Para agendar novamente, entre em contato com nosso time comercial.
          </p>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-blue-400" />
              <p className="text-blue-400 font-semibold">Fale com nosso time</p>
            </div>
            <p className="text-gray-400 text-sm">
              Entre em contato pelo WhatsApp ou email para remarcar sua consultoria.
            </p>
          </div>
        </CardWrapper>
      )

    case 'status_ja_preenchido':
      return (
        <CardWrapper>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Formulário já preenchido! ✅</h1>
          <p className="text-gray-300 text-lg mb-2">
            Seus dados já foram recebidos com sucesso pelo nosso sistema.
          </p>
          <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 mb-6">
            <p className="text-gray-400 text-sm">
              Você não precisa preencher este formulário novamente. Se tiver alguma dúvida, entre em contato com seu consultor.
            </p>
          </div>
        </CardWrapper>
      )

    case 'success':
      return (
        <CardWrapper>
          {pagamentoStatus === 'recusado' ? (
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
          ) : pagamentoStatus === 'pendente' ? (
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-400" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
          )}

          <h1 className="text-3xl font-bold text-white mb-4">Formulário Enviado! 🎉</h1>

          {comprovanteUrl && pagamentoStatus === 'pendente' ? (
            <>
              <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20 mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <p className="text-amber-400 font-bold text-lg">Comprovante em Análise</p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Seu comprovante de pagamento está sendo verificado pela nossa equipe.
                  Quando a análise for concluída, uma mensagem será enviada para o seu email.
                </p>
              </div>
              <p className="text-blue-400 font-semibold text-lg mb-4">
                📧 {emailEnviado}
              </p>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <p className="text-gray-400 text-sm">
                  Aguarde a verificação do comprovante. Você receberá um email com as credenciais de acesso à plataforma assim que for aprovado.
                </p>
              </div>
            </>
          ) : comprovanteUrl && pagamentoStatus === 'aprovado' ? (
            <>
              <p className="text-gray-300 text-lg mb-2">
                Pagamento confirmado! As informações da sua consultoria foram enviadas para o seu email.
              </p>
              <p className="text-blue-400 font-semibold text-lg mb-8">
                📧 {emailEnviado}
              </p>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <p className="text-gray-400 text-sm">
                  Verifique sua caixa de entrada (e spam) para encontrar as credenciais de acesso à sua área do cliente na plataforma Bora Expandir.
                </p>
              </div>
            </>
          ) : comprovanteUrl && pagamentoStatus === 'recusado' ? (
            <>
              <div className="bg-red-500/10 rounded-2xl p-5 border border-red-500/20 mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-red-400 font-bold text-lg">Comprovante Recusado</p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Infelizmente, seu comprovante de pagamento não foi aprovado.
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <p className="text-blue-400 font-semibold">Entre em contato com um de nossos consultores</p>
                </div>
                <p className="text-gray-400 text-sm">
                  Para resolver essa questão, entre em contato com nossa equipe pelo WhatsApp ou email.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-300 text-lg mb-2">
                As informações da sua consultoria foram enviadas para o seu email.
              </p>
              <p className="text-blue-400 font-semibold text-lg mb-8">
                📧 {emailEnviado}
              </p>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <p className="text-gray-400 text-sm">
                  Verifique sua caixa de entrada (e spam) para encontrar as credenciais de acesso à sua área do cliente na plataforma Bora Expandir.
                </p>
              </div>
            </>
          )}
        </CardWrapper>
      )

    default:
      return null
  }
}
