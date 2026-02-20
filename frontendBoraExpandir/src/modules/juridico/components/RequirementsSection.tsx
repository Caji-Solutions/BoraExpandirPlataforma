import { useState, useEffect } from 'react'
import {
    Briefcase,
    ChevronUp,
    ChevronDown,
    Loader2,
    ClipboardList,
    Clock,
    FilePlus,
    CheckCircle2,
    AlertCircle,
    User
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from '../../../components/ui/Badge'
import { clienteService } from '../../cliente/services/clienteService'
import { formatDate } from '../../cliente/lib/utils'
import { cn } from '@/lib/utils'

interface FamilyMember {
    id: string
    name: string
    type: string
}

interface RequirementsSectionProps {
    processoId: string
    clienteId: string
    members: FamilyMember[]
    onAddRequirement?: () => void
    onAddDocumentToRequirement?: (requirementId: string) => void
}

export function RequirementsSection({
    processoId,
    clienteId,
    members,
    onAddRequirement,
    onAddDocumentToRequirement
}: RequirementsSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [requirements, setRequirements] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchAllRequirements = async () => {
            if (!clienteId) return
            setIsLoading(true)
            try {
                // Fetch requirements for all members
                const allReqs = await clienteService.getRequerimentos(clienteId)
                setRequirements(allReqs)
            } catch (error) {
                console.error('Erro ao buscar todos os requerimentos:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAllRequirements()
    }, [clienteId])

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pendente': return <Clock className="h-4 w-4 text-amber-500" />
            case 'concluido': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            default: return <AlertCircle className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                            Gestão de Requerimentos
                        </h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Serviços extras e solicitações agrupadas
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {requirements.length > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs">
                            {requirements.length}
                        </Badge>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-blue-600" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-blue-600" />
                    )}
                </div>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Action Button */}
                    <Button
                        onClick={onAddRequirement}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 h-10 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                        <FilePlus className="h-3.5 w-3.5 mr-2" />
                        Novo Requerimento Estruturado
                    </Button>


                    {/* Requirements List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : requirements.length === 0 ? (
                        <div className="py-8 text-center bg-white/50 dark:bg-black/20 rounded-xl border border-dashed border-gray-200">
                            <ClipboardList className="h-8 w-8 mx-auto mb-2 text-gray-400 opacity-30" />
                            <p className="text-xs font-medium text-gray-500">Nenhum requerimento ativo</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requirements.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-3">
                                                <div className="mt-1 p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    {getStatusIcon(req.status)}
                                                </div>
                                                <div>
                                                    <h5 className="font-black text-xs uppercase tracking-tight text-gray-900 dark:text-white">
                                                        {req.tipo}
                                                    </h5>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-gray-400 font-bold">
                                                            {formatDate(new Date(req.created_at))}
                                                        </span>
                                                        <Badge variant="outline" className="text-[9px] h-4 font-bold border-blue-100 text-blue-600">
                                                            {req.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onAddDocumentToRequirement?.(req.id)}
                                                className="h-8 px-2 text-blue-600 hover:bg-blue-50 font-bold text-[10px] uppercase"
                                            >
                                                <FilePlus className="h-3.5 w-3.5 mr-1" />
                                                Add Doc
                                            </Button>
                                        </div>

                                        {/* Linked Documents Mini List */}
                                        {req.documentos && req.documentos.length > 0 && (
                                            <div className="mt-4 pl-9 space-y-1.5 border-l-2 border-blue-50 ml-3">
                                                {req.documentos.map((doc: any) => {
                                                    const m = members.find(m => m.id === doc.membroId);
                                                    return (
                                                        <div key={doc.id} className="flex items-center justify-between text-[10px] bg-muted/20 p-2 rounded-lg">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold">{doc.tipo}</span>
                                                                <span className="text-[9px] opacity-60 flex items-center gap-1">
                                                                    <User className="h-2 w-2" />
                                                                    {m?.name || 'Membro'}
                                                                </span>
                                                            </div>
                                                            <span className={cn(
                                                                "font-black tracking-widest text-[8px] px-1.5 rounded",
                                                                doc.status === 'APPROVED' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                            )}>
                                                                {doc.status}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
