import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Progress } from '@/modules/shared/components/ui/progress'
import { CheckCircle, Clock, AlertCircle, FileText, CheckCheck } from 'lucide-react'
import { Process, ProcessStep, Document } from '../../types'
import { cn, formatDate } from '../../lib/utils'

interface ProcessTimelineProps {
  process: Process | null
  requerimentos?: any[]
  familyMembers?: { id: string, name: string, type: string }[]
  agendamentos?: any[]
  documents?: Document[]
}

const stepIcons = {
  pending: Clock,
  in_progress: Clock,
  waiting: Clock,
  completed: CheckCircle,
  rejected: AlertCircle,
  analyzing: Clock,
}

const stepColors = {
  pending: 'text-gray-400',
  in_progress: 'text-blue-600',
  waiting: 'text-amber-500',
  completed: 'text-green-600',
  rejected: 'text-red-600',
  analyzing: 'text-blue-600',
}

const stepBgColors = {
  pending: 'bg-gray-100',
  in_progress: 'bg-blue-100',
  waiting: 'bg-amber-100',
  completed: 'bg-green-100',
  rejected: 'bg-red-100',
  analyzing: 'bg-blue-100',
}

const stepLabels = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  waiting: 'Aguardando Você',
  completed: 'Concluído',
  rejected: 'Rejeitado',
  analyzing: 'Em Análise',
}

// Função para calcular a etapa atual baseada nas regras de negócio (7 fases)
function calcularEtapaAtual(agendamentos: any[] = [], documents: Document[] = [], process: Process | null = null): number {
  // Separar consultorias de assessorias pelo produto_nome
  const consultoriasAgendadas = agendamentos.filter(a =>
    String(a.produto_nome || '').toLowerCase().includes('consultoria')
  )
  const assessoriasAgendadas = agendamentos.filter(a =>
    !String(a.produto_nome || '').toLowerCase().includes('consultoria')
  )

  const consultoriaRealizada = consultoriasAgendadas.some(a => a.status === 'realizado')
  const assessoriaRealizada = assessoriasAgendadas.some(a => a.status === 'realizado')

  const temDocumentos = documents.length > 0
  const todosAprovados = temDocumentos && documents.every(d => {
    const statusLower = String(d.status || '').toLowerCase()
    return statusLower === 'approved' || statusLower === 'apostilled' || statusLower === 'translated'
  })

  // Sem processo = Etapas 0-1 (Consultoria)
  if (!process) {
    if (consultoriaRealizada) return 1  // 1: Consultoria Realizada
    return 0                             // 0: Consultoria Agendada/Pendente
  }

  // Com processo = Etapas 2-6
  if (todosAprovados) return 5           // 5: Protocolar
  if (assessoriaRealizada) return 4      // 4: Assessoria Realizada → Documentação
  if (assessoriasAgendadas.length > 0) return 3  // 3: Assessoria Agendada
  return 2                               // 2: Processo Contratado
}

export function ProcessTimeline({ process, requerimentos = [], familyMembers = [], agendamentos = [], documents = [] }: ProcessTimelineProps) {
  // 7 fases detalhadas do fluxo completo
  const defaultSteps: ProcessStep[] = [
    { id: 0, name: "Consultoria Agendada", description: "Agende sua consultoria jurídica para avaliar seu caso.", status: 'pending' as const },
    { id: 1, name: "Consultoria Realizada", description: "Consultoria concluída. Próximo: contratar o processo completo.", status: 'pending' as const },
    { id: 2, name: "Processo Contratado", description: "Você contratou o processo jurídico completo.", status: 'pending' as const },
    { id: 3, name: "Assessoria Agendada", description: "Agende sua sessão de assessoria jurídica.", status: 'pending' as const },
    { id: 4, name: "Assessoria Realizada", description: "Assessoria concluída. Inicia coleta de documentos.", status: 'pending' as const },
    { id: 5, name: "Documentação", description: "Coleta e aprovação de documentos para o órgão.", status: 'pending' as const },
    { id: 6, name: "Protocolar", description: "Envio do processo ao órgão competente.", status: 'pending' as const },
    { id: 7, name: "Concluído", description: "Processo finalizado com sucesso.", status: 'pending' as const }
  ];

  // Calcular a etapa atual dinamicamente
  const calculatedCurrentStep = calcularEtapaAtual(agendamentos, documents, process)

  // Determinar o status de cada etapa baseado na etapa atual
  const enrichedSteps = defaultSteps.map(step => {
    if (step.id < calculatedCurrentStep) {
      return { ...step, status: 'completed' as const }
    } else if (step.id === calculatedCurrentStep) {
      return { ...step, status: 'in_progress' as const }
    } else {
      return { ...step, status: 'pending' as const }
    }
  })

  const currentProcess: Process = process || {
    id: 'not-started',
    clientId: 'unknown',
    serviceType: 'Processo em Abertura',
    currentStep: 1,
    steps: enrichedSteps,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Sempre usar todos os steps, mas só os relevantes estarão visíveis
  currentProcess.steps = enrichedSteps
  currentProcess.currentStep = calculatedCurrentStep

  const pendingRequerimentos = requerimentos.filter(r => r.status === 'pendente')
  const hasPendingReq = pendingRequerimentos.length > 0

  // Separar por tipo
  const consultoriasAgendadas = agendamentos.filter(a =>
    String(a.produto_nome || '').toLowerCase().includes('consultoria')
  )
  const assessoriasAgendadas = agendamentos.filter(a =>
    !String(a.produto_nome || '').toLowerCase().includes('consultoria')
  )

  const consultoriaRealizada = consultoriasAgendadas.some(a => a.status === 'realizado')
  const assessoriaRealizada = assessoriasAgendadas.some(a => a.status === 'realizado')

  const temDocumentos = documents.length > 0
  const todosAprovados = temDocumentos && documents.every(d => {
    const statusLower = String(d.status || '').toLowerCase()
    return statusLower === 'approved' || statusLower === 'apostilled' || statusLower === 'translated'
  })

  const completedSteps = currentProcess.steps?.filter(s => s.status === 'completed').length || 0
  const totalSteps = currentProcess.steps?.length || 0
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <div className="space-y-6">
      {!process && consultoriaRealizada && (
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 shadow-sm animate-in fade-in slide-in-from-top duration-500">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800 dark:text-green-300">
                  Consultoria Realizada! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-400 mt-1">
                  Sua consultoria jurídica foi concluída com sucesso. Agora você pode contratar o processo jurídico completo para prosseguir com a assessoria jurídica, documentação e protocolo.
                </p>
                <div className="mt-4 p-3 bg-white dark:bg-neutral-800 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm font-medium text-green-600 dark:text-green-400">
                      <CheckCheck className="w-4 h-4" />
                      <span>Próximo passo: contratar o processo jurídico completo</span>
                    </div>
                    <a href="/cliente/agendamento" className="text-xs px-3 py-1 bg-green-600 text-white rounded-full hover:bg-green-700 transition">
                      Contratar Agora
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!process && !consultoriaRealizada && consultoriasAgendadas.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm animate-in fade-in slide-in-from-top duration-500">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">
                  Consultoria Agendada
                </h3>
                <p className="text-blue-700 dark:text-blue-400 mt-1">
                  Você tem uma consultoria jurídica agendada. Compareça na data e hora marcadas para avaliar seu caso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Andamento do Processo</span>
          </CardTitle>
          <CardDescription>
            {currentProcess.serviceType} • {process ? `Iniciado em ${formatDate(currentProcess.createdAt)}` : 'Aguardando formalização'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progresso Geral
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {completedSteps} de {totalSteps} etapas concluídas
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {currentProcess.steps.map((step, index) => {
          const StepIcon = stepIcons[step.status] || Clock
          const isLast = index === currentProcess.steps.length - 1
          const isActive = currentProcess.currentStep === step.id

          return (
            <div key={step.id} className="relative">
              {/* Connection line */}
              {!isLast && (
                <div className={cn(
                  "absolute left-6 top-12 w-0.5 h-16 transition-colors duration-200",
                  (isActive && hasPendingReq) ? "bg-red-500" : "bg-gray-200 dark:bg-gray-700"
                )} />
              )}

              <Card className={cn(
                "relative transition-all duration-200",
                isActive && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
                isActive && hasPendingReq && "ring-red-500",
                step.status === 'completed' && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                      isActive && hasPendingReq ? 'bg-red-100' : (stepBgColors[step.status] || 'bg-gray-100')
                    )}>
                      {isActive && hasPendingReq ? (
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      ) : (
                        <StepIcon className={cn("h-6 w-6", stepColors[step.status] || 'text-gray-400')} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {step.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              (isActive && hasPendingReq) ? 'destructive' :
                              step.status === 'completed' ? 'success' :
                              (step.status === 'in_progress' || step.status === 'analyzing') ? 'default' :
                              step.status === 'rejected' ? 'destructive' :
                              step.status === 'waiting' ? 'warning' :
                              'secondary'
                            }
                          >
                            {(isActive && hasPendingReq) ? 'Bloqueado' : (stepLabels[step.status] || step.status)}
                          </Badge>
                          {isActive && (
                            <Badge variant="outline">
                              Etapa Atual
                            </Badge>
                          )}
                        </div>
                      </div>

                      {step.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{step.description}</p>
                      )}

                      {/* Informativo: Assessoria ainda não agendada */}
                      {step.id === 3 && isActive && assessoriasAgendadas.length === 0 && (
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                                Agende sua Assessoria Jurídica
                              </p>
                              <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                                Você contratou o processo. Agora agende sua sessão de assessoria jurídica para avaliar sua documentação.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Informativo: Assessoria agendada mas não realizada */}
                      {step.id === 3 && isActive && assessoriasAgendadas.length > 0 && !assessoriaRealizada && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                Assessoria Agendada
                              </p>
                              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                                Sua sessão de assessoria jurídica está agendada. Compareça na data marcada para prosseguir com a documentação.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Progresso de Documentos */}
                      {step.id === 5 && isActive && assessoriaRealizada && temDocumentos && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <CheckCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                Progresso de Documentação
                              </p>
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-blue-600 dark:text-blue-400">
                                    {documents.filter(d => {
                                      const statusLower = String(d.status || '').toLowerCase()
                                      return statusLower === 'approved' || statusLower === 'apostilled' || statusLower === 'translated'
                                    }).length} de {documents.length} documentos aprovados
                                  </span>
                                  {todosAprovados && (
                                    <Badge variant="success" className="text-[10px] py-0 h-4">
                                      Pronto para Protocolo
                                    </Badge>
                                  )}
                                </div>
                                <Progress
                                  value={documents.length > 0 ? (documents.filter(d => {
                                    const statusLower = String(d.status || '').toLowerCase()
                                    return statusLower === 'approved' || statusLower === 'apostilled' || statusLower === 'translated'
                                  }).length / documents.length) * 100 : 0}
                                  className="h-1.5"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Alerta de Requerimento Pendente */}
                      {isActive && hasPendingReq && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-red-700 dark:text-red-400">
                                ATENÇÃO: Requerimento Pendente
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                O processo está bloqueado até que os seguintes documentos sejam enviados:
                              </p>

                              <div className="mt-3 space-y-3">
                                {pendingRequerimentos.map((req) => (
                                  <div key={req.id} className="bg-white dark:bg-neutral-800 p-3 rounded-lg border border-red-100 dark:border-red-900/40 shadow-sm">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {req.tipo}
                                    </p>
                                    
                                    <div className="space-y-1.5">
                                      {req.documentos && req.documentos.length > 0 ? (
                                        req.documentos.filter((d: any) => d.status === 'PENDING').map((doc: any) => {
                                          const member = familyMembers.find(m => m.id === (doc.dependente_id || doc.cliente_id))
                                          return (
                                            <div key={doc.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-gray-50 dark:bg-neutral-900/50">
                                              <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                {doc.tipo}
                                              </span>
                                              <Badge variant="outline" className="text-[10px] py-0 h-4">
                                                {member?.name || 'Titular'}
                                              </Badge>
                                            </div>
                                          )
                                        })
                                      ) : (
                                        <p className="text-[10px] text-gray-500 italic">Nenhum documento específico listado</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.completedAt && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Concluído em {formatDate(step.completedAt)}
                        </p>
                      )}

                      {(step.status === 'in_progress' || step.status === 'analyzing') && !(isActive && hasPendingReq) && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <span className="text-sm text-blue-600 font-medium">
                              Em andamento
                            </span>
                          </div>
                        </div>
                      )}

                      {step.status === 'waiting' && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-amber-600 font-medium">
                              Aguardando sua ação
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Linha vermelha antes da próxima etapa */}
              {isActive && hasPendingReq && !isLast && (
                 <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border-2 border-white dark:border-gray-900">
                        Bloqueio de Etapa
                    </div>
                 </div>
              )}
            </div>
          )
        })}
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">Próximos Passos</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                {!process
                  ? (consultoriaRealizada
                      ? 'Consultoria concluída! Contrrate agora o processo jurídico completo para prosseguir com a assessoria e documentação.'
                      : 'Você tem uma consultoria agendada. Aguarde e complete a sessão de consultoria.')
                  : currentProcess.currentStep === 2
                    ? 'Você contratou o processo jurídico. Próximo: agende sua sessão de assessoria jurídica.'
                    : currentProcess.currentStep === 3
                    ? 'Sua assessoria jurídica está agendada. Compareça para prosseguir com a documentação.'
                    : currentProcess.currentStep < totalSteps
                    ? `Prossiga com a etapa "${currentProcess.steps[currentProcess.currentStep]?.name}".`
                    : 'Seu processo foi concluído com sucesso!'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
