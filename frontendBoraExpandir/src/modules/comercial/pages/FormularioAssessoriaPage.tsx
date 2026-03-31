import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, Loader2 } from 'lucide-react'
import comercialService, { getConsultoriasCount } from '../services/comercialService'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import type { ContratoServico } from '../../../types/comercial'
import {
  formatCpfDisplay,
  formatPhoneDisplay,
  maskCpfInput,
  maskPhoneInput,
  normalizeCpf,
  normalizePhone,
  onlyDigits
} from '../../../utils/formatters'

function numberToPortuguese(n: number): string {
  if (n === 0) return 'zero'
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']
  if (n === 100) return 'cem'
  if (n >= 1000) {
    const mil = Math.floor(n / 1000)
    const rest = n % 1000
    const milStr = mil === 1 ? 'mil' : `${numberToPortuguese(mil)} mil`
    return rest === 0 ? milStr : `${milStr} e ${numberToPortuguese(rest)}`
  }
  if (n >= 100) {
    const rest = n % 100
    return rest === 0 ? hundreds[Math.floor(n / 100)] : `${hundreds[Math.floor(n / 100)]} e ${numberToPortuguese(rest)}`
  }
  if (n >= 20) {
    const rest = n % 10
    return rest === 0 ? tens[Math.floor(n / 10)] : `${tens[Math.floor(n / 10)]} e ${units[rest]}`
  }
  if (n >= 10) return teens[n - 10]
  return units[n]
}

const ESTADOS_CIVIS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável'
]

// Steps: 1 - Dados Pessoais, 2 - Servicos e Valores, 3 - Pagamento e Data, 4 - Resumo/Gerar

type FormularioDraft = {
  nome: string
  nacionalidade: string
  estado_civil: string
  profissao: string
  documento: string
  endereco: string
  email: string
  telefone: string
  tipo_servico: string
  descricao_pessoas: string
  valor_pavao: string
  valor_desconto: string
  valor_consultoria: string
  valor_final?: string
  metodo_pagamento: 'pix' | 'boleto' | ''
  forma_pagamento: string
  formaPagamento: string
  boleto_valor_entrada: string
  boleto_valor_parcela: string
  boleto_quantidade_parcelas: string
  dependentes?: string
}

const emptyFormData: FormularioDraft = {
  nome: '',
  nacionalidade: '',
  estado_civil: '',
  profissao: '',
  documento: '',
  endereco: '',
  email: '',
  telefone: '',
  tipo_servico: 'Assessoria de Imigracao',
  descricao_pessoas: '',
  valor_pavao: '',
  valor_desconto: '',
  valor_consultoria: '',
  metodo_pagamento: '',
  forma_pagamento: '',
  formaPagamento: '',
  boleto_valor_entrada: '',
  boleto_valor_parcela: '',
  boleto_quantidade_parcelas: '1'
}

export default function FormularioAssessoriaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contratoGerado, setContratoGerado] = useState(false)
  const [etapaAtual, setEtapaAtual] = useState(1)
  const [formData, setFormData] = useState<FormularioDraft>(emptyFormData)
  const [contrato, setContrato] = useState<ContratoServico | null>(null)
  const [erroGeracao, setErroGeracao] = useState<any>(null)
  const [dependentes, setDependentes] = useState<Array<{nome: string, grau: string, data_nascimento: string, valor: string}>>([])
  const [valorTitular, setValorTitular] = useState('')
  const [titularesAdicionais, setTitularesAdicionais] = useState<Array<{ nome: string; valor: string }>>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [consultoriaDesconto, setConsultoriaDesconto] = useState<{ total: number; valor: number } | null>(null)
  const [consultoriaOverride, setConsultoriaOverride] = useState('')

  const parseNumericoLocal = (val: string) => {
    if (!val) return 0
    const n = parseFloat(val.trim().replace(/\./g, '').replace(/,/g, '.'))
    return isNaN(n) ? 0 : n
  }

  const consultoriaValorEfetivo = consultoriaOverride.trim()
    ? parseNumericoLocal(consultoriaOverride)
    : (consultoriaDesconto?.valor || 0)
  const valorFinalReal = Math.max(0, (parseNumericoLocal(formData.valor_desconto) || 0) - consultoriaValorEfetivo)

  // Auto-calcular valor_pavao quando titular ou dependentes mudam
  const valorTitularNum = parseNumericoLocal(valorTitular)
  const valorTotalCalculado = valorTitularNum > 0
    ? valorTitularNum
      + titularesAdicionais.reduce((sum, t) => sum + parseNumericoLocal(t.valor || ''), 0)
      + dependentes.reduce((sum, dep) => sum + parseNumericoLocal(dep.valor || ''), 0)
    : 0

  const initializedRef = useRef(false)
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLockedByGeracaoErro = Boolean(erroGeracao?.ativo)

  const hydrateFromContrato = (data: any) => {
    const draft = data?.draft_dados || {}
    const erro = draft?.__erroGeracao?.ativo ? draft.__erroGeracao : null

    setContrato(data)
    setErroGeracao(erro)

    const documentoBase = draft.documento || data.cliente?.cpf || data.cliente?.documento || ''
    const documentoFormatado = onlyDigits(documentoBase).length === 11
      ? formatCpfDisplay(documentoBase)
      : String(documentoBase || '')

    setFormData({
      nome: draft.nome || data.cliente_nome || data.cliente?.nome || '',
      nacionalidade: draft.nacionalidade || '',
      estado_civil: draft.estado_civil || '',
      profissao: draft.profissao || '',
      documento: documentoFormatado,
      endereco: draft.endereco || data.cliente?.endereco || '',
      email: draft.email || data.cliente_email || data.cliente?.email || '',
      telefone: formatPhoneDisplay(draft.telefone || data.cliente_telefone || data.cliente?.whatsapp || ''),
      tipo_servico: draft.tipo_servico || data.subservico_nome || data.servico_nome || 'Assessoria de Imigracao',
      descricao_pessoas: draft.descricao_pessoas || '',
      valor_pavao: String(draft.valor_pavao || ''),
      valor_desconto: String(draft.valor_desconto || ''),
      valor_consultoria: String(draft.valor_consultoria || ''),
      metodo_pagamento: (draft.metodo_pagamento || (draft.forma_pagamento?.toLowerCase().includes('boleto') ? 'boleto' : 'pix')) as 'pix' | 'boleto' | '',
      forma_pagamento: draft.forma_pagamento || draft.formaPagamento || '',
      formaPagamento: draft.forma_pagamento || draft.formaPagamento || '',
      boleto_valor_entrada: String(draft.boleto_valor_entrada || data.boleto_valor_entrada || ''),
      boleto_valor_parcela: String(draft.boleto_valor_parcela || data.boleto_valor_parcela || ''),
      boleto_quantidade_parcelas: String(draft.boleto_quantidade_parcelas || data.boleto_quantidade_parcelas || '1')
    })

    // Se havia valor_consultoria manual salvo no draft, pre-preencher o override
    if (draft.valor_consultoria) {
      setConsultoriaOverride(String(draft.valor_consultoria))
    }

    // Restaurar valor do titular
    if (draft.valor_titular) {
      setValorTitular(String(draft.valor_titular))
    }

    try {
      const depsData = draft.dependentes ? JSON.parse(draft.dependentes) : []
      setDependentes(Array.isArray(depsData) ? depsData.map((d: any) => ({
        nome: d.nome || '',
        grau: d.grau || '',
        data_nascimento: d.data_nascimento || '',
        valor: d.valor || ''
      })) : [])
    } catch {
      setDependentes([])
    }

    try {
      const titData = draft.titularesAdicionais ? JSON.parse(draft.titularesAdicionais) : []
      setTitularesAdicionais(Array.isArray(titData) ? titData.map((t: any) => ({
        nome: t.nome || '',
        valor: t.valor || ''
      })) : [])
    } catch {
      setTitularesAdicionais([])
    }

    const etapaErro = Number(erro?.etapa || 4)
    const etapaPersistida = Number(data.etapa_fluxo || 1)
    setEtapaAtual(erro ? etapaErro : etapaPersistida)
  }

  const fetchDraft = async () => {
    if (!id) return

    try {
      setLoading(true)
      const data = await comercialService.getContratoServicoById(id)

      if (!data?.is_draft) {
        navigate(`/comercial/contratos/${id}`, { replace: true })
        return
      }

      // NOVO: Buscar o DNA atualizado do cliente
      if (data.cliente_id) {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cliente/${data.cliente_id}/dna`);
          if (res.ok) {
            const dnaData = await res.json();
            if (dnaData.data && Object.keys(dnaData.data).length > 0) {
              // Os dados DNA sobrescrevem ou complementam o draft_dados atual (Prioridade de visualização)
              data.draft_dados = { ...data.draft_dados, ...dnaData.data };
            }
          }
        } catch (err) {
          console.error('[FormularioAssessoria] Erro ao buscar DNA:', err);
        }
      }

      hydrateFromContrato(data)
      initializedRef.current = true

      // Buscar desconto de consultoria
      if (data.cliente_id) {
        try {
          const descontoData = await getConsultoriasCount(data.cliente_id)
          setConsultoriaDesconto({ total: descontoData.total_consultorias, valor: descontoData.valor_desconto })
        } catch (err) {
          console.error('[FormularioAssessoria] Erro ao buscar desconto consultoria:', err)
        }
      }
    } catch (err: any) {
      toast.error('Erro ao carregar rascunho: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const buildDraftPayload = (source: FormularioDraft) => {
    const metodoPagamento =
      source.metodo_pagamento === 'boleto'
        ? 'boleto'
        : source.metodo_pagamento === 'pix'
          ? 'pix'
          : ''
    const boletoQtd = Math.max(1, Math.min(3, Number(source.boleto_quantidade_parcelas || '1')))
    const formaPagamentoContrato = metodoPagamento === 'boleto'
      ? `Pagamento via BOLETO: entrada de R$ ${source.boleto_valor_entrada || '0,00'} + ${boletoQtd} parcela(s) de R$ ${source.boleto_valor_parcela || '0,00'}, com cobrança mensal no mesmo dia da criação do serviço.`
      : metodoPagamento === 'pix'
        ? 'Pagamento via PIX (com envio de comprovante).'
        : ''

    const parseNumerico = (val: string) => parseFloat(val.trim().replace(/\./g, '').replace(/,/g, '.'))
    
    const formatarMoeda = (val: string) => {
      if (!val) return val
      const num = Math.floor(parseNumerico(val))
      if (!isNaN(num) && !val.toLowerCase().includes('euro')) {
        return `${num} (${numberToPortuguese(num)} euros)`
      }
      return val
    }

    // Cálculo dinâmico do valor final: Valor com desconto - valor consultorias
    const valorDescontoNum = parseNumerico(source.valor_desconto) || 0
    const valorDesc = consultoriaDesconto?.valor || 0
    const finalValue = Math.max(0, valorDescontoNum - valorDesc)
    
    // Auto-preencher valor de consultoria se vazio e houver desconto
    let vConsultoria = formatarMoeda(source.valor_consultoria)
    if (!vConsultoria && valorDesc > 0) {
      vConsultoria = `${valorDesc} (${numberToPortuguese(valorDesc)} euros)`
    }
    
    const valorFinalExtenso = finalValue > 0 ? `${finalValue} (${numberToPortuguese(finalValue)} euros)` : ''

    const payload: Record<string, any> = {
      ...source,
      valor_pavao: formatarMoeda(source.valor_pavao),
      valor_desconto: formatarMoeda(source.valor_desconto),
      metodo_pagamento: metodoPagamento,
      boleto_quantidade_parcelas: String(boletoQtd),
      forma_pagamento: formaPagamentoContrato,
      formaPagamento: formaPagamentoContrato,
      valor_consultoria: vConsultoria,
      valor_final: finalValue,
      valor_final_extenso: valorFinalExtenso
    }

    if (metodoPagamento !== 'boleto') {
      payload.boleto_valor_entrada = ''
      payload.boleto_valor_parcela = ''
      payload.boleto_quantidade_parcelas = '1'
    }

    payload.telefone = normalizePhone(payload.telefone)

    const documentoDigits = onlyDigits(payload.documento)
    if (documentoDigits.length === 11) {
      payload.documento = normalizeCpf(payload.documento)
    }

    const adicionaisText = titularesAdicionais.length > 0
      ? `; ` + titularesAdicionais.map(t => `${t.nome} (Titular)`).filter(Boolean).join(' / ')
      : ''
    const depText = dependentes.length > 0
      ? `; ` + dependentes.map(d => `${d.nome} (${d.grau})`).filter(Boolean).join(' / ')
      : ''
    payload.descricao_pessoas = `${payload.nome} (Titular)${adicionaisText}${depText}`
    payload.dependentes = JSON.stringify(dependentes)

    if (titularesAdicionais.length > 0) {
      payload.titularesAdicionais = JSON.stringify(titularesAdicionais)
    }

    // Salvar valor do titular e recalcular valor_pavao se houver valores individuais
    const vTitularNum = parseNumerico(valorTitular) || 0
    if (vTitularNum > 0) {
      payload.valor_titular = valorTitular
      const totalCalculado = vTitularNum
        + titularesAdicionais.reduce((sum, t) => sum + (parseNumerico(t.valor || '') || 0), 0)
        + dependentes.reduce((sum, dep) => sum + (parseNumerico(dep.valor || '') || 0), 0)
      payload.valor_pavao = formatarMoeda(String(totalCalculado))
    }

    return payload
  }

  const persistDraft = async (novaEtapa: number, sourceData: FormularioDraft, options?: { silent?: boolean }) => {
    if (!id) return

    const silent = options?.silent === true
    const payload = buildDraftPayload(sourceData)

    if (!silent) setSaving(true)
    try {
      const updated = await comercialService.updateContratoDraft(id, {
        etapa_fluxo: novaEtapa,
        draft_dados: payload
      })

      if (updated) {
        setContrato(prev => ({
          ...(prev || {} as ContratoServico),
          ...updated,
          draft_dados: updated.draft_dados || payload,
          etapa_fluxo: updated.etapa_fluxo || novaEtapa
        }))
      }
    } finally {
      if (!silent) setSaving(false)
    }
  }

  useEffect(() => {
    if (!id || !initializedRef.current || isLockedByGeracaoErro) return

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      persistDraft(etapaAtual, formData, { silent: true }).catch((err: any) => {
        console.error('Erro no auto-save do contrato:', err)
      })
    }, 700)

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, titularesAdicionais, etapaAtual, id, isLockedByGeracaoErro])

  const validateStep = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (step === 1) {
      if (!formData.nome.trim()) errors.nome = 'Informe o nome'
      const cpfDigits = onlyDigits(formData.documento)
      if (!cpfDigits) {
        errors.documento = 'Informe o CPF'
      } else if (cpfDigits.length !== 11) {
        errors.documento = 'CPF deve ter exatamente 11 dígitos'
      }
      if (!formData.nacionalidade.trim()) errors.nacionalidade = 'Informe a nacionalidade'
      if (!formData.estado_civil) errors.estado_civil = 'Selecione o estado civil'
      if (!formData.profissao.trim()) errors.profissao = 'Informe a profissão'
      if (!formData.email.trim()) errors.email = 'Informe o email'
      if (!formData.telefone.trim()) errors.telefone = 'Informe o telefone'
      if (!formData.endereco.trim()) errors.endereco = 'Informe o endereço'
    }
    if (step === 2) {
      if (!formData.tipo_servico.trim()) errors.tipo_servico = 'Informe o tipo de serviço'
      if (!formData.valor_pavao.trim()) errors.valor_pavao = 'Informe o valor total'
      if (!formData.valor_desconto.trim()) errors.valor_desconto = 'Informe o valor com desconto'
    }
    if (step === 3) {
      if (!formData.metodo_pagamento) {
        errors.metodo_pagamento = 'Selecione o método de pagamento'
      }
      if (formData.metodo_pagamento === 'boleto') {
        if (!formData.boleto_valor_entrada.trim()) errors.boleto_valor_entrada = 'Informe o valor da entrada'
        if (!formData.boleto_valor_parcela.trim()) errors.boleto_valor_parcela = 'Informe o valor das parcelas'
        const qtd = Number(formData.boleto_quantidade_parcelas || '0')
        if (!qtd || qtd < 1 || qtd > 3) errors.boleto_quantidade_parcelas = 'Quantidade deve ser entre 1 e 3'
      }
    }
    return errors
  }

  const handleNext = async () => {
    if (isLockedByGeracaoErro) {
      toast.warning('Este contrato esta bloqueado por erro de geracao. Tente gerar novamente para desbloquear.')
      return
    }

    const errors = validateStep(etapaAtual)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Preencha todos os campos obrigatórios antes de avançar')
      return
    }
    setValidationErrors({})

    const proximaEtapa = Math.min(etapaAtual + 1, 4)
    try {
      await persistDraft(proximaEtapa, formData)
      setEtapaAtual(proximaEtapa)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar rascunho')
    }
  }

  const handleBack = async () => {
    if (isLockedByGeracaoErro) {
      toast.warning('Contrato travado por erro de geracao. Refaça a geracao para continuar.')
      return
    }

    if (etapaAtual > 1) {
      const etapaAnterior = etapaAtual - 1
      try {
        await persistDraft(etapaAnterior, formData)
        setEtapaAtual(etapaAnterior)
      } catch (err: any) {
        toast.error(err.message || 'Erro ao salvar rascunho')
      }
      return
    }

    navigate(-1)
  }

  const handleGerarContrato = async () => {
    if (!id) return

    try {
      setSaving(true)
      await persistDraft(4, formData, { silent: true })
      const res = await comercialService.gerarContratoPdf(id)

      const updatedData = res?.data || null
      if (updatedData) {
        hydrateFromContrato(updatedData)
      } else if (res?.url) {
        setContrato(prev => prev ? { ...prev, contrato_gerado_url: res.url } : prev)
      }

      if (!res?.url) {
        throw new Error('Nao foi possivel gerar o contrato neste momento.')
      }

      setContratoGerado(true)
      toast.success('Contrato gerado com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao gerar contrato: ' + err.message)

      try {
        const fresh = await comercialService.getContratoServicoById(id)
        if (fresh?.is_draft) {
          hydrateFromContrato(fresh)
        }
      } catch (refreshError) {
        console.error('Erro ao atualizar estado do rascunho apos falha de geracao:', refreshError)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleFinalizarEEnviar = async () => {
    if (!id) return

    if (isLockedByGeracaoErro) {
      toast.error('Este contrato esta bloqueado por erro de geracao. Corrija e gere novamente antes de enviar.')
      return
    }

    if (!formData.email) {
      toast.error('Email do cliente e obrigatorio para enviar o contrato')
      return
    }

    try {
      setSaving(true)
      const contratoAtualizado = await comercialService.enviarContratoAssinatura(id, formData.email)

      // Download automatico do contrato com a assinatura da empresa (Bora Expandir)
      const pdfUrl = contratoAtualizado?.contrato_gerado_url || contrato?.contrato_gerado_url
      if (pdfUrl) {
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = `contrato-${formData.nome || 'cliente'}.pdf`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast.success('Contrato enviado com sucesso!')
      navigate(`/comercial/contratos/${id}`)
    } catch (err: any) {
      toast.error('Erro ao enviar contrato: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-3xl mx-auto space-y-6">
      <button
        onClick={handleBack}
        disabled={saving || isLockedByGeracaoErro}
        className="text-gray-500 hover:text-gray-900 disabled:opacity-50 dark:hover:text-white flex items-center gap-1 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Formulario: Contrato de Assessoria</h1>
        <p className="text-gray-500 text-sm mt-1">Preencha as informacoes para gerar e enviar o contrato. O rascunho e salvo por etapa e por alteracao.</p>
      </div>

      {isLockedByGeracaoErro && (
        <div className="rounded-xl border border-red-300 bg-red-50 text-red-800 p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Contrato travado por erro de geracao
          </div>
          <p className="text-sm">{erroGeracao?.mensagem || 'Nao foi possivel gerar o contrato.'}</p>
          <p className="text-xs opacity-80">Etapa bloqueada: {Number(erroGeracao?.etapa || 4)}</p>
          <button
            onClick={handleGerarContrato}
            disabled={saving}
            className="mt-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            Tentar gerar novamente {saving && <Loader2 className="inline w-4 h-4 ml-1 animate-spin" />}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8 mt-4 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-neutral-800 -z-10 -translate-y-1/2 rounded-full" />
        <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-out" style={{ width: `${((etapaAtual - 1) / 3) * 100}%` }} />

        {[{ n: 1, label: 'Dados' }, { n: 2, label: 'Valores' }, { n: 3, label: 'Pagamento' }, { n: 4, label: 'Resumo' }].map(({ n, label }) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${etapaAtual >= n ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-200 dark:bg-neutral-800 text-gray-500'}`}>
              {etapaAtual > n ? <CheckCircle2 className="w-5 h-5" /> : n}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider hidden md:block ${etapaAtual >= n ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">

        {etapaAtual === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo *</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.nome} onChange={(e) => { setFormData({ ...formData, nome: e.target.value }); if (e.target.value.trim()) setValidationErrors(prev => ({ ...prev, nome: '' })) }} className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.nome ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`} />
                {validationErrors.nome && <p className="text-red-500 text-xs mt-1">{validationErrors.nome}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF *</label>
                <input
                  type="text"
                  disabled={saving || isLockedByGeracaoErro}
                  value={formData.documento}
                  maxLength={14}
                  onChange={(e) => {
                    const valor = e.target.value
                    const digits = onlyDigits(valor)
                    if (digits.length > 11) return
                    const masked = maskCpfInput(valor)
                    setFormData({ ...formData, documento: masked })
                    if (digits.length === 11) setValidationErrors(prev => ({ ...prev, documento: '' }))
                  }}
                  placeholder="000.000.000-00"
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.documento ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`}
                />
                {validationErrors.documento && <p className="text-red-500 text-xs mt-1">{validationErrors.documento}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nacionalidade *</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.nacionalidade} onChange={(e) => { setFormData({ ...formData, nacionalidade: e.target.value }); if (e.target.value.trim()) setValidationErrors(prev => ({ ...prev, nacionalidade: '' })) }} className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.nacionalidade ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado Civil *</label>
                <select
                  disabled={saving || isLockedByGeracaoErro}
                  value={formData.estado_civil}
                  onChange={(e) => { setFormData({ ...formData, estado_civil: e.target.value }); if (e.target.value) setValidationErrors(prev => ({ ...prev, estado_civil: '' })) }}
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.estado_civil ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`}
                >
                  <option value="">Selecione...</option>
                  {ESTADOS_CIVIS.map(ec => (
                    <option key={ec} value={ec}>{ec}</option>
                  ))}
                </select>
                {validationErrors.estado_civil && <p className="text-red-500 text-xs mt-1">{validationErrors.estado_civil}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profissão *</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.profissao} onChange={(e) => { setFormData({ ...formData, profissao: e.target.value }); if (e.target.value.trim()) setValidationErrors(prev => ({ ...prev, profissao: '' })) }} className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.profissao ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`} />
                {validationErrors.profissao && <p className="text-red-500 text-xs mt-1">{validationErrors.profissao}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail *</label>
                <input type="email" disabled={saving || isLockedByGeracaoErro} value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (e.target.value.trim()) setValidationErrors(prev => ({ ...prev, email: '' })) }} className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.email ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`} />
                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone (DDD / DDI) *</label>
                <input
                  type="text"
                  disabled={saving || isLockedByGeracaoErro}
                  value={formData.telefone}
                  onChange={(e) => { setFormData({ ...formData, telefone: maskPhoneInput(e.target.value) }); if (e.target.value.trim()) setValidationErrors(prev => ({ ...prev, telefone: '' })) }}
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.telefone ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`}
                />
                {validationErrors.telefone && <p className="text-red-500 text-xs mt-1">{validationErrors.telefone}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço Completo *</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.endereco} onChange={(e) => { setFormData({ ...formData, endereco: e.target.value }); if (e.target.value.trim()) setValidationErrors(prev => ({ ...prev, endereco: '' })) }} className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.endereco ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`} />
                {validationErrors.endereco && <p className="text-red-500 text-xs mt-1">{validationErrors.endereco}</p>}
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={handleNext} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                Proximo {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Servicos e Valores</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Servico</label>
              <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.tipo_servico} onChange={(e) => setFormData({ ...formData, tipo_servico: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titulares e Dependentes (Descrição)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-md">Total Membros: {1 + titularesAdicionais.length + dependentes.length}</span>
                  <button
                    type="button"
                    disabled={saving || isLockedByGeracaoErro}
                    onClick={() => setTitularesAdicionais(prev => [...prev, { nome: '', valor: '' }])}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 flex items-center gap-1"
                  >
                    + Adicionar Outro Titular
                  </button>
                  <button
                    type="button"
                    disabled={saving || isLockedByGeracaoErro}
                    onClick={() => setDependentes(prev => [...prev, { nome: '', grau: '', data_nascimento: '', valor: '' }])}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm disabled:opacity-50 flex items-center gap-1"
                  >
                    + Adicionar Dependente
                  </button>
                </div>
              </div>

              {/* Valor do Titular */}
              <div className="mb-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Valor do Titular (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ex: 1000"
                      disabled={saving || isLockedByGeracaoErro}
                      value={valorTitular}
                      onChange={(e) => {
                        setValorTitular(e.target.value)
                        // Recalcular total automaticamente
                        const titNum = parseNumericoLocal(e.target.value)
                        if (titNum > 0) {
                          const total = titNum
                            + titularesAdicionais.reduce((sum, t) => sum + parseNumericoLocal(t.valor || ''), 0)
                            + dependentes.reduce((sum, dep) => sum + parseNumericoLocal(dep.valor || ''), 0)
                          setFormData(prev => ({ ...prev, valor_pavao: String(total) }))
                        }
                      }}
                      className="w-full border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                    />
                  </div>
                  {valorTotalCalculado > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Calculado</p>
                      <p className="text-lg font-bold text-emerald-600">€ {valorTotalCalculado}</p>
                      <p className="text-[10px] text-gray-400">{1 + titularesAdicionais.length + dependentes.length} membro(s)</p>
                    </div>
                  )}
                </div>
              </div>

              {titularesAdicionais.length > 0 && (
                <div className="bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded-xl border border-blue-200/50 dark:border-blue-800/30 space-y-3 mt-2">
                  {titularesAdicionais.map((tit, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-3 items-end bg-white dark:bg-neutral-800 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 relative group">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
                        <input
                          type="text"
                          disabled={saving || isLockedByGeracaoErro}
                          value={tit.nome}
                          onChange={(e) => setTitularesAdicionais(prev => prev.map((x, idx) => idx === i ? { ...x, nome: e.target.value } : x))}
                          className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="block text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Valor (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Ex: 1000"
                          disabled={saving || isLockedByGeracaoErro}
                          value={tit.valor || ''}
                          onChange={(e) => {
                            const newTits = titularesAdicionais.map((x, idx) => idx === i ? { ...x, valor: e.target.value } : x)
                            setTitularesAdicionais(newTits)
                            const titNum = parseNumericoLocal(valorTitular)
                            if (titNum > 0) {
                              const total = titNum
                                + newTits.reduce((sum, t) => sum + parseNumericoLocal(t.valor || ''), 0)
                                + dependentes.reduce((sum, dep) => sum + parseNumericoLocal(dep.valor || ''), 0)
                              setFormData(prev => ({ ...prev, valor_pavao: String(total) }))
                            }
                          }}
                          className="w-full border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={saving || isLockedByGeracaoErro}
                        onClick={() => {
                          const newTits = titularesAdicionais.filter((_, idx) => idx !== i)
                          setTitularesAdicionais(newTits)
                          const titNum = parseNumericoLocal(valorTitular)
                          if (titNum > 0) {
                            const total = titNum
                              + newTits.reduce((sum, t) => sum + parseNumericoLocal(t.valor || ''), 0)
                              + dependentes.reduce((sum, dep) => sum + parseNumericoLocal(dep.valor || ''), 0)
                            setFormData(prev => ({ ...prev, valor_pavao: String(total) }))
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 p-2 font-bold disabled:opacity-50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 absolute -right-2 top-2 sm:relative sm:-right-0 sm:-top-0"
                        title="Remover titular adicional"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {dependentes.length > 0 && (
                <div className="bg-gray-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-gray-200 dark:border-neutral-700 space-y-3 mt-1">
                  {dependentes.map((dep, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-3 items-end bg-white dark:bg-neutral-800 p-3 rounded-lg border border-gray-100 dark:border-neutral-700 relative group">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
                        <input
                          type="text"
                          disabled={saving || isLockedByGeracaoErro}
                          value={dep.nome}
                          onChange={(e) => setDependentes(prev => prev.map((x, idx) => idx === i ? { ...x, nome: e.target.value } : x))}
                          className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Grau de Dependencia</label>
                        <input
                          type="text"
                          placeholder="Ex: Filho(a)"
                          disabled={saving || isLockedByGeracaoErro}
                          value={dep.grau}
                          onChange={(e) => setDependentes(prev => prev.map((x, idx) => idx === i ? { ...x, grau: e.target.value } : x))}
                          className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                        />
                      </div>
                      <div className="w-full sm:w-auto">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Nascimento</label>
                        <input
                          type="date"
                          disabled={saving || isLockedByGeracaoErro}
                          value={dep.data_nascimento}
                          onChange={(e) => setDependentes(prev => prev.map((x, idx) => idx === i ? { ...x, data_nascimento: e.target.value } : x))}
                          className="w-full sm:w-36 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Valor (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Ex: 500"
                          disabled={saving || isLockedByGeracaoErro}
                          value={dep.valor || ''}
                          onChange={(e) => {
                            const newDeps = dependentes.map((x, idx) => idx === i ? { ...x, valor: e.target.value } : x)
                            setDependentes(newDeps)
                            // Recalcular total
                            const titNum = parseNumericoLocal(valorTitular)
                            if (titNum > 0) {
                              const total = titNum
                                + titularesAdicionais.reduce((sum, t) => sum + parseNumericoLocal(t.valor || ''), 0)
                                + newDeps.reduce((sum, dep) => sum + parseNumericoLocal(dep.valor || ''), 0)
                              setFormData(prev => ({ ...prev, valor_pavao: String(total) }))
                            }
                          }}
                          className="w-full border border-emerald-200 dark:border-emerald-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-900"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={saving || isLockedByGeracaoErro}
                        onClick={() => {
                          const newDeps = dependentes.filter((_, idx) => idx !== i)
                          setDependentes(newDeps)
                          // Recalcular total
                          const titNum = parseNumericoLocal(valorTitular)
                          if (titNum > 0) {
                            const total = titNum
                              + titularesAdicionais.reduce((sum, t) => sum + parseNumericoLocal(t.valor || ''), 0)
                              + newDeps.reduce((sum, dep) => sum + parseNumericoLocal(dep.valor || ''), 0)
                            setFormData(prev => ({ ...prev, valor_pavao: String(total) }))
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 p-2 font-bold disabled:opacity-50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 absolute -right-2 top-2 sm:relative sm:-right-0 sm:-top-0"
                        title="Remover dependente"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor Total (em euros)
                  {valorTotalCalculado > 0 && <span className="ml-2 text-xs text-emerald-600 font-normal">(auto-calculado: € {valorTotalCalculado})</span>}
                </label>
                <input
                  type="text"
                  disabled={saving || isLockedByGeracaoErro}
                  placeholder="Ex: 1000"
                  value={formData.valor_pavao}
                  onChange={(e) => setFormData({ ...formData, valor_pavao: e.target.value })}
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor com Desconto (em euros)</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} placeholder="Ex: 800" value={formData.valor_desconto} onChange={(e) => setFormData({ ...formData, valor_desconto: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Consultoria a Abater</label>
                {consultoriaDesconto && consultoriaDesconto.total > 0 ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-sm">
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                      {consultoriaDesconto.total} consultoria(s) realizada(s) — Desconto calculado: {consultoriaDesconto.valor} ({numberToPortuguese(consultoriaDesconto.valor)} euros)
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">Nenhuma consultoria anterior encontrada para este cliente.</p>
                )}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Substituir valor (opcional)</label>
                  <input
                    type="text"
                    disabled={saving || isLockedByGeracaoErro}
                    placeholder="Ex: 200 (duzentos euros) — deixe vazio para usar o cálculo automático"
                    value={consultoriaOverride}
                    onChange={(e) => {
                      setConsultoriaOverride(e.target.value)
                      const valorFinal = e.target.value.trim() || (consultoriaDesconto ? `${consultoriaDesconto.valor} (${numberToPortuguese(consultoriaDesconto.valor)} euros)` : '')
                      setFormData({ ...formData, valor_consultoria: valorFinal })
                    }}
                    className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
                  />
                </div>
              </div>
            </div>
            {/* Pendencias removida */}

            <div className="pt-4 flex justify-between">
              <button onClick={handleBack} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2.5 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-all">Anterior</button>
              <button onClick={handleNext} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                Proximo {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Forma de Pagamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={saving || isLockedByGeracaoErro}
                onClick={() => setFormData({
                  ...formData,
                  metodo_pagamento: 'pix',
                  forma_pagamento: 'Pagamento via PIX (com envio de comprovante).',
                  formaPagamento: 'Pagamento via PIX (com envio de comprovante).'
                })}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  formData.metodo_pagamento === 'pix'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/15'
                    : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                }`}
              >
                <p className="font-bold text-gray-900 dark:text-white">PIX</p>
                <p className="text-xs text-gray-500 mt-1">Fluxo atual de comprovante e validação.</p>
              </button>

              <button
                type="button"
                disabled={saving || isLockedByGeracaoErro}
                onClick={() => setFormData({
                  ...formData,
                  metodo_pagamento: 'boleto',
                  forma_pagamento: '',
                  formaPagamento: ''
                })}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  formData.metodo_pagamento === 'boleto'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/15'
                    : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                }`}
              >
                <p className="font-bold text-gray-900 dark:text-white">Boleto</p>
                <p className="text-xs text-gray-500 mt-1">Entrada + parcelamento mensal (1 a 3x).</p>
              </button>
            </div>

            {validationErrors.metodo_pagamento && <p className="text-red-500 text-xs">{validationErrors.metodo_pagamento}</p>}

            {formData.metodo_pagamento === 'boleto' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Entrada *</label>
                  <input
                    type="text"
                    disabled={saving || isLockedByGeracaoErro}
                    value={formData.boleto_valor_entrada}
                    onChange={(e) => {
                      const novaEntrada = e.target.value
                      const entradaNum = parseNumericoLocal(novaEntrada)
                      const restante = Math.max(0, valorFinalReal - entradaNum)
                      const qtd = Number(formData.boleto_quantidade_parcelas) || 1
                      const novaParcela = qtd > 0 ? (restante / qtd).toFixed(2).replace('.', ',') : '0,00'

                      setFormData({ 
                        ...formData, 
                        boleto_valor_entrada: novaEntrada,
                        boleto_valor_parcela: novaParcela
                      })
                      if (novaEntrada.trim()) setValidationErrors(prev => ({ ...prev, boleto_valor_entrada: '' }))
                    }}
                    placeholder="Ex.: 500,00"
                    className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.boleto_valor_entrada ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`}
                  />
                  {validationErrors.boleto_valor_entrada && <p className="text-red-500 text-xs mt-1">{validationErrors.boleto_valor_entrada}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor das Parcelas *</label>
                  <input
                    type="text"
                    disabled={saving || isLockedByGeracaoErro}
                    value={formData.boleto_valor_parcela}
                    onChange={(e) => setFormData({ ...formData, boleto_valor_parcela: e.target.value })}
                    placeholder="Ex.: 300,00"
                    className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.boleto_valor_parcela ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`}
                  />
                  {validationErrors.boleto_valor_parcela && <p className="text-red-500 text-xs mt-1">{validationErrors.boleto_valor_parcela}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade de Parcelas *</label>
                  <select
                    disabled={saving || isLockedByGeracaoErro}
                    value={formData.boleto_quantidade_parcelas}
                    onChange={(e) => {
                      const qtdStr = e.target.value
                      const qtd = Number(qtdStr) || 1
                      const entradaNum = parseNumericoLocal(formData.boleto_valor_entrada)
                      const restante = Math.max(0, valorFinalReal - entradaNum)
                      const novaParcela = qtd > 0 ? (restante / qtd).toFixed(2).replace('.', ',') : '0,00'

                      setFormData({ 
                        ...formData, 
                        boleto_quantidade_parcelas: qtdStr,
                        boleto_valor_parcela: novaParcela
                      })
                      if (qtdStr.trim()) setValidationErrors(prev => ({ ...prev, boleto_quantidade_parcelas: '' }))
                    }}
                    className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm ${validationErrors.boleto_quantidade_parcelas ? 'border-red-400' : 'border-gray-200 dark:border-neutral-700'}`}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                  {validationErrors.boleto_quantidade_parcelas && <p className="text-red-500 text-xs mt-1">{validationErrors.boleto_quantidade_parcelas}</p>}
                </div>
              </div>
            )}

            {formData.metodo_pagamento === 'pix' && (
              <div className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                O contrato será salvo com pagamento via PIX e comprovante obrigatório.
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button onClick={handleBack} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2.5 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-all">Anterior</button>
              <button onClick={handleNext} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                Revisar {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resumo e Geracao</h2>

            <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
              <div className="px-5 py-3 bg-gray-100/50 dark:bg-neutral-800 border-b border-gray-100 dark:border-neutral-700">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Dados do Contrato</h3>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nome</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5">{formData.nome || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Documento</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5 font-mono">{formData.documento || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5">{formData.email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Telefone</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5">{formData.telefone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Servico</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5">{formData.tipo_servico || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Metodo de Pagamento</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5">
                      {formData.metodo_pagamento === 'boleto'
                        ? 'Boleto'
                        : formData.metodo_pagamento === 'pix'
                          ? 'PIX'
                          : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Valor com Desconto</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5">{formData.valor_desconto || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Valor Real / Final (Calculado)</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5">
                      {Math.max(0, (parseFloat(formData.valor_desconto) || 0) - ((consultoriaDesconto?.total || 0) * 50))}
                    </p>
                  </div>
                  {formData.metodo_pagamento === 'boleto' && (
                    <>
                      <div>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Valor da Entrada</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5">{formData.boleto_valor_entrada || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Valor das Parcelas</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5">{formData.boleto_valor_parcela || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quantidade de Parcelas</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5">{formData.boleto_quantidade_parcelas || '1'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cobranca Mensal</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5">Mesmo dia da criacao do servico</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!contrato?.contrato_gerado_url || isLockedByGeracaoErro ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">Tudo pronto para gerar o contrato preenchido.</p>
                <button onClick={handleGerarContrato} disabled={saving || contratoGerado} className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60 flex justify-center items-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20">
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Gerando contrato...</>
                  ) : contratoGerado ? (
                    <><CheckCircle2 className="w-5 h-5" /> Contrato Gerado</>
                  ) : (
                    <><FileText className="w-5 h-5" /> Gerar Contrato (DOCX)</>
                  )}
                </button>
                {!isLockedByGeracaoErro && (
                  <button onClick={handleBack} disabled={saving} className="w-full py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium">Editar dados</button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={contrato.contrato_gerado_url} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold justify-center rounded-xl hover:bg-emerald-50 dark:hover:bg-neutral-700 flex items-center gap-2 transition-all active:scale-[0.98]">
                  <FileText className="w-5 h-5" /> Ver Contrato
                </a>
                <button onClick={handleFinalizarEEnviar} disabled={saving} className="flex-1 px-4 py-3.5 bg-emerald-600 text-white font-bold justify-center rounded-xl hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20">
                  Criar Contrato (Autentique) {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
