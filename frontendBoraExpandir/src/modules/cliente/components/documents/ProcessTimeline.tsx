import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Progress } from '@/modules/shared/components/ui/progress'
import { CheckCircle, Clock, AlertCircle, FileText, CheckCheck, GitBranch } from 'lucide-react'
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

// Mapear status do processo para etapa visual (0-3) de acordo com os novos status
function mapStatusToStep(status?: string): number {
  switch (status) {
    case 'assessoria_iniciada':
      return 0
    case 'analise_documentos':
      return 1
    case 'processo_protocolado':
      return 2
    case 'processo_finalizado':
      return 3
    default:
      return 0
  }
}

// Função para calcular a etapa atual priorizando o status do processo
function calcularEtapaAtual(process?: Process | null, clientStage?: string): number {
  if (process && process.status) {
    return mapStatusToStep(process.status)
  }
  
  // Fallback para mapeamento antigo ou clientStage se necessário
  switch (clientStage) {
    case 'assessoria_iniciada': return 0
    case 'analise_documentos': return 1
    case 'processo_protocolado': return 2
    case 'processo_finalizado': return 3
    case 'assessoria_finalizada': return 3
    default: return 0
  }
}

export function ProcessTimeline({ process, requerimentos = [], familyMembers = [], agendamentos = [], documents = [], clientStage }: ProcessTimelineProps) {
  // 4 novas fases solicitadas
  const defaultSteps: ProcessStep[] = [
    { id: 0, name: "Assessoria Iniciada", description: "O time jurídico deu início oficial ao seu processo de cidadania.", status: 'pending' as const },
    { id: 1, name: "Análise de Documentos", description: "Fase de conferência, apostilamentos e traduções necessárias.", status: 'pending' as const },
    { id: 2, name: "Processo Protocolado", description: "Seu processo foi formalmente enviado aos órgãos competentes na Europa.", status: 'pending' as const },
    { id: 3, name: "Processo Finalizado", description: "Tutto pronto! Processo concluído com êxito.", status: 'pending' as const }
  ];

  // Calcular a etapa atual prioritariamente pelo status do objeto process
  const calculatedCurrentStep = calcularEtapaAtual(process, clientStage)

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

  if (!process) {
    return (
      <div className="max-w-4xl mx-auto px-4 space-y-8 animate-in fade-in duration-500">
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <GitBranch className="h-10 w-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
            Processo não iniciado
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed px-6 font-medium">
            Seu processo oficial de cidadania ainda não foi iniciado no sistema. 
            O acompanhamento detalhado estará disponível apenas após o inicio da sua assessoria jurídica.
          </p>
          
          {!consultoriaRealizada ? (
            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl max-w-sm mx-auto flex items-center gap-4 text-left">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest">Próxima Etapa</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">Realizar consultoria jurídica inicial</p>
              </div>
            </div>
          ) : (
             <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl max-w-sm mx-auto flex items-center gap-4 text-left">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-widest">Aguardando Início</p>
                <p className="text-sm text-green-700 dark:text-green-400">Sua assessoria foi concluída. Aguarde o início formal do processo.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">

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



                      {/* Progresso de Documentos - Agora na etapa de Análise de Documentos (ID 1) */}
                      {step.id === 1 && isActive && temDocumentos && (
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
                  : currentProcess.currentStep === 0
                    ? 'O time jurídico está preparando os primeiros passos. Em breve iniciaremos a análise documental.'
                    : currentProcess.currentStep === 1
                    ? 'Estamos na fase de análise e preparação da sua documentação (apostilamentos e traduções).'
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
