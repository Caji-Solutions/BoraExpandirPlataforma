import React, { useState, useEffect } from 'react'
import { clienteService } from '../../modules/cliente/services/clienteService'
import {
  User,
  MapPin,
  Heart,
  Baby,
  Briefcase,
  GraduationCap,
  Plane,
  FileText,
  DollarSign,
  AlertCircle,
  Loader2,
  Calendar,
  Phone,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClientQuestionnaireAnswersProps {
  clienteId: string
}

export function ClientQuestionnaireAnswers({ clienteId }: ClientQuestionnaireAnswersProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const responses = await clienteService.getFormularioResponses(clienteId)
        if (responses && responses.length > 0) {
          // Assuming the most recent response is the relevant one, or the only one
          setData(responses[0])
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar respostas do formulário.')
      } finally {
        setLoading(false)
      }
    }

    if (clienteId) {
      fetchData()
    }
  }, [clienteId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p>Carregando formulário do cliente...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl flex items-start gap-4">
        <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold">Erro ao carregar os dados</h3>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border border-border/50 rounded-2xl">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Formulário Não Preenchido</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Este cliente ainda não respondeu ao formulário de consultoria de imigração.
        </p>
      </div>
    )
  }

  const sections = [
    {
      title: 'Dados Pessoais',
      icon: User,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      fields: [
        { label: 'Nome Completo', value: data.nome_completo, icon: User, isFullWidth: true },
        { label: 'E-mail', value: data.email, icon: Mail, isFullWidth: true },
        { label: 'WhatsApp', value: data.whatsapp, icon: Phone },
        { label: 'Data de Nascimento', value: data.data_nascimento ? new Date(data.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '', icon: Calendar },
        { label: 'Nacionalidade', value: data.nacionalidade, icon: MapPin },
        { label: 'Estado Civil', value: data.estado_civil, icon: Heart },
      ]
    },
    {
      title: 'Documentos e Endereço',
      icon: FileText,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      fields: [
        { label: 'CPF', value: data.cpf, icon: FileText },
        { label: 'Passaporte', value: data.passaporte, icon: FileText },
        { label: 'País de Residência', value: data.pais_residencia, icon: MapPin, isFullWidth: true },
      ] as any[]
    },
    {
      title: 'Família',
      icon: Baby,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      fields: [
        { label: 'Tem filhos?', value: data.tem_filhos ? 'Sim' : 'Não' },
        ...(data.tem_filhos ? [
          { label: 'Quantidade de filhos', value: data.quantidade_filhos?.toString() },
          { label: 'Idades dos filhos', value: data.idades_filhos, isFullWidth: true },
        ] : [])
      ]
    },
    {
      title: 'Perfil Profissional',
      icon: Briefcase,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      fields: [
        { label: 'Profissão', value: data.profissao, icon: Briefcase, isFullWidth: true },
        { label: 'Escolaridade', value: data.escolaridade, icon: GraduationCap },
        { label: 'Experiência no Exterior', value: data.experiencia_exterior ? 'Sim' : 'Não' },
        ...(data.experiencia_exterior ? [
          { label: 'Onde teve experiência', value: data.empresa_exterior, isFullWidth: true },
        ] : [])
      ]
    },
    {
      title: 'Planos de Imigração',
      icon: Plane,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      fields: [
        { label: 'Objetivo da Imigração', value: data.objetivo_imigracao, isFullWidth: true },
        { label: 'País de Destino', value: data.pais_destino, icon: MapPin },
        { label: 'Prazo para Mudança', value: data.prazo_mudanca, icon: Calendar },
        { label: 'Já tem visto?', value: data.ja_tem_visto ? 'Sim' : 'Não' },
        ...(data.ja_tem_visto ? [
          { label: 'Tipo de visto', value: data.tipo_visto },
        ] : []),
        { label: 'Pretende Trabalhar', value: data.pretende_trabalhar },
        { label: 'Área de Interesse', value: data.area_trabalho, isFullWidth: true },
      ]
    },
    {
      title: 'Financeiro e Extra',
      icon: DollarSign,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      fields: [
        { label: 'Renda Mensal', value: data.renda_mensal, icon: DollarSign },
        { label: 'Possui Reserva?', value: data.possui_reserva },
        { label: 'Como conheceu?', value: data.como_conheceu },
        { label: 'Observações Finais', value: data.observacoes, isFullWidth: true },
      ] as any[]
    }
  ]

  return (
    <div className="space-y-5">
      {/* Submitter info */}
      <div className="flex items-center gap-3 bg-muted/30 dark:bg-muted/15 px-5 py-4 rounded-xl border border-border/40">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-foreground truncate">{data.nome_completo}</p>
          <p className="text-[11px] text-muted-foreground/60 tabular-nums">
            Respondido em {data.created_at
              ? new Date(data.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((section, idx) => {
          const hasVisibleFields = section.fields.some(f => f.value)
          if (!hasVisibleFields) return null
          return (
            <div
              key={idx}
              className={cn(
                "bg-card border border-border rounded-xl overflow-hidden",
                idx === sections.length - 1 && sections.length % 2 !== 0 ? 'lg:col-span-2' : ''
              )}
            >
              <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2.5">
                <div className={cn("p-1.5 rounded-lg", section.bg)}>
                  <section.icon className={cn("h-3.5 w-3.5", section.color)} />
                </div>
                <h4 className="font-bold text-foreground text-[13px]">{section.title}</h4>
              </div>
              <div className="p-5 space-y-4">
                {section.fields.map((field, fIdx) => {
                  if (!field.value) return null;
                  return (
                    <div key={fIdx}>
                      <p className="text-[10px] text-muted-foreground/50 uppercase font-bold tracking-widest mb-1">
                        {field.label}
                      </p>
                      <p className={cn(
                        "text-[13px] font-semibold text-foreground leading-relaxed",
                        field.isFullWidth ? "whitespace-pre-line" : "break-words"
                      )}>
                        {field.value}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
