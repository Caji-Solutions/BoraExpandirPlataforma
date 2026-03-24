'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Target, CreditCard } from 'lucide-react'
import { Button } from '@/modules/shared/components/ui/button'
import { clienteService } from '../../services/clienteService'
import { getClientTimezone } from './TimezoneSelector'

interface AppointmentReminderProps {
  appointmentDate: string // ISO string format
  appointmentTime: string // "HH:MM" format
  service: string
  location?: string
  status?: string
  checkoutUrl?: string
  agendamentoId?: string
}

export function AppointmentReminder({
  appointmentDate,
  appointmentTime,
  service,
  location = "Online - WhatsApp/Zoom",
  status = "agendado",
  checkoutUrl: initialCheckoutUrl,
  agendamentoId
}: AppointmentReminderProps) {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [currentCheckoutUrl, setCurrentCheckoutUrl] = useState(initialCheckoutUrl)

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
            <div>
              <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                {formatDate(appointmentDate)}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formatTime(appointmentTime)} ({location})
              </p>
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
