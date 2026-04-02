import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { StatusScreen, FormStepState, PagamentoStatus } from './FormularioConsultoria/StatusScreen'
import { Step1 } from './FormularioConsultoria/Step1'
import { Step2 } from './FormularioConsultoria/Step2'
import { Step3 } from './FormularioConsultoria/Step3'

export default function FormularioConsultoria() {
  const { agendamentoId } = useParams<{ agendamentoId: string }>()
  const [step, setStep] = useState<FormStepState>(agendamentoId ? 'loading' : 'form')
  const [error, setError] = useState<string | null>(null)
  const [emailEnviado, setEmailEnviado] = useState('')
  // ID efetivo do agendamento — pode ser diferente do URL quando o backend faz fallback por email
  const [efectiveAgendamentoId, setEfectiveAgendamentoId] = useState<string | undefined>(agendamentoId)

  // Dados de resposta do backend
  const [pagamentoStatus, setPagamentoStatus] = useState<PagamentoStatus>(null)
  const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(null)

  // Stepper de 3 etapas
  const [currentStep, setCurrentStep] = useState(1)

  const [searchParams] = useSearchParams()
  const preNome = searchParams.get('nome') || ''
  const preEmail = searchParams.get('email') || ''
  const preTelefone = searchParams.get('telefone') || ''

  // Dados do formulário
  const [formData, setFormData] = useState({
    nome_completo: preNome,
    parceiro_indicador: '',
    email: preEmail,
    whatsapp: preTelefone,
    nacionalidade: '',
    esteve_europa_6meses: '',
    cidade_pais_residencia: '',
    estado_civil: [] as string[],
    filhos_qtd_idades: '',
    familiares_espanha: '',
    possui_cnh_categoria_ano: '',
    proposta_trabalho_espanha: '',
    visto_ue: '',
    trabalho_destacado_ue: '',
    filhos_nacionalidade_europeia: '',
    pretende_autonomo: [] as string[],
    disposto_estudar: '',
    pretende_trabalhar_espanha: [] as string[],
    escolaridade: [] as string[],
    area_formacao: '',
    situacao_profissional: [] as string[],
    profissao_online_presencial: '',
    profissao: '',
    trabalho_tipo: '',
    trabalho_hibrido_info: '',
    tipo_visto_planejado: '',
    duvidas_consultoria: '',
  })

  // Estados auxiliares (condicionais)
  const [europeAnswer, setEuropeAnswer] = useState<'yes' | 'no' | null>(
    formData.esteve_europa_6meses?.toLowerCase().startsWith('nao') ? 'no' :
    formData.esteve_europa_6meses ? 'yes' : null
  )
  const [residenciaAnswer, setResidenciaAnswer] = useState<'yes' | 'no' | null>(
    formData.cidade_pais_residencia ? 'yes' : null
  )
  const [parceiroAnswer, setParceiroAnswer] = useState<'yes' | 'no' | null>(null)
  const [filhosAnswer, setFilhosAnswer] = useState<'yes' | 'no' | null>(
    formData.filhos_qtd_idades.toLowerCase().includes('nao tenho') ? 'no' :
    formData.filhos_qtd_idades ? 'yes' : null
  )
  const [familiaresEspanhaAnswer, setFamiliaresEspanhaAnswer] = useState<'yes' | 'no' | null>(
    formData.familiares_espanha.toLowerCase().includes('nao tenho') ? 'no' :
    formData.familiares_espanha ? 'yes' : null
  )
  const [vistoUeAnswer, setVistoUeAnswer] = useState<'yes' | 'no' | null>(
    formData.visto_ue.toLowerCase().includes('nao tenho') ? 'no' :
    formData.visto_ue ? 'yes' : null
  )
  const [filhosEuropeusAnswer, setFilhosEuropeusAnswer] = useState<'yes' | 'no' | null>(
    formData.filhos_nacionalidade_europeia.toLowerCase().includes('nao tenho') ? 'no' :
    formData.filhos_nacionalidade_europeia ? 'yes' : null
  )
  const [cnhAnswer, setCnhAnswer] = useState<'yes' | 'no' | null>(
    formData.possui_cnh_categoria_ano.toLowerCase().includes('não possuo') ? 'no' :
    formData.possui_cnh_categoria_ano ? 'yes' : null
  )
  const [propostaTrabalhoAnswer, setPropostaTrabalhoAnswer] = useState<'yes' | 'no' | null>(
    formData.proposta_trabalho_espanha.toLowerCase() === 'não' ? 'no' :
    formData.proposta_trabalho_espanha ? 'yes' : null
  )
  const [trabalhoDestacadoAnswer, setTrabalhoDestacadoAnswer] = useState<'yes' | 'no' | null>(
    formData.trabalho_destacado_ue.toLowerCase() === 'não' ? 'no' :
    formData.trabalho_destacado_ue ? 'yes' : null
  )
  const [tipoVistoAnswer, setTipoVistoAnswer] = useState<'yes' | 'no' | null>(
    formData.tipo_visto_planejado.toLowerCase().includes('ainda não sei') ? 'no' :
    formData.tipo_visto_planejado ? 'yes' : null
  )

  const isStep1Complete = useCallback(() => !!(
    formData.nome_completo.trim() &&
    formData.email.trim() &&
    formData.whatsapp.trim() &&
    formData.nacionalidade.trim() &&
    formData.esteve_europa_6meses.trim() &&
    formData.cidade_pais_residencia.trim()
  ), [formData])

  const isStep2Complete = useCallback(() => !!(
    formData.estado_civil.length > 0 &&
    formData.filhos_qtd_idades.trim() &&
    formData.familiares_espanha.trim() &&
    formData.possui_cnh_categoria_ano.trim() &&
    formData.proposta_trabalho_espanha.trim() &&
    formData.visto_ue.trim() &&
    formData.trabalho_destacado_ue.trim() &&
    formData.filhos_nacionalidade_europeia.trim() &&
    formData.pretende_autonomo.length > 0
  ), [formData])

  const isStep3Complete = useCallback(() => !!(
    formData.disposto_estudar &&
    formData.pretende_trabalhar_espanha.length > 0 &&
    formData.escolaridade.length > 0 &&
    formData.area_formacao.trim() &&
    formData.situacao_profissional.length > 0 &&
    formData.profissao.trim() &&
    formData.trabalho_tipo.trim() &&
    formData.tipo_visto_planejado.trim() &&
    formData.duvidas_consultoria.trim()
  ), [formData])

  useEffect(() => {
    if (!agendamentoId) return

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
    if (!backendUrl) {
      setStep('form')
      return
    }

    async function checkStatus() {
      try {
        // Passa o email como query param para permitir fallback no backend
        // quando o agendamento_id do link for antigo/inválido
        const emailParam = preEmail ? `&email=${encodeURIComponent(preEmail)}` : ''
        const response = await fetch(`${backendUrl}/formulario/consultoria/${agendamentoId}/status?${emailParam.replace(/^&/, '')}`)
        if (!response.ok) {
          setStep('nao_encontrado')
          return
        }

        const data = await response.json()
        if (!data.found) {
          setStep('nao_encontrado')
          return
        }

        // Se o backend encontrou via fallback por email, usa o ID real do agendamento
        if (data.redirect_id && data.redirect_id !== agendamentoId) {
          console.log('[FormularioConsultoria] Redirecionando para agendamento ativo:', data.redirect_id)
          setEfectiveAgendamentoId(data.redirect_id)
        }
        if (data.bloqueado_cron) {
          setStep('bloqueado')
          return
        }
        if (data.cancelado) {
          setStep('cancelado')
          return
        }
        if (data.expirado) {
          setStep('expirado')
          return
        }
        if (data.formulario_preenchido) {
          const pgStatus = data.pagamento_status
          if (pgStatus === 'aprovado') setStep('status_aprovado')
          else if (pgStatus === 'em_analise') setStep('status_em_analise')
          else if (pgStatus === 'recusado') setStep('status_recusado')
          else if (pgStatus === 'pendente') setStep('status_pendente')
          else setStep('status_ja_preenchido')
          return
        }

        if (data.dna) {
          setFormData(prev => ({ ...prev, ...data.dna }))
        }
        setStep('form')
      } catch (err) {
        console.error('Erro ao verificar status do agendamento:', err)
        setStep('form')
      }
    }
    checkStatus()
  }, [agendamentoId])

  const nextStep = () => {
    if (currentStep === 1 && !isStep1Complete()) {
      setError('Preencha todos os campos obrigatórios antes de continuar.')
      return
    }
    if (currentStep === 2 && !isStep2Complete()) {
      setError('Preencha todos os campos obrigatórios desta etapa antes de continuar.')
      return
    }
    setError(null)
    setCurrentStep(prev => Math.min(prev + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setError(null)
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData((prev: any) => {
      const current = (prev[field] as string[]) || []
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const erros: string[] = []
    if (!isStep1Complete()) erros.push('Identificação e Dados Pessoais (Etapa 1)')
    if (!isStep2Complete()) erros.push('Situação Familiar e Documentos (Etapa 2)')
    if (!isStep3Complete()) erros.push('Educação, Trabalho e Objetivos (Etapa 3)')

    if (erros.length > 0) {
      setError(`Preencha as seções obrigatórias:\n• ${erros.join('\n• ')}`)
      if (!isStep1Complete()) setCurrentStep(1)
      else if (!isStep2Complete()) setCurrentStep(2)
      else setCurrentStep(3)
      return
    }

    setStep('submitting')

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
    if (!backendUrl) {
      setError('Erro de configuração. URL do backend não encontrada.')
      setStep('form')
      return
    }

    try {
      const trabalhotipoInfo = formData.trabalho_tipo === 'Híbrido' && formData.trabalho_hibrido_info
        ? `${formData.trabalho_tipo} (${formData.trabalho_hibrido_info})`
        : formData.trabalho_tipo
      const profissaoOlinePresencial = `${formData.profissao} - ${trabalhotipoInfo}`
      const response = await fetch(`${backendUrl}/formulario/consultoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, profissao_online_presencial: profissaoOlinePresencial, agendamento_id: efectiveAgendamentoId || agendamentoId || null })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Erro ao enviar formulário')

      setEmailEnviado(formData.email)
      setPagamentoStatus(data.pagamento_status || null)
      setComprovanteUrl(data.comprovante_url || null)
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar formulário. Tente novamente.')
      setStep('form')
    }
  }

  if (step !== 'form') {
    return (
      <StatusScreen
        step={step}
        pagamentoStatus={pagamentoStatus}
        comprovanteUrl={comprovanteUrl}
        emailEnviado={emailEnviado}
      />
    )
  }

  const stepLabels = ['Identificação', 'Situação Familiar', 'Educação e Planos']

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
              B
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Formulário Consultoria</h1>
              <p className="text-gray-400 text-sm">Imigração 🇪🇸 🇵🇹</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
            Preencha o formulário abaixo com suas informações. Ao finalizar, sua conta será criada automaticamente e as informações serão enviadas para seu email.
          </p>
        </div>
      </div>

      {/* Aviso Importante */}
      <div className="max-w-3xl mx-auto px-6 pb-6">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-400 font-bold text-sm mb-2">⚠️ Importante:</p>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>Use o mesmo e-mail que você utilizou para fazer o agendamento. Se for diferente, o sistema não consegue confirmar a sua consultoria.</li>
            <li>Quem vai participar da consultoria é quem precisa preencher o formulário. (Ex.: se a consultoria é para você, não deixe outra pessoa preencher por você.)</li>
          </ol>
          <p className="text-gray-400 text-sm mt-2">Esse formulário é essencial para que possamos analisar o seu caso e garantir um atendimento realmente personalizado.</p>
        </div>
      </div>

      {/* Stepper indicator */}
      <div className="max-w-3xl mx-auto px-6 pb-8">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1
            const isActive = currentStep === stepNum
            const isCompleted = currentStep > stepNum
            return (
              <div key={stepNum} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20' : 'bg-white/10 text-gray-500'}`}>
                    {isCompleted ? '✓' : stepNum}
                  </div>
                  <span className={`mt-2 text-xs font-semibold transition-colors ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-gray-500'}`}>{label}</span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 mb-6 rounded transition-colors duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <Step1
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            preNome={preNome}
            preEmail={preEmail}
            preTelefone={preTelefone}
            europeAnswer={europeAnswer}
            setEuropeAnswer={setEuropeAnswer}
            residenciaAnswer={residenciaAnswer}
            setResidenciaAnswer={setResidenciaAnswer}
            parceiroAnswer={parceiroAnswer}
            setParceiroAnswer={setParceiroAnswer}
            setFormData={setFormData}
          />
        )}

        {currentStep === 2 && (
          <Step2
            formData={formData}
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
            prevStep={prevStep}
            nextStep={nextStep}
            filhosAnswer={filhosAnswer}
            setFilhosAnswer={setFilhosAnswer}
            familiaresEspanhaAnswer={familiaresEspanhaAnswer}
            setFamiliaresEspanhaAnswer={setFamiliaresEspanhaAnswer}
            cnhAnswer={cnhAnswer}
            setCnhAnswer={setCnhAnswer}
            propostaTrabalhoAnswer={propostaTrabalhoAnswer}
            setPropostaTrabalhoAnswer={setPropostaTrabalhoAnswer}
            vistoUeAnswer={vistoUeAnswer}
            setVistoUeAnswer={setVistoUeAnswer}
            trabalhoDestacadoAnswer={trabalhoDestacadoAnswer}
            setTrabalhoDestacadoAnswer={setTrabalhoDestacadoAnswer}
            filhosEuropeusAnswer={filhosEuropeusAnswer}
            setFilhosEuropeusAnswer={setFilhosEuropeusAnswer}
            setFormData={setFormData}
          />
        )}

        {currentStep === 3 && (
          <Step3
            formData={formData}
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
            prevStep={prevStep}
            tipoVistoAnswer={tipoVistoAnswer}
            setTipoVistoAnswer={setTipoVistoAnswer}
            setFormData={setFormData}
          />
        )}
      </form>
    </div>
  )
}
