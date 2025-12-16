import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'
import { Process } from '../types'
import { cn, formatDate } from '../lib/utils'

interface ProcessTimelineProps {
  process: Process
}

const stepIcons = {
  pending: Clock,
  in_progress: Clock,
  completed: CheckCircle,
  rejected: AlertCircle,
}

const stepColors = {
  pending: 'text-gray-400',
  in_progress: 'text-blue-600',
  completed: 'text-green-600',
  rejected: 'text-red-600',
}

const stepBgColors = {
  pending: 'bg-gray-100',
  in_progress: 'bg-blue-100',
  completed: 'bg-green-100',
  rejected: 'bg-red-100',
}

const stepLabels = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  rejected: 'Rejeitado',
}

export function ProcessTimeline({ process }: ProcessTimelineProps) {
  const completedSteps = process.steps.filter(step => step.status === 'completed').length
  const totalSteps = process.steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Andamento do Processo</span>
          </CardTitle>
          <CardDescription>
            {process.serviceType} • Iniciado em {formatDate(process.createdAt)}
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
        {process.steps.map((step, index) => {
          const StepIcon = stepIcons[step.status]
          const isLast = index === process.steps.length - 1
          const isActive = process.currentStep === step.id

          return (
            <div key={step.id} className="relative">
              {/* Connection line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-700" />
              )}

              <Card className={cn(
                "relative transition-all duration-200",
                isActive && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
                step.status === 'completed' && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                      stepBgColors[step.status]
                    )}>
                      <StepIcon className={cn("h-6 w-6", stepColors[step.status])} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {step.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              step.status === 'completed' ? 'success' :
                              step.status === 'in_progress' ? 'default' :
                              step.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {stepLabels[step.status]}
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

                      {step.completedAt && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Concluído em {formatDate(step.completedAt)}
                        </p>
                      )}

                      {step.status === 'in_progress' && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <span className="text-sm text-blue-600 font-medium">
                              Em andamento
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                {process.currentStep < totalSteps 
                  ? `Aguarde enquanto trabalhamos na etapa "${process.steps[process.currentStep - 1]?.name}".` 
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
