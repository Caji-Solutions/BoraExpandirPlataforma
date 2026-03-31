import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Sidebar } from '../../components/ui/Sidebar'
import type { SidebarGroup } from '../../components/ui/Sidebar'
import { Dashboard } from './pages/dashboard/Dashboard'
import { ProcessTimeline } from './components/documents/ProcessTimeline'
import { Notifications } from './components/dashboard/Notifications'
import { DocumentModal } from './components/uploads/DocumentModal'
import { Traducao } from './pages/services/Traducao'
import Parceiro from '../shared/components/parceiro/Parceiro'
import { ClienteAgendamento } from './pages/scheduling/ClienteAgendamento'
import { Client, Document, Notification, TranslatedDocument, Process, ProcessStep } from './types'
import { Apostilamento } from './pages/services/Apostilamento'
import { DocumentUploadFlow } from './components/uploads/DocumentUploadFlow'
import ClienteContratos from './components/contracts/ClienteContratos'
import { Home, FileText, GitBranch, Users, Settings } from 'lucide-react'
import { Config } from '../../components/ui/Config'
import { RequiredActionModal } from './components/forms/RequiredActionModal'
import { clienteService } from './services/clienteService'
import { useAuth } from '../../contexts/AuthContext'
import { apiClient } from '@/modules/shared/services/api'

export function ClienteApp() {
  const navigate = useNavigate()
  const location = useLocation()
  const [client, setClient] = useState<Client>({
    id: '',
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    paymentStatus: 'pending',
    accessGranted: true,
    isPartner: false,
    isClient: true,
    clientId: '',
    createdAt: new Date(),
  })
  const [documents, setDocuments] = useState<Document[]>([])
  const [familyMembers, setFamilyMembers] = useState<{ id: string, name: string, email?: string, type: string }[]>([])
  const [processo, setProcesso] = useState<Process | null>(null)
  const [requerimentos, setRequerimentos] = useState<any[]>([])
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([])
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paymentLockInfo, setPaymentLockInfo] = useState<any>(null)
  const { activeProfile, isAuthenticated } = useAuth()

  const fetchDocuments = async (clientId: string = client.id, reqDocs?: any[]) => {
    try {
      const result = await apiClient.get<{ data: any[] }>(`/cliente/${clientId}/documentos`)
      const apiDocs = result.data || []

      const currentReqDocs = reqDocs && reqDocs.length > 0 ? reqDocs : (requiredDocuments.length > 0 ? requiredDocuments : [])

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
          name: currentReqDocs.find((r: any) => r.type === doc.tipo)?.name || doc.tipo,
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
      const result = await apiClient.get<{ data: any[] }>(`/cliente/${clientId}/requerimentos`)
      setRequerimentos(result.data || [])
    } catch (error) {
      console.error('Erro ao buscar requerimentos:', error)
    }
  }
  const fetchNotificacoes = async (clientId: string = client.id) => {
    try {
      console.log('[ClienteApp] Buscando notificações para cliente:', clientId)
      const result = await clienteService.getNotificacoes(clientId)
      console.log('[ClienteApp] Resultado de notificações:', result)

      if (!result || !Array.isArray(result)) {
        console.warn('[ClienteApp] Notificações não é um array:', result)
        setNotifications([])
        return
      }

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

      console.log('[ClienteApp] Notificações mapeadas:', backendNotifs)
      setNotifications(backendNotifs)
    } catch (error) {
      console.error('[ClienteApp] Erro ao buscar notificacoes:', error)
      setNotifications([])
    }
  }

  const fetchRequiredDocuments = async (clientId: string = client.id) => {
    try {
      const result = await clienteService.getDocumentosRequeridos(clientId)
      setRequiredDocuments(result || [])
      return result || []
    } catch (error) {
      console.error('Erro ao buscar documentos requeridos:', error)
      return []
    }
  }

  const fetchClientData = async (clientId: string) => {
    try {
      const result = await apiClient.get<{ data: any }>(`/cliente/${clientId}`)
      if (result.data) {
        const apiCliente = result.data
        const updatedClient: Client = {
          ...client,
          id: apiCliente.id,
          name: apiCliente.nome,
          email: apiCliente.email,
          phone: apiCliente.whatsapp,
          avatarUrl: apiCliente.foto_perfil,
          clientId: apiCliente.client_id,
          status: apiCliente.status,
          stage: apiCliente.stage,
          createdAt: new Date(apiCliente.criado_em || apiCliente.created_at)
        }
        setClient(updatedClient)
        return updatedClient
      }
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error)
    }
    return null
  }

  const fetchPaymentLockStatus = async (clientId: string) => {
    try {
      const result = await clienteService.getPagamentoLockStatus(clientId)
      setPaymentLockInfo(result || null)
      return result || null
    } catch (error) {
      console.error('Erro ao buscar bloqueio financeiro:', error)
      setPaymentLockInfo(null)
      return null
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        const impersonatedClientId = localStorage.getItem('impersonatedClientId')
        
        let activeId = ''

        if (isAuthenticated && activeProfile) {
          if (activeProfile.role === 'cliente') {
            // Primeiro tenta buscar o cliente pelo user_id (Auth UID)
            try {
              const byUserResult = await apiClient.get<{ data: { id: string } }>(`/cliente/by-user/${activeProfile.id}`)
              if (byUserResult.data?.id) {
                activeId = byUserResult.data.id
                console.log('[ClienteApp] Cliente encontrado pelo user_id:', activeId)
              }
            } catch (err) {
              console.warn('[ClienteApp] Erro ao buscar por user_id, usando fallback:', err)
            }
            // Fallback para o activeProfile.id se não encontrou
            if (!activeId) {
              activeId = activeProfile.id
            }
          } else if (impersonatedClientId) {
             activeId = impersonatedClientId
          }
        }

        // Fetch client data
        const currentClient = await fetchClientData(activeId)
        const finalActiveId = currentClient?.id || activeId

        // Fetch processos
        try {
          const processosData = await apiClient.get<{ data: any[] }>(`/cliente/${finalActiveId}/processos`)
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
              clientId: finalActiveId,
              serviceType: apiProcesso.tipo_servico,
              currentStep: currentStepId,
              steps: mappedSteps,
              createdAt: new Date(apiProcesso.created_at),
              updatedAt: new Date(apiProcesso.updated_at)
            }
            setProcesso(mappedProcesso)
          }
        } catch (error) {
          console.error('Erro ao buscar processos:', error)
        }

        // Fetch dependentes
        try {
          const dependentesData = await apiClient.get<{ data: any[] }>(`/cliente/${finalActiveId}/dependentes`)
          const members = (dependentesData.data || []).map((dep: any) => ({
            id: dep.id,
            name: dep.nome_completo,
            email: dep.email,
            type: dep.parentesco ? (dep.parentesco.charAt(0).toUpperCase() + dep.parentesco.slice(1)) : 'Dependente'
          }))
          setFamilyMembers([{ id: finalActiveId, name: currentClient?.name || client.name || 'Titular', email: currentClient?.email || client.email, type: 'Titular' }, ...members])
        } catch (error) {
          console.error('Erro ao buscar dependentes:', error)
          setFamilyMembers([{ id: finalActiveId, name: currentClient?.name || client.name || 'Titular', email: currentClient?.email || client.email, type: 'Titular' }])
        }

        // Fetch other data using the final active ID
        await fetchPaymentLockStatus(finalActiveId)
        const reqs = await fetchRequiredDocuments(finalActiveId)
        await fetchDocuments(finalActiveId, reqs)
        await fetchRequerimentos(finalActiveId)
        await fetchNotificacoes(finalActiveId)

        // Fetch agendamentos para ProcessTimeline
        try {
          const agendamentosData = await clienteService.getAgendamentos(finalActiveId)
          const agendamentosArray = Array.isArray((agendamentosData as any)?.data)
            ? (agendamentosData as any).data
            : (Array.isArray(agendamentosData) ? agendamentosData : [])
          setAgendamentos(agendamentosArray)
        } catch (error) {
          console.warn('Erro ao buscar agendamentos:', error)
          setAgendamentos([])
        }
      } catch (error) {
        console.error('Erro ao buscar dados iniciais:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Só buscar dados se estiver autenticado e tiver perfil ativo
    if (isAuthenticated && activeProfile) {
      fetchInitialData()
    }
  }, [isAuthenticated, activeProfile?.id, activeProfile?.role])

  const [selectedDocument] = useState<Document | null>(null)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [translatedDocuments, setTranslatedDocuments] = useState<TranslatedDocument[]>([])
  const [isRequiredModalOpen, setIsRequiredModalOpen] = useState(false)

  // Um usuário é considerado "Apenas Parceiro" se o seu status for 'parceiro'
  const isPartnerOnly = client.status === 'parceiro';
  const isPaymentLocked = Boolean(paymentLockInfo?.bloqueado)

  useEffect(() => {
    if (!isPartnerOnly && isPaymentLocked && location.pathname !== '/cliente') {
      navigate('/cliente', { replace: true })
    }
  }, [isPartnerOnly, isPaymentLocked, location.pathname, navigate])


  const handleCloseRequiredModal = () => {
    setIsRequiredModalOpen(false)
    localStorage.setItem('acknowledgedPendingActions', 'true')
  }

  const handleBecomeClient = () => {
    navigate('/cliente/agendamento')
  }


  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const handleUploadOverdueProof = async (parcelaId: string, file: File) => {
    if (!client.id) return
    await clienteService.uploadComprovanteParcela(parcelaId, client.id, file)
    await fetchPaymentLockStatus(client.id)
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
      console.error('Erro ao atualizar status da notificacao:', error)
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
      documentName: 'Documento',
      sourceLanguage: 'PT',
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
    const newNotification: Notification = {
      id: Date.now().toString(),
      clientId: client.id,
      type: 'info',
      title: 'Solicitação de Orçamento Enviada',
      message: `Sua solicitação de orçamento foi enviada. Você receberá uma resposta em até 24 horas.`,
      read: false,
      createdAt: new Date(),
    }

    setNotifications(prev => [newNotification, ...prev])
    console.log('Quote request:', { documentIds, targetLanguages })
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

  // Recarregar notificações ao entrar na página de notificações
  useEffect(() => {
    if (client.id && location.pathname === '/cliente/notificacoes') {
      fetchNotificacoes(client.id)
    }
  }, [location.pathname, client.id])

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
          { label: 'Meu Processo', to: '/cliente/processo', icon: GitBranch, disabled: isPaymentLocked },
          { label: 'Documentos', to: '/cliente/upload', icon: FileText, disabled: isPaymentLocked },
          { label: 'Parceiro', to: '/cliente/parceiro', icon: Users, disabled: isPaymentLocked },
        ],
      },
      {
        label: 'Sistema',
        items: [
          { label: 'Configurações', to: '/cliente/configuracoes', icon: Settings, disabled: isPaymentLocked },
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
            <Route index element={<Parceiro client={client} />} />
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
              {client.paymentStatus === 'pending' ? 'Aguardando confirmação' : 'Processando'}
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
              isPartnerOnly ? (
                <Parceiro 
                  client={client} 
                />
              ) : (
                <Dashboard
                  client={client}
                  documents={documents}
                  process={processo}
                  requerimentos={requerimentos}
                  notifications={notifications}
                  paymentLockInfo={paymentLockInfo}
                  onUploadOverdueProof={handleUploadOverdueProof}
                />
              )
            }
          />
          <Route
            path="processo"
            element={<ProcessTimeline process={processo} requerimentos={requerimentos} familyMembers={familyMembers} agendamentos={agendamentos} documents={documents} clientStage={client.stage} />}
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
                agendamentos={agendamentos}
                onUploadSuccess={async (data) => {
                  console.log('Upload concluido:', data)
                  // Recarregar documentos do backend para obter o estado real
                  if (client.id) {
                    await fetchDocuments(client.id)
                  }
                }}
                onDelete={async (documentId) => {
                  try {
                    await apiClient.delete(`/cliente/documento/${documentId}`)
                    handleDeleteDocument(documentId)
                  } catch (e) {
                    console.error("Delete failed", e)
                  }
                }}
              />
            }
          />
          <Route
            path="contratos"
            element={<ClienteContratos clienteId={client.id} />}
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
                clienteId={client.id}
                clientName={client.name}
                members={familyMembers}
                documents={documents}
                requiredDocuments={requiredDocuments}
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
          <Route path="configuracoes" element={<Config client={client} documents={documents} onRefresh={async () => { if (client.id) { await fetchDocuments(client.id); await fetchClientData(client.id); } }} />} />
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
