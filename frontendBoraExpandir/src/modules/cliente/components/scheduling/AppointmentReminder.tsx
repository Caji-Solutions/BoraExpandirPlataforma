'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Target, CreditCard, Copy, Check } from 'lucide-react'
import { Button } from '@/modules/shared/components/ui/button'
import { clienteService } from '../../services/clienteService'
import { getClientTimezone } from './TimezoneSelector'

interface AppointmentReminderProps {
  appointmentDate: string // ISO string format
  appointmentTime: string // "HH:MM" format
  service: string
  location?: string
  meetLink?: string | null
  status?: string
  checkoutUrl?: string
  agendamentoId?: string
}

export function AppointmentReminder({
  appointmentDate,
  appointmentTime,
  service,
  location = "Online - WhatsApp/Zoom",
  meetLink,
  status = "agendado",
  checkoutUrl: initialCheckoutUrl,
  agendamentoId
}: AppointmentReminderProps) {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [currentCheckoutUrl, setCurrentCheckoutUrl] = useState(initialCheckoutUrl)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    const linkToCopy = meetLink || location
    try {
      await navigator.clipboard.writeText(linkToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback silencioso
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const tz = getClientTimezone()
      return new Intl.DateTimeFormat('pt-BR', {
        timeZone: tz,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(dateStr))
    } catch (e) {
      return dateStr
    }
  }

  const formatTime = (timeStr: string) => {
    try {
      const tz = getClientTimezone()
      const date = new Date(`1970-01-01T${timeStr}:00`)
      return new Intl.DateTimeFormat('pt-BR', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch {
      return timeStr
    }
  }

  const isCancelled = status === 'cancelada' || status === 'cancelado'
  const isPaid = status === 'aprovado' || status === 'pago' || status === 'confirmado'

  const handlePay = async () => {
    if (currentCheckoutUrl) {
      window.location.href = currentCheckoutUrl
      return
    }

    if (!agendamentoId) return

    try {
      setIsGeneratingLink(true)
      const newUrl = await clienteService.recreateCheckout(agendamentoId)
      setCurrentCheckoutUrl(newUrl)
      window.location.href = newUrl
    } catch (error) {
      console.error('Erro ao gerar novo checkout:', error)
      alert('Não foi possível gerar o link de pagamento. Tente novamente mais tarde.')
    } finally {
      setIsGeneratingLink(false)
    }
  }

  return (
    <Card className="relative overflow-hidden border shadow-lg transition-all h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2 text-sm uppercase tracking-wider font-bold text-blue-900 dark:text-blue-100">
          <Calendar className="h-4 w-4" />
          <span>Próximo Agendamento</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Target className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:white">
                {service}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                {formatDate(appointmentDate)}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-700 dark:text-gray-300">{formatTime(appointmentTime)}</span>
                {meetLink && (
                  <div className="ml-auto flex items-center gap-2">
                    {/* Google Meet icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 87.5 72" className="h-4 w-4 shrink-0" aria-label="Google Meet">
                      <path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.08-2-16.75-11.69 6.44z"/>
                      <path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z"/>
                      <path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z"/>
                      <path fill="#2684fc" d="M20.5 20.5H0v31h20.5z"/>
                      <path fill="#00ac47" d="M82.6 8.68L69.5 19.25v33.83l13.16 10.61c1.98 1.54 4.84.135 4.84-2.37V11c0-2.535-2.9-3.925-4.9-2.32z"/>
                      <path fill="#00ac47" d="M49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V45.08z"/>
                      <path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.75V6c0-3.315-2.685-6-6-6z"/>
                    </svg>
                    {/* Botao copiar link */}
                    <button
                      onClick={handleCopyLink}
                      title={copied ? 'Copiado!' : 'Copiar link da reuniao'}
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {status === 'agendado' && (
          <div className="pt-2">
            <Button 
              onClick={handlePay}
              disabled={isGeneratingLink}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-md shadow-blue-500/20"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isGeneratingLink ? 'Gerando Link...' : 'Pagar Agora'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
