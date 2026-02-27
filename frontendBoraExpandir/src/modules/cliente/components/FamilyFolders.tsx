import { useState, useEffect, useMemo } from 'react'
import { MemberDocumentsView } from './MemberDocumentsView'
import { Document as ClientDocument, RequiredDocument } from '../types'
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertCircle,
    Folder,
    ChevronRight,
    User,
    Users,
    FileText,
} from 'lucide-react'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'

interface FamilyMember {
    id: string
    name: string
    email?: string
    type: string
    isTitular?: boolean
    clienteId?: string
}

interface FamilyFoldersProps {
    clienteId: string
    clientName: string
    processoId?: string
    members: FamilyMember[]
    documents: ClientDocument[]
    requiredDocuments: RequiredDocument[]
    requerimentos?: any[]
    onUpload: (file: File, documentType: string, memberId: string, documentoId?: string) => Promise<void>
    onDelete: (documentId: string) => void
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

export function FamilyFolders({
    clienteId,
    clientName,
    processoId,
    members: initialMembers,
    documents,
    requiredDocuments,
    requerimentos = [],
    onUpload,
    onDelete,
}: FamilyFoldersProps) {
    // Selected member for document view (null = show member selection)
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)

    // Enriched members with fetched data
    const [members, setMembers] = useState<FamilyMember[]>(initialMembers)

    // Sync state with props when they change in parent
    useEffect(() => {
        if (initialMembers && initialMembers.length > 0) {
            setMembers(prev => {
                // If we already have members and the new ones are just the same (or less), keep ours
                // unless it's the first time
                if (prev.length <= 1 && initialMembers.length > 1) {
                    return initialMembers;
                }
                return prev;
            });
        }
    }, [initialMembers])

    // Calculate aggregated stats for the entire process
    const processStats = useMemo(() => {
        const stats = {
            waitingAction: 0,
            analyzing: 0,
            completed: 0,
            total: 0,
        }

        members.forEach((member) => {
            const memberDocs = documents.filter((d) => d.memberId === member.id)
            const uploadedTypes = new Set(memberDocs.map((d) => d.type))
            const pendingCount = requiredDocuments.filter((req) => !uploadedTypes.has(req.type)).length
            stats.waitingAction += pendingCount
            
            memberDocs.forEach((doc) => {
                const statusLower = doc.status?.toLowerCase() || ''
                if (statusLower === 'analyzing' || statusLower === 'analyzing_apostille' || statusLower === 'analyzing_translation') {
                    stats.analyzing++
                } else if (statusLower === 'approved' && doc.isApostilled && doc.isTranslated) {
                    stats.completed++
                } else if (statusLower === 'rejected' || statusLower === 'pending') {
                    stats.waitingAction++
                } else if (statusLower === 'waiting_apostille' || statusLower === 'waiting_translation') {
                    if (doc.solicitado_pelo_juridico) {
                        stats.waitingAction++
                    }
                }
            })

            stats.total += requiredDocuments.length
        })

        return stats
    }, [members, documents, requiredDocuments])

    // Fetch dependentes and client information
    useEffect(() => {
        const fetchFamilyData = async () => {
            try {
                const dependentesRes = await fetch(`${API_BASE_URL}/cliente/${clienteId}/dependentes`)
                const dependentesData = dependentesRes.ok ? await dependentesRes.json() : { data: [] }

                const familyMembers: FamilyMember[] = []

                familyMembers.push({
                    id: clienteId,
                    name: clientName,
                    type: 'Titular',
                    isTitular: true,
                    clienteId: clienteId,
                })

                if (dependentesData.data && Array.isArray(dependentesData.data)) {
                    const dependentes = dependentesData.data.map((dep: any) => ({
                        id: dep.id,
                        name: dep.nome_completo || dep.name || 'Dependente',
                        type: dep.parentesco ? dep.parentesco.charAt(0).toUpperCase() + dep.parentesco.slice(1) : 'Dependente',
                        isTitular: false,
                        clienteId: clienteId,
                    }))
                    familyMembers.push(...dependentes)
                }

                setMembers(familyMembers)
            } catch (error) {
                console.error('Erro ao buscar dados da família:', error)
            }
        }

        if (clienteId) {
            fetchFamilyData()
        }
    }, [clienteId, clientName])

    // Calculate per-member stats
    const getMemberStats = (memberId: string) => {
        const memberDocs = documents.filter((d) => d.memberId === memberId)
        const uploadedTypes = new Set(memberDocs.filter(d => d.status?.toLowerCase() !== 'pending').map((d) => d.type))
        const missingCount = requiredDocuments.filter((req) => !uploadedTypes.has(req.type)).length
        
        let pending = missingCount
        let analyzing = 0
        let rejected = 0
        let completed = 0

        memberDocs.forEach((doc) => {
            const statusLower = doc.status?.toLowerCase() || ''
            if (statusLower === 'pending') {
                pending++
            } else if (statusLower === 'analyzing' || statusLower === 'analyzing_apostille' || statusLower === 'analyzing_translation') {
                analyzing++
            } else if (statusLower === 'approved' && doc.isApostilled && doc.isTranslated) {
                completed++
            } else if (statusLower === 'rejected') {
                rejected++
            } else if (statusLower === 'waiting_apostille' || statusLower === 'waiting_translation') {
                if (doc.solicitado_pelo_juridico) {
                    pending++ 
                }
            }
        })

        return { pending, analyzing, rejected, completed, total: memberDocs.length }
    }

    const titular = members.find((m) => m.isTitular)
    const dependentes = members.filter((m) => !m.isTitular)

    // If a member is selected, show MemberDocumentsView
    if (selectedMember) {
        return (
            <MemberDocumentsView
                member={selectedMember}
                documents={documents}
                requiredDocuments={requiredDocuments}
                processoId={processoId}
                requerimentos={requerimentos}
                onUpload={onUpload}
                onDelete={onDelete}
                onBack={() => setSelectedMember(null)}
            />
        )
    }

    // Render member card
    const renderMemberCard = (member: FamilyMember) => {
        const stats = getMemberStats(member.id)
        const hasRejected = stats.rejected > 0
        const hasPending = stats.pending > 0
        const hasDocuments = stats.total > 0

        return (
            <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={cn(
                    'w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group',
                    'bg-white dark:bg-gray-800 hover:shadow-lg hover:scale-[1.01]',
                    hasRejected
                        ? 'border-red-300 dark:border-red-700 hover:border-red-400 shadow-sm shadow-red-500/5'
                        : hasPending
                            ? 'border-amber-200 dark:border-amber-800 hover:border-amber-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                )}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                            className={cn(
                                'p-3 rounded-xl transition-colors',
                                member.isTitular
                                    ? 'bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40'
                                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                            )}
                        >
                            <Folder
                                className={cn(
                                    'h-7 w-7',
                                    member.isTitular ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                                )}
                            />
                        </div>

                        {/* Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-semibold text-base text-gray-900 dark:text-white">{member.name}</h3>
                                {member.isTitular && (
                                    <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-blue-600 hover:bg-blue-700">
                                        Titular
                                    </Badge>
                                )}
                                {hasRejected && (
                                    <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                                        Ação Necessária
                                    </Badge>
                                )}
                                {!hasDocuments && !hasRejected && (
                                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                        Pendente envio
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.type}</p>
                        </div>
                    </div>

                    {/* Stats + Arrow */}
                    <div className="flex items-center gap-5">
                        {/* Mini stats */}
                        <div className="hidden sm:flex items-center gap-3 text-sm">
                            {stats.rejected > 0 && (
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-red-600">{stats.rejected}</span>
                                    <span className="text-[10px] text-gray-400">Rejeitados</span>
                                </div>
                            )}
                            {stats.pending > 0 && (
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-amber-600">{stats.pending}</span>
                                    <span className="text-[10px] text-gray-400">Pendentes</span>
                                </div>
                            )}
                            {stats.analyzing > 0 && (
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-blue-600">{stats.analyzing}</span>
                                    <span className="text-[10px] text-gray-400">Em Análise</span>
                                </div>
                            )}
                            {stats.completed > 0 && (
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-green-600">{stats.completed}</span>
                                    <span className="text-[10px] text-gray-400">Aprovados</span>
                                </div>
                            )}
                        </div>

                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
            </button>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Process-level Summary Card */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <ClipboardList className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Resumo do Processo</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Aguardam Ação</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-600">{processStats.waitingAction}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Em Análise</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{processStats.analyzing}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Concluídos</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{processStats.completed}</span>
                    </div>
                </div>
            </div>

            {/* Titular Section */}
            {titular && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <User className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Titular
                        </h3>
                    </div>
                    {renderMemberCard(titular)}
                </div>
            )}

            {/* Dependentes Section */}
            {dependentes.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Dependentes
                        </h3>
                        <Badge variant="secondary" className="text-[10px] h-5">
                            {dependentes.length}
                        </Badge>
                    </div>
                    <div className="space-y-3">
                        {dependentes.map((dep) => renderMemberCard(dep))}
                    </div>
                </div>
            )}

            {/* Empty state if no members */}
            {members.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Carregando membros...</h3>
                    <p className="text-sm text-gray-500">Buscando informações do titular e dependentes.</p>
                </div>
            )}
        </div>
    )
}
