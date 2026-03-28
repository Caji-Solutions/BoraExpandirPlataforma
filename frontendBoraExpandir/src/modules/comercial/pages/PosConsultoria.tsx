import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Phone, Mail, Dna, RefreshCw, Loader2 } from 'lucide-react'
import comercialService from '../services/comercialService'

export default function PosConsultoria() {
    const navigate = useNavigate()
    const [clientes, setClientes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await comercialService.getPosConsultoria()
            setClientes(data)
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-gray-400 animate-pulse">Carregando clientes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pos-Consultoria</h1>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
                        Clientes delegados a voce apos consultoria juridica
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                >
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            {clientes.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-gray-300 dark:text-neutral-600" />
                    </div>
                    <p className="text-base font-semibold text-gray-400 dark:text-neutral-500">Nenhum cliente em pos-consultoria</p>
                    <p className="text-sm text-gray-300 dark:text-neutral-600 mt-1">Os clientes apareceram aqui apos a consultoria juridica ser finalizada</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-700">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contato</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Servico</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Acoes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                            {clientes.map((item: any) => {
                                const cliente = item.clientes || {}
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{cliente.nome || 'N/A'}</p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{cliente.client_id || ''}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {cliente.whatsapp && (
                                                    <a
                                                        href={`tel:${cliente.whatsapp}`}
                                                        className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                                    >
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {cliente.whatsapp}
                                                    </a>
                                                )}
                                                {cliente.email && (
                                                    <a
                                                        href={`mailto:${cliente.email}`}
                                                        className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                                    >
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {cliente.email}
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{item.produto_nome || 'Consultoria'}</p>
                                            {item.data_hora && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(item.data_hora).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/comercial/dna?clienteId=${cliente.id}&tab=timeline`)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition"
                                            >
                                                <Dna className="h-3.5 w-3.5" />
                                                Ver DNA
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
