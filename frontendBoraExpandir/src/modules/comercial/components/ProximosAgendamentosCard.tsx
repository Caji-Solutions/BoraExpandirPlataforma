import React from 'react'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Agendamento } from '../../../types/comercial'

interface ProximosAgendamentosCardProps {
  agendamentos: Agendamento[]
}

export default function ProximosAgendamentosCard({ agendamentos }: ProximosAgendamentosCardProps) {
  const navigate = useNavigate()
  
  const proximosAgendamentos = agendamentos
    .filter(a => a.status === 'agendado')
    .sort((a, b) => new Date(a.data + ' ' + a.hora).getTime() - new Date(b.data + ' ' + b.hora).getTime())
    .slice(0, 3)

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Próximos Agendamentos</h3>
        <button
          onClick={() => navigate('/comercial/meus-agendamentos')}
          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          title="Ver todos os agendamentos"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {proximosAgendamentos.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-8 w-8 text-gray-300 dark:text-neutral-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Nenhum agendamento próximo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proximosAgendamentos.map(agendamento => (
            <div
              key={agendamento.id}
              className="p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {agendamento.cliente?.nome}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {agendamento.hora}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                    {agendamento.produto}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
