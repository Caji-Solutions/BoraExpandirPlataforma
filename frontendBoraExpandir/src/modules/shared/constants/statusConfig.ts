import {
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'

/**
 * Canonical badge variants supported by the Badge component.
 */
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'

/**
 * Shape of a single document status configuration entry.
 */
export interface DocumentStatusConfig {
  /** Lucide icon to display alongside the status */
  icon: LucideIcon
  /** Human-readable label (Portuguese) */
  label: string
  /** Tailwind text colour class */
  color: string
  /** Tailwind background colour class */
  bgColor: string
  /** Badge variant to pass to <Badge variant={…}> */
  badge: BadgeVariant
  /** Short description shown in modals / tooltips */
  description: string
}

/**
 * Single source of truth for all Document['status'] display configuration.
 * Covers every status value defined in the Document interface.
 */
export const documentStatusConfig: Record<string, DocumentStatusConfig> = {
  pending: {
    icon: Clock,
    label: 'Aguardando Envio',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'Documento ainda não foi enviado.',
  },
  analyzing: {
    icon: Clock,
    label: 'Em Análise',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'Nossa equipe está revisando o documento.',
  },
  approved: {
    icon: CheckCircle,
    label: 'Aprovado',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    badge: 'success',
    description: 'Documento aprovado e sendo processado.',
  },
  rejected: {
    icon: X,
    label: 'Rejeitado',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    badge: 'destructive',
    description: 'Documento rejeitado e precisa ser reenviado.',
  },
  waiting_apostille: {
    icon: Clock,
    label: 'Aguardando Apostilamento',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'O documento está aguardando o processo de apostilamento.',
  },
  analyzing_apostille: {
    icon: Clock,
    label: 'Analisando Apostila',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'Estamos analisando a apostila do documento.',
  },
  waiting_translation: {
    icon: Clock,
    label: 'Aguardando Tradução',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'O documento está aguardando tradução juramentada.',
  },
  analyzing_translation: {
    icon: Clock,
    label: 'Analisando Tradução',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'Estamos analisando a tradução do documento.',
  },
  waiting_translation_quote: {
    icon: Clock,
    label: 'Aguardando Orçamento',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'Estamos aguardando o orçamento da tradução.',
  },
  waiting_quote_approval: {
    icon: Clock,
    label: 'Aguardando Aprovação',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'O orçamento da tradução está aguardando sua aprovação.',
  },
  waiting_apostille_quote: {
    icon: Clock,
    label: 'Aguardando Orçamento',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'Estamos aguardando o orçamento do apostilamento.',
  },
  sent_for_apostille: {
    icon: Clock,
    label: 'Enviado para Apostila',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'O documento foi enviado para o processo de apostilamento.',
  },
  analyzing_translation_payment: {
    icon: Clock,
    label: 'Analisando Pagamento',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'Estamos analisando o comprovante de pagamento da tradução.',
  },
  // uppercase variants (legacy backend values)
  analyzing_apostille_payment: {
    icon: Clock,
    label: 'Analisando Pagamento',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'Estamos analisando o comprovante de pagamento do apostilamento.',
  },
  analyzing_apostille_PAYMENT: {
    icon: Clock,
    label: 'Analisando Pagamento',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'Estamos analisando o comprovante de pagamento do apostilamento.',
  },
  executing_apostille: {
    icon: Clock,
    label: 'Apostilando',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'O documento está sendo apostilado.',
  },
  executing_translation: {
    icon: Clock,
    label: 'Traduzindo',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    badge: 'default',
    description: 'O documento está sendo traduzido.',
  },
  aguardando_pagamento: {
    icon: Clock,
    label: 'Aguardando Pagamento',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    badge: 'warning',
    description: 'Aguardando confirmação de pagamento.',
  },
  pronto_para_apostilagem: {
    icon: CheckCircle,
    label: 'Pronto para Apostilamento',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    badge: 'success',
    description: 'O documento está pronto para ser apostilado.',
  },
}

/** Fallback config used for unknown/unrecognized status values */
const fallbackConfig: DocumentStatusConfig = {
  icon: AlertCircle,
  label: 'Status Desconhecido',
  color: 'text-gray-600',
  bgColor: 'bg-gray-100',
  badge: 'secondary',
  description: 'Status não reconhecido.',
}

/**
 * Safe lookup that normalises the status key to lowercase before looking it up,
 * and returns a sensible fallback for unknown values.
 */
export function getDocumentStatusConfig(status: string): DocumentStatusConfig {
  const key = status?.toLowerCase() ?? ''
  return documentStatusConfig[key] ?? fallbackConfig
}
