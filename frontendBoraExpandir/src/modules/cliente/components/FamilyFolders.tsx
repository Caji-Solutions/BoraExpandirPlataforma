import { useState, useEffect, useMemo } from 'react'
import { FamilyFolderCard } from './FamilyFolderCard'
import { InitialUploadModal } from './InitialUploadModal'
import { Document as ClientDocument, RequiredDocument } from '../types'
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface FamilyMember {
    id: string
    name: string
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
    onUpload: (file: File, documentType: string, memberId: string, documentoId?: string) => Promise<void>
    onDelete: (documentId: string) => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function FamilyFolders({
    clienteId,
    clientName,
    processoId,
    members: initialMembers,
    documents,
    requiredDocuments,
    onUpload,
    onDelete
}: FamilyFoldersProps) {
    // Track which card is expanded - ONLY ONE allowed at a time
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

    // Track which member has the upload modal open
    const [uploadModalMember, setUploadModalMember] = useState<FamilyMember | null>(null)

    // Enriched members with fetched data
    const [members, setMembers] = useState<FamilyMember[]>(initialMembers)

    // Calculate aggregated stats for the entire process
    const processStats = useMemo(() => {
        const stats = {
            waitingAction: 0,  // Aguardam Ação
            analyzing: 0,      // Em Análise
            completed: 0,      // Concluídos
            total: 0           // Total required
        }

        members.forEach(member => {
            const memberDocs = documents.filter(d => d.memberId === member.id)
            const uploadedTypes = new Set(memberDocs.map(d => d.type))

            // Count pending (not uploaded) docs
            const pendingCount = requiredDocuments.filter(req => !uploadedTypes.has(req.type)).length
            stats.waitingAction += pendingCount

            memberDocs.forEach(doc => {
                const statusLower = doc.status?.toLowerCase() || ''

                if (statusLower === 'analyzing' || statusLower === 'analyzing_apostille' || statusLower === 'analyzing_translation') {
                    stats.analyzing++
                } else if (statusLower === 'approved' && doc.isApostilled && doc.isTranslated) {
                    stats.completed++
                } else if (statusLower === 'rejected' || statusLower === 'waiting_apostille' || statusLower === 'waiting_translation') {
                    stats.waitingAction++
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

                // Build family members list
                const familyMembers: FamilyMember[] = []

                // Add titular (main client) - always first
                familyMembers.push({
                    id: clienteId,
                    name: clientName,
                    type: 'Titular',
                    isTitular: true,
                    clienteId: clienteId
                })

                // Add dependentes
                if (dependentesData.data && Array.isArray(dependentesData.data)) {
                    const dependentes = dependentesData.data.map((dep: any) => ({
                        id: dep.id,
                        name: dep.nome_completo || dep.name || 'Dependente',
                        type: dep.parentesco ? (dep.parentesco.charAt(0).toUpperCase() + dep.parentesco.slice(1)) : 'Dependente',
                        isTitular: false,
                        clienteId: clienteId
                    }))
                    familyMembers.push(...dependentes)
                }

                setMembers(familyMembers)
            } catch (error) {
                console.error('Erro ao buscar dados da família:', error)
                // Keep initial members on error
            }
        }

        if (clienteId) {
            fetchFamilyData()
        }
    }, [clienteId, clientName])

    const toggleCard = (memberId: string) => {
        setExpandedCardId(prev => prev === memberId ? null : memberId)
    }

    const openUploadModal = (member: FamilyMember) => {
        setUploadModalMember(member)
    }

    const closeUploadModal = () => {
        setUploadModalMember(null)
    }

    return (
        <>
            {/* Process-level Summary Card */}
            <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
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

            <div className="space-y-4">
                {members.map((member) => (
                    <FamilyFolderCard
                        key={member.id}
                        member={member}
                        documents={documents}
                        requiredDocuments={requiredDocuments}
                        processoId={processoId}
                        isExpanded={expandedCardId === member.id}
                        onToggle={() => toggleCard(member.id)}
                        onOpenUploadModal={() => openUploadModal(member)}
                        onUpload={onUpload}
                        onDelete={onDelete}
                    />
                ))}
            </div>


            {/* Initial Upload Modal */}
            {uploadModalMember && (
                <InitialUploadModal
                    isOpen={!!uploadModalMember}
                    onClose={closeUploadModal}
                    member={uploadModalMember}
                    requiredDocuments={requiredDocuments}
                    onUpload={onUpload}
                />
            )}
        </>
    )
}
