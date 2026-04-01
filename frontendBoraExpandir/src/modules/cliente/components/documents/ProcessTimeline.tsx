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
  clientStage?: 'formularios' | 'aguardando_consultoria' | 'em_consultoria' | 'clientes_c2' | 'aguardando_assessoria' | 'assessoria_andamento' | 'assessoria_finalizada' | 'cancelado'
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

// Mapear stage para etapa visual (0-7)
function mapStageToStep(stage?: string): number {
  switch (stage) {
    // Consultoria
    case 'formularios':
    case 'aguardando_consultoria':
    case 'em_consultoria':
      return 0  // Consultoria Agendada/Em Andamento

    case 'clientes_c2':
      return 1  // Consultoria Realizada

    // Processo
    case 'aguardando_assessoria':
      return 2  // Processo Contratado

    case 'assessoria_andamento':
      return 3  // Assessoria em Andamento

    case 'assessoria_finalizada':
      return 5  // Documentação/Protocolo

    case 'cancelado':
      return -1 // Cancelado (não mostrar normalmente)

    default:
      return 0
  }
}

// Função para calcular a etapa atual baseada no stage e dados adicionais
function calcularEtapaAtual(
  agendamentos: any[] = [],
  documents: Document[] = [],
  process: Process | null = null,
  clientStage?: string
): number {
  // Usar stage como fonte de verdade principal
  if (clientStage) {
    return mapStageToStep(clientStage)
  }

  // Fallback para registros legados sem stage definido.
  // A fonte de verdade e o campo clientes.stage atualizado pelo backend.
  // Este fallback sera removido quando todos os registros tiverem stage valido.
  return 0
}

export function ProcessTimeline({ process, requerimentos = [], familyMembers = [], agendamentos = [], documents = [], clientStage }: ProcessTimelineProps) {
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

  // Calcular a etapa atual dinamicamente usando o stage do cliente
  const calculatedCurrentStep = calcularEtapaAtual(agendamentos, documents, process, clientStage)

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
  const consultoriaEmAndamento = consultoriasAgendadas.some(a => a.status === 'em_consultoria')
  const assessoriaRealizada = assessoriasAgendadas.some(a => a.status === 'realizado')

  // Atualizar nome e descrição do step 0 quando consultoria está em andamento
  if (consultoriaEmAndamento && !consultoriaRealizada) {
    const step0 = currentProcess.steps.find(s => s.id === 0)
    if (step0) {
      step0.name = "Em Consultoria"
      step0.description = "Consultoria jurídica em andamento. O advogado está analisando seu caso."
    }
  }

  const temDocumentos = documents.length > 0
  const todosAprovados = temDocumentos && documents.every(d => {
    const statusLower = String(d.status || '').toLowerCase()
    return statusLower === 'approved' || statusLower === 'apostilled' || statusLower === 'translated'
  })

  const completedSteps = currentProcess.steps?.filter(s => s.status === 'completed').length || 0
  const totalSteps = currentProcess.steps?.length || 0
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">
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

      {!process && !consultoriaRealizada && consultoriaEmAndamento && (
        <Card className="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 shadow-sm animate-in fade-in slide-in-from-top duration-500">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300">
                  Em Consultoria
                </h3>
                <p className="text-indigo-700 dark:text-indigo-400 mt-1">
                  Sua consultoria jurídica está em andamento. O advogado está analisando seu caso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!process && !consultoriaRealizada && !consultoriaEmAndamento && consultoriasAgendadas.length > 0 && (
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

      <div className="space-y-8">
        {currentProcess.steps.map((step, index) => {
          const StepIcon = stepIcons[step.status] || Clock
          const isLast = index === currentProcess.steps.length - 1
          const isActive = currentProcess.currentStep === step.id

          return (
            <div key={step.id} className="relative">
              {/* Connection line */}
              {!isLast && (
                <div className={cn(
                  "absolute left-1/2 -translate-x-1/2 top-[64px] w-1 h-32 rounded-full transition-all duration-300",
                  step.status === 'completed' ? "bg-gradient-to-b from-green-500 via-green-400 to-green-300 dark:from-green-400 dark:via-green-300 dark:to-green-200" :
                  (isActive && hasPendingReq) ? "bg-gradient-to-b from-red-600 via-red-500 to-red-400 dark:from-red-500 dark:via-red-400 dark:to-red-300 shadow-lg" :
                  step.status === 'in_progress' ? "bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200" :
                  "bg-gradient-to-b from-gray-400 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-400"
                )} />
              )}

              <Card className={cn(
                "relative transition-all duration-300 rounded-xl border-2 hover:shadow-lg",
                isActive && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 shadow-lg",
                isActive && hasPendingReq && "ring-red-500 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 border-red-400 dark:border-red-600",
                step.status === 'completed' && "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700",
                step.status === 'in_progress' && "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-700",
                !isActive && step.status === 'pending' && "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              )}>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0",
                      isActive && hasPendingReq ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' :
                      step.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
                      step.status === 'in_progress' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' :
                      'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    )}>
                      {isActive && hasPendingReq ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : step.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span>{step.id + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          {step.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={cn(
                              "text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap",
                              (isActive && hasPendingReq) && 'bg-red-500 text-white',
                              step.status === 'completed' && 'bg-green-500 text-white',
                              (step.status === 'in_progress' || step.status === 'analyzing') && 'bg-blue-500 text-white',
                              step.status === 'rejected' && 'bg-red-500 text-white',
                              step.status === 'waiting' && 'bg-amber-500 text-white',
                              step.status === 'pending' && 'bg-gray-400 text-white'
                            )}
                            variant="default"
                          >
                            {(isActive && hasPendingReq) ? 'Bloqueado' : (stepLabels[step.status] || step.status)}
                          </Badge>
                          {isActive && !hasPendingReq && (
                            <Badge variant="outline" className="rounded-full px-2.5 py-1 font-semibold border-2 border-blue-400 dark:border-blue-500 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block mr-1.5 animate-pulse"></span>
                              Atual
                            </Badge>
                          )}
                        </div>
                      </div>

                      {step.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">{step.description}</p>
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
