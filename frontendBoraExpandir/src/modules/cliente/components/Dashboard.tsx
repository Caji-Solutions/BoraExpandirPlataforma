'use client'

import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Button } from './ui/button'
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Target,
  TrendingUp,
  XCircle,
  Stamp
} from 'lucide-react'
import { Client, Document, Process } from '../types'
import { formatDate, formatDateSimple } from '../lib/utils'
import { AppointmentReminder } from './AppointmentReminder'
import { ReminderCard } from './ReminderCard'
import { CountdownTimer } from './CountdownTimer'
import { RequestedActionsModal } from './RequestedActionsModal'
import { RequiredActionModal } from './RequiredActionModal'
import { clienteService } from '../services/clienteService'
import { useEffect, useState, useMemo } from 'react'

interface DashboardProps {
  client: Client
  documents: Document[]
  process: Process | null
  requerimentos?: any[]
  notifications?: import('../types').Notification[]
}

export function Dashboard({ client, documents, process, requerimentos = [], notifications: propNotifications }: DashboardProps) {
  const [notifications, setNotifications] = useState<import('../types').Notification[]>([])
  const [realRequerimentos, setRealRequerimentos] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [showRequestedActionsModal, setShowRequestedActionsModal] = useState(false)

  const totalDocuments = documents.length
  const allRequerimentos = [...(requerimentos || []), ...realRequerimentos]
  // Filter unique requirements by ID if they might overlap
  const uniqueRequerimentos = Array.from(new Map(allRequerimentos.map(item => [item.id, item])).values())
  const pendingRequerimentos = uniqueRequerimentos.filter(r => r.status === 'pendente')

  // Refined Status Filtering Logic
  const approvedDocuments = documents.filter(doc => doc.status === 'approved').length

  const rejectedDocuments = documents.filter(doc => doc.status === 'rejected').length

  const analyzingDocuments = documents.filter(doc =>
    doc.status.toLowerCase().includes('analyzing')
  ).length

  const pendingDocuments = documents.filter(doc =>
    doc.status === 'pending' ||
    doc.status === 'sent_for_apostille' ||
    doc.status.toLowerCase().includes('waiting')
  ).length

  const completedSteps = process?.steps?.filter(step => step.status === 'completed').length || 0
  const totalSteps = process?.steps?.length || 0
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 3)

  const stats = [
    {
      title: 'Documentos Rejeitados',
      value: rejectedDocuments.toString(),
      description: rejectedDocuments > 0 ? 'Necessitam correção' : 'Nenhuma rejeição',
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      title: 'Documentos Aprovados',
      value: approvedDocuments.toString(),
      description: `${approvedDocuments} de ${totalDocuments} documentos`,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Em Análise',
      value: analyzingDocuments.toString(),
      description: 'Documentos sendo revisados',
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Pendências',
      value: pendingDocuments.toString(),
      description: 'Documentos para enviar',
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
  ]

  // Mock appointment data - substituir por dados reais do backend
  const nextAppointment = {
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias no futuro
    time: "14:30",
    service: "Consultoria Jurídica - Visto D7",
    location: "Online - WhatsApp/Zoom"
  }


  useEffect(() => {
    if (propNotifications && propNotifications.length > 0) {
      setNotifications(propNotifications)
      return
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoadingData(true)
        const [notifsRaw, reqs] = await Promise.all([
          clienteService.getNotificacoes(client.id),
          clienteService.getRequerimentos(client.id)
        ])

        const mappedNotifs = notifsRaw.map((n: any) => {
          const isRead = n.lida === true || String(n.lida) === 'true' || n.lida === 1;
          const type = n.type || n.tipo || 'info';
          return {
            ...n,
            type,
            read: isRead,
            lida: isRead,
            createdAt: n.criado_em ? new Date(n.criado_em) : (n.createdAt ? new Date(n.createdAt) : new Date())
          }
        })

        setNotifications(mappedNotifs)
        setRealRequerimentos(reqs)
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (client.id) {
      fetchDashboardData()
    }
  }, [client.id, propNotifications])

  // Map backend notifications to dashboard actions/reminders
  const realPendingActions = useMemo(() => {
    return notifications
      .filter(n => {
        const isRead = n.lida || n.read;
        const title = n.titulo || n.title;

        // Find if this notification is linked to a document request
        const linkedDoc = documents.find(doc => doc.type === title);

        if (linkedDoc) {
          // If it's a document request, it's pending if the document is 'pending' or 'rejected'
          // We show it even if 'read' to remind the user of the pending upload
          return linkedDoc.status === 'pending' || linkedDoc.status === 'rejected';
        }

        // For other types of notifications, follow the read status
        return !isRead;
      })
      .map(n => {
        const hasDeadline = !!(n.data_prazo || (n as any).deadline)
        const createdAt = n.criado_em || n.createdAt || new Date()
        const defaultDeadline = new Date(new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000)

        return {
          id: n.id,
          title: n.titulo || n.title || 'Ação Necessária',
          description: n.mensagem || n.message || '',
          deadline: hasDeadline ? new Date((n.data_prazo || (n as any).deadline) as string) : defaultDeadline,
          priority: (n.type === 'error' || n.type === 'warning' || hasDeadline) ? 'high' as const : 'medium' as const,
          type: n.type || 'info'
        }
      })
      .filter(action => !action.deadline || action.deadline >= new Date())
  }, [notifications, documents])

  const pendingActionReminders = useMemo(() => {
    const now = new Date()

    const reminders = realPendingActions
      .filter(action => {
        // Only keep actions whose deadlines haven't expired
        if (action.deadline && action.deadline < now) return false
        return true
      })
      .map(action => ({
        id: `notif-${action.id}`,
        title: action.title,
        message: action.deadline
          ? `${action.description} (Prazo: ${formatDateSimple(action.deadline)})`
          : action.description,
        date: action.deadline || new Date(),
        type: action.type === 'error' ? 'urgent' as const : 'warning' as const,
        actionLink: '/cliente/notificacoes'
      }))

    // Add pending documents as reminders (only truly pending or rejected)
    const docReminders = documents
      .filter(doc => doc.status === 'pending' || doc.status === 'rejected')
      .map(doc => ({
        id: `doc-${doc.id}`,
        title: doc.status === 'rejected' ? 'Documento Rejeitado' : 'Envio Pendente',
        message: doc.status === 'rejected'
          ? `O documento "${doc.name}" foi rejeitado e precisa ser reenviado.`
          : `O documento "${doc.name}" ainda não foi enviado.`,
        date: doc.updatedAt || doc.uploadDate || new Date(),
        type: doc.status === 'rejected' ? 'urgent' as const : 'warning' as const,
        actionLink: '/cliente/upload'
      }))

    // Add pending requirements as reminders (only 'pendente' status)
    const reqReminders = uniqueRequerimentos
      .filter(r => r.status === 'pendente')
      .map(r => ({
        id: `req-${r.id}`,
        title: 'Requerimento Pendente',
        message: `O requerimento de "${r.tipo}" está aguardando sua ação.`,
        date: r.created_at || new Date(),
        type: 'urgent' as const,
        actionLink: '/cliente/processo'
      }))

    // Deduplicate: if a notification reminder refers to the same document type 
    // that already has a docReminder, skip the notification one to avoid duplicates
    const docTypes = new Set(documents.filter(d => d.status === 'pending' || d.status === 'rejected').map(d => d.type))
    const filteredReminders = reminders.filter(r => {
      // Check if this notification title matches a document type already covered
      const matchesDocType = docTypes.has(r.title)
      return !matchesDocType
    })

    return [...filteredReminders, ...docReminders, ...reqReminders].sort((a, b) => {
      // Prioritize urgent
      if (a.type === 'urgent' && b.type !== 'urgent') return -1
      if (a.type !== 'urgent' && b.type === 'urgent') return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [realPendingActions, documents, uniqueRequerimentos])

  const [showRequiredActionModal, setShowRequiredActionModal] = useState(false)

  // Auto-open mandatory modal ONLY if there are NEW pending actions not yet seen
  useEffect(() => {
    if (realPendingActions.length > 0) {
      const seenIds = JSON.parse(localStorage.getItem('seenRequiredActionIds') || '[]') as string[]
      const hasNewActions = realPendingActions.some(action => !seenIds.includes(action.id))

      if (hasNewActions) {
        setShowRequiredActionModal(true)
      }
    }
  }, [realPendingActions])

  const handleCloseRequiredModal = () => {
    // When closing, mark all current pending actions as seen
    const currentIds = realPendingActions.map(a => a.id)
    const seenIds = JSON.parse(localStorage.getItem('seenRequiredActionIds') || '[]') as string[]

    // Merge new seen IDs
    const updatedSeenIds = Array.from(new Set([...seenIds, ...currentIds]))
    localStorage.setItem('seenRequiredActionIds', JSON.stringify(updatedSeenIds))

    setShowRequiredActionModal(false)
  }

  const legalReminders = useMemo(() => [...pendingActionReminders], [pendingActionReminders])

  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-3xl bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white shadow-lg relative">
          <div className="flex items-center justify-center space-x-6">
            <Link to="/cliente/configuracoes?tab=meus-dados" className="flex-shrink-0 transition-transform hover:scale-105 cursor-pointer">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white/30 hover:border-white/60">
                <User className="h-10 w-10" />
              </div>
            </Link>
            <div className="text-center md:text-left flex-1">
              <div>
                <h1 className="text-3xl font-bold mb-1">Bem-vindo, {client.name}!</h1>
                <p className="text-blue-100 text-sm mb-2 opacity-80">ID: {client.id}</p>
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-0 px-3 py-1">
                    Cliente desde {formatDateSimple(client.createdAt)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Absolute positioned button for bottom-right */}
            <button
              onClick={() => setShowRequestedActionsModal(true)}
              className="absolute bottom-4 right-4 hidden md:flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20 backdrop-blur-sm"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-xs">Ações Solicitadas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Requirement Alert Banner */}
      {pendingRequerimentos.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top duration-500">
          <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Stamp className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-300">
                    Ação Necessária: Requerimento Pendente
                  </h3>
                  <p className="text-red-700 dark:text-red-400 mt-1">
                    Você possui {pendingRequerimentos.length} {pendingRequerimentos.length === 1 ? 'requerimento' : 'requerimentos'} em aberto que {pendingRequerimentos.length === 1 ? 'precisa' : 'precisan'} ser regularizados.
                  </p>
                </div>
                <Link to="/cliente/processo">
                  <Button variant="destructive" size="sm" className="shadow-lg shadow-red-500/30">
                    Ver Requerimentos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Reminders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Only show categories that have real reminders */}
        {legalReminders.length > 0 && (
          <ReminderCard
            title="Jurídico"
            type="legal"
            reminders={legalReminders}
          />
        )}

        {/* Placeholder for future real data integration without mocks */}
        {legalReminders.length === 0 && (
          <div className="col-span-full text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum lembrete ou ação pendente no momento.</p>
          </div>
        )}
      </div>

      {/* Required Actions Countdown Section */}
      {
        realPendingActions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {realPendingActions.map(action => (
              <Card key={action.id} className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-700 dark:text-red-400 flex items-center space-x-2 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{action.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{action.description}</p>
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
                    <CountdownTimer targetDate={action.deadline} variant="red" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Status dos Documentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Process Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Progresso do Processo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Progresso Geral</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="space-y-3">
              {process?.steps && process.steps.length > 0 ? (
                process.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                        'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${step.status === 'completed' ? 'text-green-700 dark:text-green-400' :
                        step.status === 'in_progress' ? 'text-blue-700 dark:text-blue-400' :
                          'text-gray-500 dark:text-gray-400'
                        }`}>
                        {step.name}
                      </p>
                    </div>
                    <div>
                      {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {step.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-500" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum passo do processo disponível.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Documentos Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Nenhum documento enviado ainda.
                </p>
              ) : (
                recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(doc.uploadDate)}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        doc.status === 'approved' ? 'success' :
                          doc.status === 'rejected' ? 'destructive' :
                            doc.status.toLowerCase().includes('analyzing') ? 'default' :
                              'warning'
                      }
                      className="text-xs"
                    >
                      {doc.status === 'pending' ? 'Pendente' :
                        doc.status.toLowerCase().includes('analyzing') ? 'Análise' :
                          doc.status === 'approved' ? 'Aprovado' :
                            doc.status === 'rejected' ? 'Rejeitado' :
                              doc.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <RequestedActionsModal
        isOpen={showRequestedActionsModal}
        onClose={() => setShowRequestedActionsModal(false)}
        notifications={notifications}
        documents={documents}
      />

      <RequiredActionModal
        isOpen={showRequiredActionModal}
        onClose={handleCloseRequiredModal}
        actions={realPendingActions}
      />
    </div >
  )
}
