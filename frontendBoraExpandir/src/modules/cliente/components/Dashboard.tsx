'use client'

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
  TrendingUp
} from 'lucide-react'
import { Client, Document, Process } from '../types'
import { formatDate } from '../lib/utils'

interface DashboardProps {
  client: Client
  documents: Document[]
  process: Process
}

export function Dashboard({ client, documents, process }: DashboardProps) {
  const totalDocuments = documents.length
  const approvedDocuments = documents.filter(doc => doc.status === 'approved').length
  const pendingDocuments = documents.filter(doc => doc.status === 'pending').length
  const rejectedDocuments = documents.filter(doc => doc.status === 'rejected').length
  const analyzingDocuments = documents.filter(doc => doc.status === 'analyzing').length

  const completedSteps = process.steps.filter(step => step.status === 'completed').length
  const totalSteps = process.steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const recentDocuments = documents
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 3)

  const stats = [
    {
      title: 'Progresso do Processo',
      value: `${Math.round(progressPercentage)}%`,
      description: `${completedSteps} de ${totalSteps} etapas concluídas`,
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
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
      value: (pendingDocuments + rejectedDocuments).toString(),
      description: 'Documentos para enviar/corrigir',
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Bem-vindo, {client.name}!</h1>
            <p className="text-blue-100 text-lg">{client.serviceType}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-0">
                Cliente desde {formatDate(client.createdAt)}
              </Badge>
              {client.paymentStatus === 'confirmed' && (
                <Badge variant="secondary" className="bg-green-500 text-white border-0">
                  ✓ Pagamento Confirmado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {(pendingDocuments > 0 || rejectedDocuments > 0) && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Ações Necessárias</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingDocuments > 0 && (
                <p className="text-yellow-700 dark:text-yellow-300">
                  • Você tem {pendingDocuments} documento(s) pendente(s) para envio
                </p>
              )}
              {rejectedDocuments > 0 && (
                <p className="text-yellow-700 dark:text-yellow-300">
                  • Você tem {rejectedDocuments} documento(s) rejeitado(s) que precisa(m) ser corrigido(s)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
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
              {process.steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-green-700 dark:text-green-400' :
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
              ))}
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
