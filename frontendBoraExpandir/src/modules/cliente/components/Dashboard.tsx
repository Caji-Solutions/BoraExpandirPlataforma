'use client'

import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Target,
  TrendingUp,
  XCircle
} from 'lucide-react'
import { Client, Document, Process } from '../types'
import { formatDate, formatDateSimple } from '../lib/utils'
import { AppointmentReminder } from './AppointmentReminder'
import { ReminderCard } from './ReminderCard'
import { CountdownTimer } from './CountdownTimer'
import { mockReminders, mockPendingActions } from '../lib/mock-data'

interface DashboardProps {
  client: Client
  documents: Document[]
  process: Process | null
}

export function Dashboard({ client, documents, process }: DashboardProps) {
  const totalDocuments = documents.length
  const approvedDocuments = documents.filter(doc => doc.status === 'approved').length
  const pendingDocuments = documents.filter(doc => doc.status === 'pending').length
  const rejectedDocuments = documents.filter(doc => doc.status === 'rejected').length
  const analyzingDocuments = documents.filter(doc => doc.status === 'analyzing').length

  const completedSteps = process?.steps?.filter(step => step.status === 'completed').length || 0
  const totalSteps = process?.steps?.length || 0
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const recentDocuments = documents
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 3)

  const stats = [
    {
      title: 'Documentos Rejeitados',
      value: rejectedDocuments.toString(),
      description: 'Necessitam correção',
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

  // Convert Pending Actions to Reminders
  const pendingActionReminders: import('../types').Reminder[] = mockPendingActions.map(action => ({
    id: `pending-${action.id}`,
    title: action.title,
    message: `${action.description} (Vence em: ${formatDateSimple(action.deadline)})`,
    date: action.deadline,
    type: (action.priority === 'high' ? 'urgent' : 'warning') as 'urgent' | 'warning',
    actionLink: '/juridico'
  }))

  const legalReminders = [...pendingActionReminders, ...mockReminders.legal]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-3xl bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white shadow-lg">
          <div className="flex items-center justify-center space-x-6">
            <Link to="/cliente/configuracoes?tab=meus-dados" className="flex-shrink-0 transition-transform hover:scale-105 cursor-pointer">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white/30 hover:border-white/60">
                <User className="h-10 w-10" />
              </div>
            </Link>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-1">Bem-vindo, {client.name}!</h1>
              <p className="text-blue-100 text-sm mb-2 opacity-80">ID: {client.id}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-0 px-3 py-1">
                  Cliente desde {formatDateSimple(client.createdAt)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">



        {/* Appointment Reminder - Restored */}
        <AppointmentReminder
          appointmentDate={nextAppointment.date}
          appointmentTime={nextAppointment.time}
          service={nextAppointment.service}
          location={nextAppointment.location}
        />

        {/* Administrative/Financial Reminders */}
        <ReminderCard
          title="Administrativo/Financeiro"
          type="admin"
          reminders={mockReminders.admin}
        />



        {/* Legal Reminders */}
        <ReminderCard
          title="Jurídico"
          type="legal"
          reminders={legalReminders}
        />

        {/* Commercial Reminders */}
        <ReminderCard
          title="Comercial"
          type="commercial"
          reminders={mockReminders.commercial}
        />
      </div>

      {/* Required Actions Countdown Section */}
      {mockPendingActions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockPendingActions.map(action => (
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
      )}

      {/* Stats Grid */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Documentos</h1>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum passo definido para este processo.</p>
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
                            doc.status === 'analyzing' ? 'default' :
                              'warning'
                      }
                      className="text-xs"
                    >
                      {doc.status === 'pending' ? 'Pendente' :
                        doc.status === 'analyzing' ? 'Análise' :
                          doc.status === 'approved' ? 'Aprovado' :
                            'Rejeitado'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
