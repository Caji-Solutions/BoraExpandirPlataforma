import { Badge } from '@/modules/shared/components/ui/badge'
import { getDocumentStatusConfig } from '@/modules/shared/constants/statusConfig'
import { cn } from '@/modules/cliente/lib/utils'

interface StatusBadgeProps {
  /** Any Document['status'] string. Unknown values fall back gracefully. */
  status: string
  /** When true, renders the icon to the left of the label. Default: false */
  showIcon?: boolean
  className?: string
}

/**
 * Reusable badge that renders a Document status using the centralised
 * documentStatusConfig. Accepts any string and falls back gracefully for
 * unknown statuses.
 *
 * @example
 * <StatusBadge status={document.status} />
 * <StatusBadge status="approved" showIcon />
 */
export function StatusBadge({ status, showIcon = false, className }: StatusBadgeProps) {
  const config = getDocumentStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge variant={config.badge} className={cn('inline-flex items-center gap-1', className)}>
      {showIcon && <Icon className="h-3 w-3 shrink-0" />}
      {config.label}
    </Badge>
  )
}
