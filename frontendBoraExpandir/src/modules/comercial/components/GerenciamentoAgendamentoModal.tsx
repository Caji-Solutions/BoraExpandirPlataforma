import React, { useState, useEffect } from 'react'
import { X, FileText, CheckCircle, AlertCircle, Upload } from 'lucide-react'
import type { Agendamento } from '../../../types/comercial'
import { Badge } from '../../../components/ui/Badge'
import { useToast } from '../../../components/ui/Toast'

interface Props {
    agendamento: Agendamento & { comprovante_url?: string }
    onClose: () => void
    onAtualizado: () => void
}

export function GerenciamentoAgendamentoModal({ agendamento, onClose, onAtualizado }: Props) {
    const { success, error: toastError, info } = useToast()

    // Status Local
    const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(agendamento.comprovante_url || null)
    const [formularioPreenchido, setFormularioPreenchido] = useState(false)
    const [loadingFormCheck, setLoadingFormCheck] = useState(true)
    const [loadingConvert, setLoadingConvert] = useState(false)

    // TODO: Buscar o status do formulário do backend
    useEffect(() => {
        async function checkFormulario() {
            // Mock verificação
            setTimeout(() => {
                setFormularioPreenchido(true) // Assumindo true para testar
                setLoadingFormCheck(false)
            }, 1000)
        }
        checkFormulario()
    }, [agendamento.id])

    const handleUploadComprovante = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // TODO: Chamar rota de upload do backend
        info('Fazendo upload do comprovante...')
        setTimeout(() => {
            setComprovanteUrl(URL.createObjectURL(file))
            success('Comprovante enviado com sucesso!')
        }, 1500)
    }

    const handleConverterCliente = async () => {
        setLoadingConvert(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comercial/agendamento/${agendamento.id}/confirmar-pix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.message || 'Erro ao processar confirmação.')
            }

            success('Lead convertido em Cliente com sucesso! Link de setup de senha enviado para o e-mail.')
            onAtualizado()
            onClose()
        } catch (err: any) {
            toastError(err.message || 'Erro ao converter cliente.')
        } finally {
            setLoadingConvert(false)
        }
    }

    const isCardButtonEnabled = comprovanteUrl && formularioPreenchido

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-800 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciamento: Conversão de Lead</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Agendamento ID: {agendamento.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-neutral-800 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                    {/* Header Resumo */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-2xl font-bold">
                            {agendamento.cliente?.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{agendamento.cliente?.nome}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{agendamento.produto} - {agendamento.data} às {agendamento.hora}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Box: Comprovante Pix */}
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-5 rounded-xl border border-gray-200 dark:border-neutral-700">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">Pagamento Pix</h4>
                            </div>

                            {comprovanteUrl ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-medium text-sm">Comprovante Recebido</span>
                                    </div>
                                    <a href={comprovanteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                                        Ver Comprovante Anexado
                                    </a>
                                    <button className="px-4 py-2 mt-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-500/20 dark:hover:bg-yellow-500/30 dark:text-yellow-400 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                        <AlertCircle className="h-4 w-4" />
                                        Pedido de Revisão
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                        <AlertCircle className="h-5 w-5" />
                                        <span className="font-medium text-sm">Aguardando Comprovante</span>
                                    </div>
                                    <label className="cursor-pointer px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Anexar Comprovante Manualmente
                                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUploadComprovante} />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Box: Formulário de Consultoria */}
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-5 rounded-xl border border-gray-200 dark:border-neutral-700">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">Formulário de Dados</h4>
                            </div>

                            {loadingFormCheck ? (
                                <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                                    <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                                    <span className="text-sm">Verificando...</span>
                                </div>
                            ) : formularioPreenchido ? (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-medium text-sm">Formulário Preenchido</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="font-medium text-sm">Pendente Preenchimento</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Call to action de conversão */}
                    <div className="pt-4 border-t border-gray-200 dark:border-neutral-800 text-center">
                        <button
                            onClick={handleConverterCliente}
                            disabled={!isCardButtonEnabled || loadingConvert}
                            className={`w-full max-w-sm mx-auto py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isCardButtonEnabled
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {loadingConvert ? (
                                <>
                                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Convertendo...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Confirmar Recebimento e Validar Cliente
                                </>
                            )}
                        </button>
                        {!isCardButtonEnabled && (
                            <p className="text-xs text-gray-500 mt-3 max-w-sm mx-auto">
                                É necessário confirmar o pagamento e aguardar o preenchimento do formulário antes de converter o lead.
                            </p>
                        )}
                        {isCardButtonEnabled && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 max-w-sm mx-auto">
                                Pronto para conversão! O email de boas-vindas do sistema será enviado assim que confirmado.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
