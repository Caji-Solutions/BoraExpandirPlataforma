'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Target, CreditCard, Copy, Check } from 'lucide-react'
import { Button } from '@/modules/shared/components/ui/button'
import { clienteService } from '../../services/clienteService'
import { getClientTimezone } from './TimezoneSelector'
import { cn } from '../../lib/utils'

interface AppointmentReminderProps {
  appointmentDate: string // ISO string format
  appointmentTime: string // "HH:MM" format
  service: string
  location?: string
  meetLink?: string | null
  status?: string
  pagamentoStatus?: string | null
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
  pagamentoStatus,
  checkoutUrl: initialCheckoutUrl,
  agendamentoId
}: AppointmentReminderProps) {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [currentCheckoutUrl, setCurrentCheckoutUrl] = useState(initialCheckoutUrl)
  const [copied, setCopied] = useState(false)

  // Mapeador de Status para Cores e Textos
  const getStatusVisuals = (status?: string, pagStatus?: string | null) => {
    const s = status?.toLowerCase() || ''
    const p = pagStatus?.toLowerCase() || ''

    // Se o pagamento for recusado, o alerta precisa ser alto (Vermelho)
    if (p === 'recusado') {
      return { label: 'Pagamento Recusado', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' }
    }

    switch (s) {
      case 'confirmado':
      case 'agendado':
      case 'realizado':
        return { label: s.charAt(0).toUpperCase() + s.slice(1), color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' }
      
      case 'pendente':
      case 'recebido':
      case 'aguardando_verificacao':
      case 'conflito':
        return { label: s.replace(/_/g, ' ').charAt(0).toUpperCase() + s.replace(/_/g, ' ').slice(1), color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
      
      case 'cancelado':
      case 'cancelada':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' }
      
      default:
        return { label: s || 'Agendado', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' }
    }
  }

  const statusVisual = getStatusVisuals(status, pagamentoStatus)

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

  const isCancelled = status?.toLowerCase() === 'cancelada' || status?.toLowerCase() === 'cancelado'
  const isPaid = status?.toLowerCase() === 'confirmado' || pagamentoStatus?.toLowerCase() === 'aprovado'

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
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="flex items-center space-x-2 text-xs uppercase tracking-wider font-bold text-blue-900 dark:text-blue-100">
            <Calendar className="h-3 w-3" />
            <span>Próximo Agendamento</span>
          </CardTitle>
          
          {/* Badge de Status Dinâmico */}
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold shadow-sm",
            statusVisual.color
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusVisual.dot)} />
            {statusVisual.label}
          </div>
        </div>
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
              </div>
            </div>
          </div>
          
          {meetLink && (
            <div className="pt-3 flex flex-col space-y-2">
              <a 
                href={meetLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-semibold py-2.5 px-4 rounded-xl transition-colors border border-blue-200 dark:border-blue-800 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 87.5 72" className="h-5 w-5 shrink-0" aria-label="Google Meet">
                  <path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.08-2-16.75-11.69 6.44z"/>
                  <path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z"/>
                  <path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z"/>
                  <path fill="#2684fc" d="M20.5 20.5H0v31h20.5z"/>
                  <path fill="#00ac47" d="M82.6 8.68L69.5 19.25v33.83l13.16 10.61c1.98 1.54 4.84.135 4.84-2.37V11c0-2.535-2.9-3.925-4.9-2.32z"/>
                  <path fill="#00ac47" d="M49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V45.08z"/>
                  <path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.75V6c0-3.315-2.685-6-6-6z"/>
                </svg>
                <span>Entrar na Reunião</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium py-1 transition-colors"
                title={copied ? 'Copiado!' : 'Copiar link da reunião'}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Link copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar link alternativo</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {!isPaid && !isCancelled && (
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
