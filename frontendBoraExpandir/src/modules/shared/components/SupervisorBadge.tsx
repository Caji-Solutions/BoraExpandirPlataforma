import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserCheck, Users, AlertTriangle } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

interface Member {
  id: string
  full_name: string
  nivel?: string | null
  role?: string
}

export function SupervisorBadge() {
  const { activeProfile, token } = useAuth()
  const [supervisorName, setSupervisorName] = useState<string | null>(null)
  const [subordinates, setSubordinates] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const isSupervisor = activeProfile?.is_supervisor || false
  const supervisorId = activeProfile?.supervisor_id

  useEffect(() => {
    if (!activeProfile || activeProfile.role === 'super_admin' || activeProfile.role === 'cliente') {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        if (isSupervisor) {
          const res = await fetch(`${BACKEND_URL}/auth/team/delegados/${activeProfile.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
          if (res.ok) {
            const data = await res.json()
            setSubordinates(data)
          }
        } else if (supervisorId) {
          const res = await fetch(`${BACKEND_URL}/auth/team`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
          if (res.ok) {
            const team: Member[] = await res.json()
            const sup = team.find(m => m.id === supervisorId)
            if (sup) setSupervisorName(sup.full_name)
          }
        }
      } catch {
        // silently ignore network errors
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeProfile?.id, isSupervisor, supervisorId, token])

  if (!activeProfile || activeProfile.role === 'super_admin' || activeProfile.role === 'cliente') {
    return null
  }

  if (loading) {
    return <div className="h-8 w-44 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
  }

  // Supervisor: show their team
  if (isSupervisor) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-lg">
          <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
            Minha Equipe
          </span>
          <span className="text-xs font-medium text-indigo-500 dark:text-indigo-500">
            · {subordinates.length} colaborador{subordinates.length !== 1 ? 'es' : ''}
          </span>
        </div>
        {subordinates.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-1.5 max-w-sm">
            {subordinates.map(sub => (
              <div
                key={sub.id}
                className="flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full"
              >
                <span className="text-[11px] font-medium text-gray-700 dark:text-neutral-200">
                  {sub.full_name.split(' ')[0]}
                </span>
                {sub.nivel && (
                  <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400">
                    {sub.nivel}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-gray-400 dark:text-neutral-500 italic">
            Nenhum colaborador atribuido
          </span>
        )}
      </div>
    )
  }

  // Collaborator with supervisor
  if (supervisorId) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-lg">
        <UserCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
          Supervisor: {supervisorName ?? '...'}
        </span>
      </div>
    )
  }

  // Collaborator without supervisor (temporary error state)
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800/40 rounded-lg">
      <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
      <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
        SEM SUPERVISOR
      </span>
    </div>
  )
}
