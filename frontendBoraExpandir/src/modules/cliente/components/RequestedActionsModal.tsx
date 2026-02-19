'use client'

import { X, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Notification } from '../types'
import { formatDate } from '../lib/utils'
import { Badge } from './ui/badge'

interface RequestedActionsModalProps {
    isOpen: boolean
    onClose: () => void
    notifications: Notification[]
}

export function RequestedActionsModal({ isOpen, onClose, notifications }: RequestedActionsModalProps) {
    if (!isOpen) return null

    // Filter actions
    const now = new Date()

    // Helper to get date object from notification
    const getDeadline = (n: Notification) => {
        if (n.data_prazo) return new Date(n.data_prazo)
        if ((n as any).deadline) return new Date((n as any).deadline)
        return null
    }

    const pendingActions = notifications.filter(n => !(n.lida || n.read))
    const realizedActions = notifications.filter(n => n.lida || n.read)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animation-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="bg-white dark:bg-neutral-900 p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Ações Solicitadas
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Histórico de solicitações e pendências do Jurídico
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-neutral-900/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Action Column: Expired / Pending */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-red-600 dark:text-red-400 mb-4">
                                <AlertTriangle className="w-5 h-5" />
                                Ações Pendentes
                            </h3>

                            {pendingActions.length === 0 ? (
                                <div className="text-center py-8 bg-white dark:bg-neutral-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-400 text-sm">Nenhuma ação pendente</p>
                                </div>
                            ) : (
                                pendingActions.map((action: Notification) => {
                                    const deadline = getDeadline(action)
                                    const isExpired = deadline && deadline < now
                                    return (
                                        <div
                                            key={action.id}
                                            className={`bg-white dark:bg-neutral-800 p-4 rounded-xl border shadow-sm relative overflow-hidden ${
                                                isExpired ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            <div className={`absolute top-0 left-0 w-1 h-full ${isExpired ? 'bg-red-500' : 'bg-yellow-500'}`}></div>

                                            <div className="ml-2">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                                        {action.titulo || action.title || 'Solicitação'}
                                                    </h4>
                                                    <Badge 
                                                        variant={isExpired ? "destructive" : "secondary"} 
                                                        className={`uppercase text-[10px] ${!isExpired ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}`}
                                                    >
                                                        {isExpired ? 'Expirado' : 'Pendente'}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                                    {action.mensagem || action.message}
                                                </p>

                                                <div className={`${isExpired ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30'} rounded-lg p-3 border`}>
                                                    <p className={`text-xs ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-500'} font-medium mb-1`}>
                                                        Prazo limite: {deadline ? formatDate(deadline) : 'N/A'}
                                                    </p>
                                                    {deadline && isExpired && (
                                                        <div className="text-red-600 font-bold text-xs mt-1">
                                                            Prazo Expirado
                                                        </div>
                                                    )}
                                                    {deadline && !isExpired && (
                                                         <div className="text-yellow-600 font-medium text-xs mt-1">
                                                            Aguardando ação
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Action Column: Realized / History */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
                                <CheckCircle className="w-5 h-5" />
                                Ações Realizadas
                            </h3>

                            {realizedActions.length === 0 ? (
                                <div className="text-center py-8 bg-white dark:bg-neutral-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-400 text-sm">Nenhuma ação realizada recentemente</p>
                                </div>
                            ) : (
                                realizedActions.map((action) => (
                                    <div
                                        key={action.id}
                                        className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm opacity-75 hover:opacity-100 transition-opacity"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {action.titulo || action.title || 'Solicitação'}
                                            </h4>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                Concluído
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                                            {action.mensagem || action.message}
                                        </p>

                                        <div className="flex items-center text-xs text-green-600 dark:text-green-500">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            <span>Realizado</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}
