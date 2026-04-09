import { Folder, ChevronDown, ChevronUp, Upload } from 'lucide-react'
import { Badge } from '@/modules/shared/components/ui/badge'
import { cn } from '../../lib/utils'

interface FamilyMember {
  id: string
  name: string
  email?: string
  type: string
  isTitular?: boolean
  clienteId?: string
}

interface FolderCardHeaderProps {
  member: FamilyMember
  isExpanded: boolean
  hasSentDocuments: boolean
  hasRejected: boolean
  stats: {
    rejected: number
    waitingAction: number
    analyzing: number
    completed: number
  }
  onClick: () => void
}

export function FolderCardHeader({
  member,
  isExpanded,
  hasSentDocuments,
  hasRejected,
  stats,
  onClick,
}: FolderCardHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 p-4 cursor-pointer transition-colors border-b backdrop-blur-sm",
        !hasSentDocuments
          ? 'bg-gray-50/95 dark:bg-gray-900/90'
          : hasRejected
            ? 'bg-red-50/95 dark:bg-red-900/90'
            : 'bg-white/95 dark:bg-gray-800/95',
        "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Folder Icon */}
          <div
            className={cn(
              "p-3 rounded-xl",
              !hasSentDocuments
                ? 'bg-gray-200 dark:bg-gray-700'
                : hasRejected
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-blue-50 dark:bg-blue-900/20'
            )}
          >
            <Folder
              className={cn(
                "h-8 w-8",
                !hasSentDocuments
                  ? 'text-gray-400'
                  : hasRejected
                    ? 'text-red-500'
                    : 'text-blue-500'
              )}
            />
          </div>

          {/* Member Info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{member.name}</h3>
              {member.isTitular && (
                <Badge
                  variant="default"
                  className="text-[10px] px-2 py-0.5 bg-blue-600 hover:bg-blue-700"
                >
                  Titular
                </Badge>
              )}
              {!hasSentDocuments && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  Pendente envio
                </Badge>
              )}
              {hasRejected && (
                <Badge variant="destructive" className="text-[10px] px-2 py-0.5 animate-pulse">
                  Ação Necessária
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{member.type}</p>
          </div>
        </div>

        {/* Stats + Expand Icon */}
        <div className="flex items-center gap-6">
          {/* Mini Stats - Only show if has documents */}
          {hasSentDocuments && (
            <div className="hidden sm:flex items-center gap-4 text-sm">
              {stats.rejected > 0 && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-red-600">{stats.rejected}</span>
                    <span className="text-[10px] text-gray-400">Rejeitados</span>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                </>
              )}
              <div className="flex flex-col items-center">
                <span className="font-bold text-amber-600">{stats.waitingAction}</span>
                <span className="text-[10px] text-gray-400">Aguardam Ação</span>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-blue-600">{stats.analyzing}</span>
                <span className="text-[10px] text-gray-400">Em Análise</span>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-green-600">{stats.completed}</span>
                <span className="text-[10px] text-gray-400">Concluídos</span>
              </div>
            </div>
          )}

          {/* Icon - Upload for new, Expand for existing */}
          <div
            className={cn(
              "p-2 rounded-full transition-colors",
              !hasSentDocuments
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : isExpanded
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            {!hasSentDocuments ? (
              <Upload className="h-5 w-5 text-blue-600" />
            ) : isExpanded ? (
              <ChevronUp className="h-5 w-5 text-blue-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
