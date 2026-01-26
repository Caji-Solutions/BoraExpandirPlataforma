import { useState } from 'react'
import { FamilyFolderCard } from './FamilyFolderCard'
import { InitialUploadModal } from './InitialUploadModal'
import { Document as ClientDocument, RequiredDocument } from '../types'

interface FamilyMember {
    id: string
    name: string
    type: string
}

interface FamilyFoldersProps {
    members: FamilyMember[]
    documents: ClientDocument[]
    requiredDocuments: RequiredDocument[]
    onUpload: (file: File, documentType: string, memberId: string) => Promise<void>
    onDelete: (documentId: string) => void
}

export function FamilyFolders({ 
    members, 
    documents, 
    requiredDocuments, 
    onUpload,
    onDelete 
}: FamilyFoldersProps) {
    // Track which card is expanded - ONLY ONE allowed at a time
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
    
    // Track which member has the upload modal open
    const [uploadModalMember, setUploadModalMember] = useState<FamilyMember | null>(null)

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
