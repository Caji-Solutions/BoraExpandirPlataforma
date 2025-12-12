import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Sidebar } from '../../components/ui/Sidebar'
import type { SidebarGroup } from '../../components/ui/Sidebar'
import { Dashboard } from './components/Dashboard'
import { DocumentUpload } from './components/DocumentUpload'
import { DocumentStatus } from './components/DocumentStatus'
import { ProcessTimeline } from './components/ProcessTimeline'
import { Notifications } from './components/Notifications'
import { DocumentModal } from './components/DocumentModal'
import { Traducao } from './components/Traducao'
import { 
  mockClient, 
  mockDocuments, 
  mockProcess, 
  mockNotifications, 
  mockRequiredDocuments,
  mockApprovedDocuments,
  mockTranslatedDocuments,
} from './lib/mock-data'
import { Document, Notification, ApprovedDocument, TranslatedDocument } from './types'
import { Home, FileText, Upload, GitBranch, Bell, Languages } from 'lucide-react'

export function ClienteApp() {
  const location = useLocation()
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [approvedDocuments, setApprovedDocuments] = useState<ApprovedDocument[]>(mockApprovedDocuments)
  const [translatedDocuments, setTranslatedDocuments] = useState<TranslatedDocument[]>(mockTranslatedDocuments)
  
  const unreadNotifications = notifications.filter(n => !n.read).length

  const handleUpload = (file: File, documentType: string) => {
    // Simulate file upload
    const newDocument: Document = {
      id: Date.now().toString(),
      clientId: mockClient.id,
      name: mockRequiredDocuments.find(req => req.type === documentType)?.name || 'Documento',
      type: documentType,
      status: 'analyzing',
      uploadDate: new Date(),
      fileName: file.name,
      fileSize: file.size,
    }

    setDocuments(prev => {
      // Remove any existing document of the same type
      const filtered = prev.filter(doc => doc.type !== documentType)
      return [...filtered, newDocument]
    })

    // Add notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      clientId: mockClient.id,
      type: 'info',
      title: 'Documento Recebido',
      message: `Seu documento "${newDocument.name}" foi recebido e está sendo analisado.`,
      read: false,
      createdAt: new Date(),
    }

    setNotifications(prev => [newNotification, ...prev])
  }

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const handleDismissNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  const handleUploadTranslation = (file: File, approvedDocumentId: string, targetLanguage: string) => {
    const newTranslation: TranslatedDocument = {
      id: Date.now().toString(),
      clientId: mockClient.id,
      approvedDocumentId,
      documentName: approvedDocuments.find(d => d.id === approvedDocumentId)?.name || 'Documento',
      sourceLanguage: approvedDocuments.find(d => d.id === approvedDocumentId)?.originalLanguage || 'PT',
      targetLanguage,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date(),
    }

    setTranslatedDocuments(prev => [...prev, newTranslation])

    const newNotification: Notification = {
      id: Date.now().toString(),
      clientId: mockClient.id,
      type: 'success',
      title: 'Tradução Enviada',
      message: `Sua tradução "${file.name}" foi enviada com sucesso.`,
      read: false,
      createdAt: new Date(),
    }

    setNotifications(prev => [newNotification, ...prev])
  }

  const handleRequestQuote = (documentIds: string[], targetLanguages: string[]) => {
    // Send to backend: POST /quotes with documentIds and targetLanguages
    const selectedDocs = approvedDocuments.filter(d => documentIds.includes(d.id))
    const docNames = selectedDocs.map(d => d.name).join(', ')

    const newNotification: Notification = {
      id: Date.now().toString(),
      clientId: mockClient.id,
      type: 'info',
      title: 'Solicitação de Orçamento Enviada',
      message: `Sua solicitação de orçamento para "${docNames}" foi enviada. Você receberá uma resposta em até 24 horas.`,
      read: false,
      createdAt: new Date(),
    }

    setNotifications(prev => [newNotification, ...prev])
    console.log('Quote request:', { documentIds, targetLanguages })
  }

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setIsDocumentModalOpen(true)
  }

  const handleUploadFromStatus = (documentType: string) => {
    // Navigate to upload page for specific document type
    window.location.href = '/cliente/upload'
    // Scroll to the specific document section
    setTimeout(() => {
      const element = document.getElementById(`upload-${documentType}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // Auto-mark all notifications as read when entering notifications page
  useEffect(() => {
    if (location.pathname === '/cliente/notificacoes') {
      handleMarkAllAsRead()
    }
  }, [location.pathname])

  // Configuração da sidebar seguindo o padrão do projeto
  const sidebarGroups: SidebarGroup[] = [
    {
      label: 'Menu Principal',
      items: [
        { label: 'Dashboard', to: '/cliente', icon: Home },
        { label: 'Meu Processo', to: '/cliente/processo', icon: GitBranch },
        { label: 'Status Documentos', to: '/cliente/documentos', icon: FileText },
        { label: 'Enviar Documentos', to: '/cliente/upload', icon: Upload },
        { label: 'Tradução', to: '/cliente/traducao', icon: Languages },
        { 
          label: 'Notificações', 
          to: '/cliente/notificacoes', 
          icon: Bell,
          badge: unreadNotifications > 0 ? (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
              {unreadNotifications}
            </span>
          ) : undefined
        },
      ],
    },
  ]

  // Check if client has access
  if (!mockClient.accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full bg-card rounded-lg shadow-md p-8 text-center border border-border">
          <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Acesso Pendente</h2>
          <p className="text-muted-foreground mb-4">
            Seu acesso será liberado automaticamente após a confirmação do pagamento.
          </p>
          <div className="text-sm text-muted-foreground">
            Status do pagamento: <span className="font-medium text-warning">
              {mockClient.paymentStatus === 'pending' ? 'Aguardando confirmação' : 'Processando'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar groups={sidebarGroups} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-gray-200 rounded-lg"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      
      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <Routes>
          <Route 
            index 
            element={
              <Dashboard
                client={mockClient}
                documents={documents}
                process={mockProcess}
              />
            } 
          />
          <Route 
            path="processo" 
            element={<ProcessTimeline process={mockProcess} />} 
          />
          <Route 
            path="documentos" 
            element={
              <DocumentStatus 
                documents={documents} 
                onUpload={handleUploadFromStatus}
                onView={handleViewDocument}
              />
            } 
          />
          <Route 
            path="upload" 
            element={
              <DocumentUpload
                documents={documents}
                requiredDocuments={mockRequiredDocuments}
                onUpload={handleUpload}
                onDelete={handleDeleteDocument}
              />
            } 
          />
          <Route 
            path="traducao" 
            element={
              <Traducao
                approvedDocuments={approvedDocuments}
                translatedDocuments={translatedDocuments}
                onUploadTranslation={handleUploadTranslation}
                onRequestQuote={handleRequestQuote}
              />
            } 
          />
          <Route 
            path="notificacoes" 
            element={
              <Notifications
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDismiss={handleDismissNotification}
              />
            } 
          />
        </Routes>
      </main>

      <DocumentModal
        document={selectedDocument}
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
      />
    </div>
  )
}
