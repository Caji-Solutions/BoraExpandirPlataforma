'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { PendingAction } from '../../types'
import { formatDate } from '../../lib/utils'
import { CountdownTimer } from '../scheduling/CountdownTimer'

interface RequiredActionModalProps {
    isOpen: boolean
    onClose: () => void
    actions: PendingAction[]
}

export function RequiredActionModal({ isOpen, onClose, actions }: RequiredActionModalProps) {
    const [inputValue, setInputValue] = useState('')
    const [canClose, setCanClose] = useState(false)

    useEffect(() => {
        if (inputValue.toLowerCase() === 'fechar') {
            setCanClose(true)
        } else {
            setCanClose(false)
        }
    }, [inputValue])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-red-200 dark:border-red-900 animation-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-red-50 dark:bg-red-900/20 p-6 border-b border-red-100 dark:border-red-900/50 flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full flex-shrink-0">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
                            Ações Necessárias
                        </h2>
                        <p className="text-red-600/80 dark:text-red-400/80 mt-1">
                            Existem pendências importantes que requerem sua atenção imediata.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                        {actions.map((action) => (
                            <div
                                key={action.id}
                                className="p-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        {action.title}
                                    </h3>
                                    {action.priority === 'high' && (
                                        <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wide">
                                            Urgente
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-3">
                                    {action.description}
                                </p>
                                {action.deadline && (
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-800 p-2 rounded-lg border border-gray-100 dark:border-neutral-700 inline-block mb-3">
                                        <span className="font-medium mr-2">Prazo Limite:</span>
                                        {formatDate(action.deadline)}
                                    </div>
                                )}
                                <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg border border-gray-100 dark:border-neutral-700">
                                    {action.deadline ? (
                                        <CountdownTimer targetDate={action.deadline} variant="red" />
                                    ) : (
                                        <div className="text-center py-2 text-sm text-gray-500 font-medium">
                                            Aguardando sua ação imediata
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Para continuar, digite <span className="font-bold text-red-600 dark:text-red-400">"fechar"</span> abaixo:
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="fechar"
                                className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            />
                            <button
                                onClick={onClose}
                                disabled={!canClose}
                                className={`px-6 py-3 rounded-xl font-bold transition-all ${canClose
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg cursor-pointer'
                                    : 'bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Confirmar Leitura
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
