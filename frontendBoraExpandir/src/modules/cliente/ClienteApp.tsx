import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../../components/ui/Sidebar'
import type { SidebarGroup } from '../../components/ui/Sidebar'
import { Dashboard } from './components/Dashboard'
import PartnerDashboard from './components/PartnerDashboard'
import { ProcessTimeline } from './components/ProcessTimeline'
import { Notifications } from './components/Notifications'
import { DocumentModal } from './components/DocumentModal'
import { Traducao } from './components/Traducao'
import Parceiro from './components/Parceiro'
import { ClienteAgendamento } from './components/ClienteAgendamento'
import {
  mockClient,
  mockNotifications,
  mockRequiredDocuments,
  mockApprovedDocuments,
  mockTranslatedDocuments,
  mockPendingActions,
} from './lib/mock-data'
import { Client, Document, Notification, ApprovedDocument, TranslatedDocument, Process, ProcessStep } from './types'
import { Apostilamento } from './components/Apostilamento'
import { DocumentUploadFlow } from './components/DocumentUploadFlow'
import { Home, FileText, Upload, GitBranch, Bell, Languages, Users, Calendar, Settings, Stamp } from 'lucide-react'
import { Config } from '../../components/ui/Config'
import { RequiredActionModal } from './components/RequiredActionModal'
import { clienteService } from './services/clienteService'
import { useAuth } from '../../contexts/AuthContext'

export function ClienteApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client>(mockClient)
  const [documents, setDocuments] = useState<Document[]>([])
  const [familyMembers, setFamilyMembers] = useState<{ id: string, name: string, email?: string, type: string }[]>([])
  const [processo, setProcesso] = useState<Process | null>(null)
  const [requerimentos, setRequerimentos] = useState<any[]>([])
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { profile, activeProfile, isAuthenticated } = useAuth()

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  // Helper to sanitize name (same as backend)
  const sanitizeName = (name: string) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
  }

  const fetchDocuments = async (clientId: string = client.id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cliente/${clientId}/documentos`)
      if (!response.ok) throw new Error('Falha ao buscar documentos')

      const result = await response.json()
      const apiDocs = result.data || []

      // Map API documents to frontend format and infer memberId
      const mappedDocs: Document[] = apiDocs.map((doc: any) => {
        // Infer memberId from storage_path
        // New Path format: processoId/memberId/docType/file
        let memberId = clientId // Use the passed clientId as default

        if (doc.dependente_id) {
          memberId = doc.dependente_id
        } else if (doc.storage_path) {
          const parts = doc.storage_path.split('/')
          if (parts.length >= 2) {
            memberId = parts[1]
          }
        }

        return {
          id: doc.id,
          clientId: doc.cliente_id,
          memberId: memberId,
          name: mockRequiredDocuments.find(r => r.type === doc.tipo)?.name || doc.tipo,
          type: doc.tipo,
          status: doc.status ? doc.status.toLowerCase() : 'pending',
          isApostilled: doc.apostilado,
          isTranslated: doc.traduzido,
          uploadDate: new Date(doc.criado_em),
          rejectionReason: doc.motivo_rejeicao,
          fileUrl: doc.public_url,
          fileName: doc.nome_arquivo,
          fileSize: doc.tamanho,
          updatedAt: doc.atualizado_em ? new Date(doc.atualizado_em) : undefined,
          requerimento_id: doc.requerimento_id || undefined,
          solicitado_pelo_juridico: doc.solicitado_pelo_juridico === true ||
            (doc.solicitado_pelo_juridico as any) === 1 ||
            (doc.solicitado_pelo_juridico as any) === 'true',
        }
      })

      setDocuments(mappedDocs)
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
    }
  }


  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchRequerimentos = async (clientId: string = client.id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cliente/${clientId}/requerimentos`)
      if (!response.ok) throw new Error('Falha ao buscar requerimentos')
      const result = await response.json()
      setRequerimentos(result.data || [])
    } catch (error) {
      console.error('Erro ao buscar requerimentos:', error)
    }
  }
  const fetchNotificacoes = async (clientId: string = client.id) => {
    try {
      const result = await clienteService.getNotificacoes(clientId)
      const backendNotifs = result.map((n: any) => {
        // Garantir que lida seja um booleano real (converte 1, 'true', etc)
        const isRead = n.lida === true || String(n.lida) === 'true' || n.lida === 1;

        return {
          id: n.id,
          clientId: n.cliente_id,
          type: n.tipo || 'info',
          title: n.titulo,
          message: n.mensagem,
          read: isRead,
          lida: isRead,
          data_prazo: n.data_prazo,
          createdAt: n.criado_em ? new Date(n.criado_em) : new Date()
        }
      })

      setNotifications(backendNotifs)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    }
  }

  const fetchRequiredDocuments = async (clientId: string = client.id) => {
    try {
      const result = await clienteService.getDocumentosRequeridos(clientId)
      setRequiredDocuments(result || [])
    } catch (error) {
      console.error('Erro ao buscar documentos requeridos:', error)
    }
  }

  const fetchClientData = async (clientId: string = mockClient.id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cliente/${clientId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          const apiCliente = result.data
          const updatedClient = {
            ...mockClient,
            id: apiCliente.id,
            name: apiCliente.nome,
            email: apiCliente.email,
            phone: apiCliente.whatsapp,
            avatarUrl: apiCliente.foto_perfil,
            clientId: apiCliente.client_id,
            createdAt: new Date(apiCliente.criado_em || apiCliente.created_at)
          }
          setClient(updatedClient)
          return updatedClient
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error)
    }
    return null
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        const impersonatedClientId = localStorage.getItem('impersonatedClientId')
        
        let activeId = mockClient.id

        if (isAuthenticated && activeProfile) {
          if (activeProfile.role === 'cliente') {
            // Se for cliente logado, buscar pelo email dele
            const res = await fetch(`${API_BASE_URL}/cliente/clientes`)
            if (res.ok) {
              const all = await res.json()
              const me = (all.data || []).find((c: any) => c.email === activeProfile.email)
              if (me) {
                activeId = me.id
              }
            }
          } else if (impersonatedClientId) {
             activeId = impersonatedClientId
          }
        }

        // Fetch client data
        const currentClient = await fetchClientData(activeId)
        const finalActiveId = currentClient?.id || activeId

        // Fetch processos
        const processosRes = await fetch(`${API_BASE_URL}/cliente/${activeId}/processos`)
        if (processosRes.ok) {
          const processosData = await processosRes.json()
          if (processosData.data && processosData.data.length > 0) {
            const apiProcesso = processosData.data[0]
            const phases = [
              { id: 1, name: "Iniciado", description: "O processo foi iniciado e está aguardando documentação." },
              { id: 2, name: "Documentação", description: "Fase de coleta e análise de documentos." },
              { id: 3, name: "Consultoria", description: "Análise técnica e consultoria especializada." },
              { id: 4, name: "Imigração", description: "Processo em fase final de imigração." }
            ];

            const currentStepId = apiProcesso.etapa_atual || 1;

            const mappedSteps: ProcessStep[] = phases.map(phase => {
              let status: 'pending' | 'in_progress' | 'completed' | 'waiting' = 'pending';
              if (phase.id < currentStepId) status = 'completed';
              else if (phase.id === currentStepId) status = 'in_progress';
              return { id: phase.id, name: phase.name, status, description: phase.description };
            });

            const mappedProcesso: Process = {
              id: apiProcesso.id,
              clientId: activeId,
              serviceType: apiProcesso.tipo_servico,
              currentStep: currentStepId,
              steps: mappedSteps,
              createdAt: new Date(apiProcesso.created_at),
              updatedAt: new Date(apiProcesso.updated_at)
            }
            setProcesso(mappedProcesso)
          }
        }

        // Fetch dependentes
        const dependentesRes = await fetch(`${API_BASE_URL}/cliente/${activeId}/dependentes`)
        if (dependentesRes.ok) {
          const dependentesData = await dependentesRes.json()
          const members = (dependentesData.data || []).map((dep: any) => ({
            id: dep.id,
            name: dep.nome_completo,
            email: dep.email,
            type: dep.parentesco ? (dep.parentesco.charAt(0).toUpperCase() + dep.parentesco.slice(1)) : 'Dependente'
          }))
          setFamilyMembers([{ id: activeId, name: currentClient?.name || mockClient.name, email: currentClient?.email || mockClient.email, type: 'Titular' }, ...members])
        } else {
          setFamilyMembers([{ id: activeId, name: currentClient?.name || mockClient.name, email: currentClient?.email || mockClient.email, type: 'Titular' }])
        }

        // Fetch other data using the final active ID
        await fetchDocuments(finalActiveId)
        await fetchRequerimentos(finalActiveId)
        await fetchNotificacoes(finalActiveId)
        await fetchRequiredDocuments(finalActiveId)
      } catch (error) {
        console.error('Erro ao buscar dados iniciais:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [isAuthenticated, activeProfile?.id, activeProfile?.role])

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [approvedDocuments, setApprovedDocuments] = useState<ApprovedDocument[]>([])
  const [translatedDocuments, setTranslatedDocuments] = useState<TranslatedDocument[]>([])
  const [isRequiredModalOpen, setIsRequiredModalOpen] = useState(false)

  const unreadNotifications = notifications.filter(n => !n.read).length
  const isPartnerOnly = !!mockClient.isPartner && mockClient.isClient === false


  const handleCloseRequiredModal = () => {
    setIsRequiredModalOpen(false)
    localStorage.setItem('acknowledgedPendingActions', 'true')
  }

  const handleBecomeClient = () => {
    navigate('/cliente/agendamento')
  }

  const handleUpload = (file: File, documentType: string) => {
    // Simulate file upload
    const newDocument: Document = {
      id: Date.now().toString(),
      clientId: client.id,
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
      clientId: client.id,
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

  const handleMarkAsRead = async (notificationId: string, lida: boolean = true) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: lida, lida: lida }
            : notification
        )
      )

      await clienteService.updateNotificacaoStatus(notificationId, lida)
    } catch (error) {
      console.error('Erro ao atualizar status da notificação:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true, lida: true }))
      )

      await clienteService.markAllNotificacoesAsRead(client.id)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const handleDismissNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  const handleUploadTranslation = (file: File, approvedDocumentId: string, targetLanguage: string) => {
    const newTranslation: TranslatedDocument = {
      id: Date.now().toString(),
      clientId: client.id,
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
      clientId: client.id,
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
      clientId: client.id,
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

  const handleSendForApostille = (documentIds: string[]) => {
    setDocuments(prev => prev.map(doc => {
      if (documentIds.includes(doc.id)) {
        return { ...doc, status: 'sent_for_apostille' }
      }
      return doc
    }))

    const newNotification: Notification = {
      id: Date.now().toString(),
      clientId: client.id,
      type: 'success',
      title: 'Documentos Enviados para Apostilamento',
      message: 'Seus documentos foram enviados para a equipe administrativa iniciar o processo de apostilamento.',
      read: false,
      createdAt: new Date(),
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  // Removido marcação automática ao entrar na página
  /*
  useEffect(() => {
    if (location.pathname === '/cliente/notificacoes') {
      handleMarkAllAsRead()
    }
  }, [location.pathname])
  */

  // Configuração da sidebar seguindo o padrão do projeto
  const sidebarGroups: SidebarGroup[] = isPartnerOnly
    ? [
      {
        label: 'Menu Principal',
        items: [
          { label: 'Dashboard', to: '/cliente', icon: Home },
          { label: 'Parceiro', to: '/cliente/parceiro', icon: Users },
        ],
      },
      {
        label: 'Sistema',
        items: [
          { label: 'Configurações', to: '/cliente/configuracoes', icon: Settings },
        ],
      },
    ]
    : [
      {
        label: 'Menu Principal',
        items: [
          { label: 'Dashboard', to: '/cliente', icon: Home },
          { label: 'Meu Processo', to: '/cliente/processo', icon: GitBranch },
          { label: 'Agendamento', to: '/cliente/agendamento', icon: Calendar },
          { label: 'Documentos', to: '/cliente/upload', icon: FileText },
          { label: 'Parceiro', to: '/cliente/parceiro', icon: Users },

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
      {
        label: 'Sistema',
        items: [
          { label: 'Configurações', to: '/cliente/configuracoes', icon: Settings },
        ],
      },
    ]

  // Modo parceiro (não cliente)
  if (isPartnerOnly) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar groups={sidebarGroups} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
          <Routes>
            <Route index element={<PartnerDashboard client={client} onBecomeClient={handleBecomeClient} />} />
            <Route path="parceiro" element={<Parceiro client={client} />} />
            <Route path="agendamento" element={<ClienteAgendamento client={client} />} />
            <Route path="configuracoes" element={<Config />} />
          </Routes>
        </main>
      </div>
    )
  }

  // Check if client has access
  if (!client.accessGranted && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-neutral-700">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Acesso Pendente</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Seu acesso será liberado automaticamente após a confirmação do pagamento.
          </p>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Status do pagamento: <span className="font-medium text-yellow-600 dark:text-yellow-400">
              {mockClient.paymentStatus === 'pending' ? 'Aguardando confirmação' : 'Processando'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar groups={sidebarGroups} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition"
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
                client={client}
                documents={documents}
                process={processo}
                requerimentos={requerimentos}
                notifications={notifications}
              />
            }
          />
          <Route
            path="processo"
            element={<ProcessTimeline process={processo} requerimentos={requerimentos} familyMembers={familyMembers} />}
          />
          <Route path="agendamento" element={<ClienteAgendamento client={client} />} />
          <Route
            path="upload"
            element={
              <DocumentUploadFlow
                clienteId={client.id}
                clientName={client.name}
                processoId={processo?.id || ''}
                processType={processo?.serviceType}
                familyMembers={familyMembers}
                documents={documents}
                requiredDocuments={requiredDocuments}
                requerimentos={requerimentos}
                onUploadSuccess={async (data) => {
                  console.log('Upload concluído:', data)
                  // Recarregar documentos do backend para obter o estado real
                  await fetchDocuments()
                }}
                onDelete={async (documentId) => {
                  try {
                    await fetch(`${API_BASE_URL}/cliente/documento/${documentId}`, { method: 'DELETE' })
                    handleDeleteDocument(documentId)
                  } catch (e) {
                    console.error("Delete failed", e)
                  }
                }}
              />
            }
          />
          <Route
            path="apostilamento"
            element={
              <Apostilamento
                client={client}
                documents={documents}
                onSendForApostille={handleSendForApostille}
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
            path="parceiro"
            element={
              <Parceiro client={client} />
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
          <Route path="configuracoes" element={<Config client={client} documents={documents} onRefresh={async () => { await fetchDocuments(); await fetchClientData(); }} />} />
        </Routes>
      </main>

      <DocumentModal
        document={selectedDocument}
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
      />

      <RequiredActionModal
        isOpen={isRequiredModalOpen}
        onClose={handleCloseRequiredModal}
        actions={notifications
          .filter(n => {
            const isRead = n.lida || n.read;
            const title = n.titulo || n.title;
            const linkedDoc = documents.find(doc => doc.type === title);

            if (linkedDoc) {
              return linkedDoc.status === 'pending' || linkedDoc.status === 'rejected';
            }
            return !isRead;
          })
          .map(n => ({
            id: n.id,
            title: n.titulo || n.title || 'Solicitação',
            description: n.mensagem || n.message || '',
            deadline: new Date(new Date(n.criado_em || n.createdAt || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000),
            priority: 'high'
          }))}
      />
    </div>
  )
}
