import React from 'react'
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import type { TraducaoItem } from '../types'

interface UrgencyBadgeProps {
  prazoSLA: string
}

export function UrgencyBadge({ prazoSLA }: UrgencyBadgeProps) {
  const agora = new Date()
  const prazo = new Date(prazoSLA)
  const diffMs = prazo.getTime() - agora.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  let color = 'bg-green-500 dark:bg-green-600'
  let label = 'No Prazo'

  if (diffHours < 0) {
    color = 'bg-red-600 dark:bg-red-700'
    label = 'Atrasado'
  } else if (diffHours < 4) {
    color = 'bg-red-500 dark:bg-red-600'
    label = 'Urgente'
  } else if (diffHours < 24) {
    color = 'bg-yellow-500 dark:bg-yellow-600'
    label = 'Atenção'
  }

  return (
    <div className={`w-3 h-3 rounded-full ${color}`} title={label} />
  )
}

interface CountdownBadgeProps {
  prazoSLA: string
}

export function CountdownBadge({ prazoSLA }: CountdownBadgeProps) {
  const agora = new Date()
  const prazo = new Date(prazoSLA)
  const diffMs = prazo.getTime() - agora.getTime()

  if (diffMs < 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
        Atrasado
      </span>
    )
  }

  const horas = Math.floor(diffMs / (1000 * 60 * 60))
  const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
      {horas}h {minutos}m
    </span>
  )
}

interface SLACardProps {
  titulo: string
  valor: number
  icon: React.ReactNode
  cor: string
}

export function SLACard({ titulo, valor, icon, cor }: SLACardProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{titulo}</h3>
        <div className={`p-2 ${cor} rounded-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{valor}</p>
    </div>
  )
}
