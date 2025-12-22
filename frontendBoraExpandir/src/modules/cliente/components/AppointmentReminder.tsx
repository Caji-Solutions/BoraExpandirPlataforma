'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface AppointmentReminderProps {
  appointmentDate: string // ISO string format
  appointmentTime: string // "HH:MM" format
  service: string
  location?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

export function AppointmentReminder({ 
  appointmentDate, 
  appointmentTime, 
  service,
  location = "Online - WhatsApp/Zoom"
}: AppointmentReminderProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const [appointmentHours, appointmentMinutes] = appointmentTime.split(':').map(Number)
      const appointmentDateTime = new Date(appointmentDate)
      appointmentDateTime.setHours(appointmentHours, appointmentMinutes, 0, 0)

      const diff = appointmentDateTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true
        })
        return
      }


      const daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hoursRemaining = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secondsRemaining = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({
        days: daysRemaining,
        hours: hoursRemaining,
        minutes: minutesRemaining,
        seconds: secondsRemaining,
        isPast: false
      })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [appointmentDate, appointmentTime])

  if (timeRemaining.isPast) {
    return null // Não mostra se o agendamento já passou
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
          <Calendar className="h-5 w-5" />
          <span>Seu Próximo Agendamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Info */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Serviço</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{service}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Data e Hora</p>
              <p className="text-sm text-gray-900 dark:text-white capitalize">{formatDate(appointmentDate)}</p>
              <p className="text-sm text-gray-900 dark:text-white">{appointmentTime}</p>
            </div>
          </div>

          {location && (
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Local</p>
                <p className="text-sm text-gray-900 dark:text-white">{location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
            Falta apenas:
          </p>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {timeRemaining.days}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {timeRemaining.days === 1 ? 'Dia' : 'Dias'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {String(timeRemaining.hours).padStart(2, '0')}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Horas</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Min</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Seg</p>
            </div>
          </div>
        </div>

        {/* Alert for soon appointments */}
        {timeRemaining.days === 0 && timeRemaining.hours < 2 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 text-center">
              ⚠️ Seu agendamento está próximo! Prepare-se.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
