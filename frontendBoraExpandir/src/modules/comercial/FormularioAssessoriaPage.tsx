import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, Loader2 } from 'lucide-react'
import comercialService from './services/comercialService'
import { useToast, ToastContainer } from '../../components/ui/Toast'
import type { ContratoServico } from '../../types/comercial'
import {
  formatCpfDisplay,
  formatPhoneDisplay,
  maskCpfInput,
  maskPhoneInput,
  normalizeCpf,
  normalizePhone,
  onlyDigits
} from '../../utils/formatters'

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
  forma_pagamento: string
  formaPagamento: string
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
  forma_pagamento: '',
  formaPagamento: ''
}

export default function FormularioAssessoriaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [etapaAtual, setEtapaAtual] = useState(1)
  const [formData, setFormData] = useState<FormularioDraft>(emptyFormData)
  const [contrato, setContrato] = useState<ContratoServico | null>(null)
  const [erroGeracao, setErroGeracao] = useState<any>(null)

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
      valor_pavao: String(draft.valor_pavao || data.servico_valor || ''),
      valor_desconto: String(draft.valor_desconto || ''),
      valor_consultoria: String(draft.valor_consultoria || ''),
      forma_pagamento: draft.forma_pagamento || draft.formaPagamento || '',
      formaPagamento: draft.forma_pagamento || draft.formaPagamento || ''
    })

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

      hydrateFromContrato(data)
      initializedRef.current = true
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
    const payload: Record<string, any> = {
      ...source,
      forma_pagamento: source.forma_pagamento || source.formaPagamento || '',
      formaPagamento: source.forma_pagamento || source.formaPagamento || ''
    }

    payload.telefone = normalizePhone(payload.telefone)

    const documentoDigits = onlyDigits(payload.documento)
    if (documentoDigits.length === 11) {
      payload.documento = normalizeCpf(payload.documento)
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
  }, [formData, etapaAtual, id, isLockedByGeracaoErro])

  const handleNext = async () => {
    if (isLockedByGeracaoErro) {
      toast.warning('Este contrato esta bloqueado por erro de geracao. Tente gerar novamente para desbloquear.')
      return
    }

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
      await persistDraft(4, formData)
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
      await comercialService.enviarContratoAssinatura(id, formData.email)
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
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-neutral-800 -z-10 -translate-y-1/2 rounded" />
        <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 -translate-y-1/2 rounded transition-all duration-300" style={{ width: `${((etapaAtual - 1) / 3) * 100}%` }} />

        {[1, 2, 3, 4].map(step => (
          <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${etapaAtual >= step ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-gray-500'}`}>
            {etapaAtual > step ? <CheckCircle2 className="w-5 h-5" /> : step}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">

        {etapaAtual === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documento (CPF / Passaporte)</label>
                <input
                  type="text"
                  disabled={saving || isLockedByGeracaoErro}
                  value={formData.documento}
                  onChange={(e) => {
                    const valor = e.target.value
                    const masked = onlyDigits(valor).length <= 11 ? maskCpfInput(valor) : valor
                    setFormData({ ...formData, documento: masked })
                  }}
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nacionalidade</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.nacionalidade} onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado Civil</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.estado_civil} onChange={(e) => setFormData({ ...formData, estado_civil: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profissao</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.profissao} onChange={(e) => setFormData({ ...formData, profissao: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                <input type="email" disabled={saving || isLockedByGeracaoErro} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone (DDD / DDI)</label>
                <input
                  type="text"
                  disabled={saving || isLockedByGeracaoErro}
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: maskPhoneInput(e.target.value) })}
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereco Completo</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={handleNext} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titulares e Dependentes (Descricao)</label>
              <textarea rows={3} disabled={saving || isLockedByGeracaoErro} value={formData.descricao_pessoas} onChange={(e) => setFormData({ ...formData, descricao_pessoas: e.target.value })} placeholder="Ex: Fulano de Tal, titular, 600 euros." className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Total (em euros extenso)</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} placeholder="Ex: 1000 (mil euros)" value={formData.valor_pavao} onChange={(e) => setFormData({ ...formData, valor_pavao: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor com Desconto (em euros extenso)</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} placeholder="Ex: 800 (oitocentos euros)" value={formData.valor_desconto} onChange={(e) => setFormData({ ...formData, valor_desconto: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Consultoria a abater (em euros extenso)</label>
                <input type="text" disabled={saving || isLockedByGeracaoErro} placeholder="Ex: 200 (duzentos euros)" value={formData.valor_consultoria} onChange={(e) => setFormData({ ...formData, valor_consultoria: e.target.value })} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
            </div>
            <div className="pt-4 flex justify-between">
              <button onClick={handleBack} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50">Anterior</button>
              <button onClick={handleNext} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                Proximo {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Forma de Pagamento</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opcao de Pagamento (texto do contrato)</label>
              <textarea rows={4} disabled={saving || isLockedByGeracaoErro} value={formData.forma_pagamento} onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value, formaPagamento: e.target.value })} placeholder="Descreva como sera pago (ex: via PIX ou transferencia em 3 parcelas)." className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
            </div>
            <div className="pt-4 flex justify-between">
              <button onClick={handleBack} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50">Anterior</button>
              <button onClick={handleNext} disabled={saving || isLockedByGeracaoErro} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                Revisar {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resumo e Geracao</h2>

            <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Nome:</strong> {formData.nome}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Documento:</strong> {formData.documento}</p>
              <p><strong>Telefone:</strong> {formData.telefone}</p>
              <p><strong>Servico:</strong> {formData.tipo_servico}</p>
              <p><strong>Valor desconto:</strong> {formData.valor_desconto}</p>
              <p><strong>Forma pagamento:</strong> Definida na Etapa 3</p>
            </div>

            {!contrato?.contrato_gerado_url || isLockedByGeracaoErro ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">Tudo pronto para gerar o contrato preenchido.</p>
                <button onClick={handleGerarContrato} disabled={saving} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60 flex justify-center items-center gap-2">
                  <FileText className="w-5 h-5" /> Gerar Contrato (DOCX)
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
                {!isLockedByGeracaoErro && (
                  <button onClick={handleBack} disabled={saving} className="w-full py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium">Editar dados</button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={contrato.contrato_gerado_url} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-3 bg-white dark:bg-neutral-800 border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold justify-center rounded-xl hover:bg-emerald-50 dark:hover:bg-neutral-700 flex items-center gap-2 transition">
                  <FileText className="w-5 h-5" /> Ver Contrato
                </a>
                <button onClick={handleFinalizarEEnviar} disabled={saving} className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold justify-center rounded-xl hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2 transition">
                  Criar Contrato (Enviar Email) {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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
