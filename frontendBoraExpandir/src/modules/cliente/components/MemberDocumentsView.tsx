import { useState } from 'react'
import {
    ArrowLeft,
    FileText,
    Folder,
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Document as ClientDocument, RequiredDocument } from '../types'
import { cn } from '../lib/utils'
import { FormsDeclarationsCard } from './FormsDeclarationsCard'
import { RequirementsCard } from './RequirementsCard'
import { filterTabs } from './filterTabsConfig'
import { useDocumentActions } from '../hooks/useDocumentActions'
import { DocumentItemCard } from './DocumentItemCard'
import { DocumentModals } from './DocumentModals'

interface FamilyMember {
    id: string
    name: string
    email?: string
    type: string
    isTitular?: boolean
    clienteId?: string
}

interface MemberDocumentsViewProps {
    member: FamilyMember
    documents: ClientDocument[]
    requiredDocuments: RequiredDocument[]
    processoId?: string
    requerimentos?: any[]
    onUpload: (file: File, documentType: string, memberId: string, documentoId?: string) => Promise<void>
    onDelete: (documentId: string) => void
    onBack: () => void
    onRefresh?: () => void
}

export function MemberDocumentsView({
    member,
    documents,
    requiredDocuments,
    processoId,
    requerimentos,
    onUpload,
    onDelete,
    onBack,
    onRefresh,
}: MemberDocumentsViewProps) {
    const [activeTab, setActiveTab] = useState('pending')

    const actions = useDocumentActions({
        member,
        documents,
        requiredDocuments,
        processoId,
        requerimentos,
        onUpload,
        onRefresh,
    })

    // Render empty state
    const renderEmptyState = (title: string, description: string) => (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    )

    // Render document list for a given stage
    const renderDocList = (items: any[], stageId: string) =>
        items.length > 0 ? (
            <div className="grid gap-3">
                {items.map((item, idx) => (
                    <DocumentItemCard
                        key={`${stageId}-${item.type}-${idx}`}
                        item={item}
                        stageId={stageId}
                        idx={idx}
                        memberId={member.id}
                        uploadingType={actions.uploadingType}
                        dragOver={actions.dragOver}
                        setDragOver={actions.setDragOver}
                        onFileSelect={actions.handleFileSelect}
                        onUploadClick={actions.handleUploadClick}
                        onDrop={actions.handleDrop}
                        onDelete={onDelete}
                        onOpenQuoteModal={(doc) => {
                            actions.setSelectedDocForQuote(doc)
                            actions.setShowQuoteModal(true)
                        }}
                        onOpenClientQuoteModal={(doc) => {
                            actions.setSelectedDocForClientQuote(doc)
                            actions.setShowClientQuoteModal(true)
                        }}
                        isRequestingQuote={actions.isRequestingQuote}
                    />
                ))}
            </div>
        ) : null

    // Get content for the active tab
    const getActiveTabContent = () => {
        switch (activeTab) {
            case 'pending':
                return actions.pendingDocs.length > 0
                    ? renderDocList(actions.pendingDocs, 'pending')
                    : renderEmptyState('Nenhum documento pendente', 'Todos os documentos principais já foram enviados.')

            case 'analyzing':
            case 'rejected':
            case 'apostille':
            case 'translation':
            case 'completed': {
                const docs = actions.getDocumentsForStage(activeTab)
                return docs.length > 0
                    ? renderDocList(docs, activeTab)
                    : renderEmptyState(
                        `Nenhum documento ${activeTab === 'analyzing' ? 'em análise' : activeTab === 'rejected' ? 'rejeitado' : activeTab === 'apostille' ? 'para apostilar' : activeTab === 'translation' ? 'para traduzir' : 'aprovado'}`,
                        'Os documentos aparecerão aqui conforme avançam no processo.'
                    )
            }

            case 'forms':
                return processoId ? (
                    <FormsDeclarationsCard
                        memberId={member.id}
                        memberName={member.name}
                        processoId={processoId}
                        clienteId={member.clienteId}
                        isTitular={member.isTitular}
                        alwaysExpanded={true}
                        onUpload={actions.handleFormResponseUpload}
                    />
                ) : (
                    renderEmptyState('Nenhum formulário disponível', 'Formulários aparecerão aqui quando solicitados.')
                )

            case 'requirements':
                return processoId ? (
                    <RequirementsCard
                        clienteId={member.clienteId || member.id}
                        processoId={processoId}
                        membroId={member.id}
                        initialRequirements={requerimentos}
                        alwaysExpanded={true}
                    />
                ) : (
                    renderEmptyState('Nenhum requerimento disponível', 'Requerimentos aparecerão aqui quando solicitados.')
                )

            default:
                return null
        }
    }

    const activeTabConfig = filterTabs.find(t => t.id === activeTab)!

    return (
        <>
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header with Back Button and Member Info */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'p-3 rounded-xl',
                            member.isTitular ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-800'
                        )}>
                            <Folder className={cn(
                                'h-7 w-7',
                                member.isTitular ? 'text-blue-500' : 'text-gray-500'
                            )} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h2>
                                {member.isTitular && (
                                    <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-blue-600 hover:bg-blue-700">
                                        Titular
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.type} • Documentos do Processo</p>
                        </div>
                    </div>
                </div>

                {/* 8 Filter Tabs */}
                <div className="relative">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                        {filterTabs.map((tab) => {
                            const isActive = activeTab === tab.id
                            const count = actions.tabCounts[tab.id]
                            const TabIcon = tab.icon

                            // Override requirements tab to red when there are pending requirements
                            const isRequirementsAlert = tab.id === 'requirements' && actions.pendingRequirementsCount > 0
                            const tabBgActive = isRequirementsAlert ? 'bg-red-50 dark:bg-red-900/20' : tab.bgActive
                            const tabActiveBorder = isRequirementsAlert ? 'border-red-500' : tab.activeBorder
                            const tabTextColor = isRequirementsAlert ? 'text-red-700 dark:text-red-400' : tab.textColor
                            const tabBadgeBg = isRequirementsAlert ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : tab.badgeBg
                            const inactiveOverride = isRequirementsAlert
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:border-red-400'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600'

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border-2',
                                        isActive
                                            ? `${tabBgActive} ${tabActiveBorder} ${tabTextColor} shadow-sm`
                                            : inactiveOverride
                                    )}
                                >
                                    <TabIcon className={cn('h-4 w-4', isActive || isRequirementsAlert ? tabTextColor : 'text-gray-400')} />
                                    <span>{tab.label}</span>
                                    {count > 0 && (
                                        <span className={cn(
                                            'px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center',
                                            isActive || isRequirementsAlert ? tabBadgeBg : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                        )}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                    {/* Fade edge for scroll indication */}
                    <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 dark:from-gray-900 pointer-events-none" />
                </div>

                {/* Tab Description */}
                <div className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg border',
                    activeTabConfig.bgActive,
                    activeTabConfig.activeBorder
                )}>
                    <activeTabConfig.icon className={cn('h-5 w-5', activeTabConfig.textColor)} />
                    <p className={cn('text-sm font-medium', activeTabConfig.textColor)}>
                        {activeTabConfig.description}
                    </p>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {getActiveTabContent()}
                </div>
            </div>

            {/* All Modals */}
            <DocumentModals
                memberName={member.name}
                memberEmail={member.email || ''}
                memberDocs={actions.memberDocs}
                showConfirmModal={actions.showConfirmModal}
                onCancelUpload={actions.handleCancelUpload}
                onConfirmUpload={actions.handleConfirmUpload}
                isUploading={actions.isUploading}
                uploadError={actions.uploadError}
                pendingUpload={actions.pendingUpload}
                showPdfWarning={actions.showPdfWarning}
                onConfirmPdfWarning={actions.handleConfirmPdfWarning}
                onCancelPdfWarning={actions.handleCancelPdfWarning}
                showQuoteModal={actions.showQuoteModal}
                selectedDocForQuote={actions.selectedDocForQuote}
                isRequestingQuote={actions.isRequestingQuote}
                requestedSuccessfully={actions.requestedSuccessfully}
                onRequestApostille={actions.handleRequestApostille}
                onRequestTranslation={actions.handleRequestTranslation}
                onCloseQuoteModal={actions.handleCloseQuoteModal}
                getDocumentName={actions.getDocumentName}
                docIsWaitingApostille={actions.docIsWaitingApostille}
                showClientQuoteModal={actions.showClientQuoteModal}
                selectedDocForClientQuote={actions.selectedDocForClientQuote}
                onCloseClientQuoteModal={() => {
                    actions.setShowClientQuoteModal(false)
                    actions.setSelectedDocForClientQuote(null)
                }}
                onPaymentSuccess={() => {
                    if (onRefresh) onRefresh()
                    else window.location.reload()
                }}
            />
        </>
    )
}
