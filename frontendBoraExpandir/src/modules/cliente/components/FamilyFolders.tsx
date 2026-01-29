import { useState, useEffect } from 'react'
import { FamilyFolderCard } from './FamilyFolderCard'
import { InitialUploadModal } from './InitialUploadModal'
import { Document as ClientDocument, RequiredDocument } from '../types'

interface FamilyMember {
    id: string
    name: string
    type: string
    isTitular?: boolean
}

interface FamilyFoldersProps {
    clienteId: string
    clientName: string
    members: FamilyMember[]
    documents: ClientDocument[]
    requiredDocuments: RequiredDocument[]
    onUpload: (file: File, documentType: string, memberId: string) => Promise<void>
    onDelete: (documentId: string) => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function FamilyFolders({ 
    clienteId,
    clientName,
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
                    isTitular: true
                })

                // Add dependentes
                if (dependentesData.data && Array.isArray(dependentesData.data)) {
                    const dependentes = dependentesData.data.map((dep: any) => ({
                        id: dep.id,
                        name: dep.nome_completo || dep.name || 'Dependente',
                        type: dep.parentesco ? (dep.parentesco.charAt(0).toUpperCase() + dep.parentesco.slice(1)) : 'Dependente',
                        isTitular: false
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
            <div className="space-y-4">
                {members.map((member) => (
                    <FamilyFolderCard
                        key={member.id}
                        member={member}
                        documents={documents}
                        requiredDocuments={requiredDocuments}
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
