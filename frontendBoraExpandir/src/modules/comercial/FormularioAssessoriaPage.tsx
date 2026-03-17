import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, ChevronRight, FileText, Loader2, ArrowLeft } from 'lucide-react'
import comercialService from './services/comercialService'
import {  useToast, ToastContainer } from '../../components/ui/Toast'

// Steps: 1 - Dados Pessoais, 2 - Serviços e Valores, 3 - Pagamento e Data, 4 - Resumo/Gerar

export default function FormularioAssessoriaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [etapaAtual, setEtapaAtual] = useState(1)
  const [formData, setFormData] = useState<any>({
    nome: '',
    nacionalidade: '',
    estado_civil: '',
    profissao: '',
    documento: '',
    endereco: '',
    email: '',
    telefone: '',
    tipo_servico: 'Assessoria de Imigração',
    descricao_pessoas: '',
    valor_pavao: '',
    valor_desconto: '',
    valor_consultoria: '',
    formaPagamento: '',
  })
  
  const [contrato, setContrato] = useState<any>(null)
  
  useEffect(() => {
    const fetchDraft = async () => {
      if (!id) return
      try {
        const data = await comercialService.getContratoServicoById(id)
        setContrato(data)
        
        if (data.is_draft) {
          setEtapaAtual(data.etapa_fluxo || 1)
          const draft = data.draft_dados || {}
          
          setFormData({
            nome: draft.nome || data.cliente_nome || '',
            nacionalidade: draft.nacionalidade || '',
            estado_civil: draft.estado_civil || '',
            profissao: draft.profissao || '',
            documento: draft.documento || '',
            endereco: draft.endereco || '',
            email: draft.email || data.cliente_email || '',
            telefone: draft.telefone || data.cliente_telefone || '',
            tipo_servico: draft.tipo_servico || data.servico_nome || 'Assessoria de Imigração',
            descricao_pessoas: draft.descricao_pessoas || '',
            valor_pavao: draft.valor_pavao || data.servico_valor || '',
            valor_desconto: draft.valor_desconto || '',
            valor_consultoria: draft.valor_consultoria || '',
            formaPagamento: draft.formaPagamento || '',
          })
        } else {
          // Se não for rascunho, redireciona para detail
          navigate(`/comercial/contratos/${id}`)
        }
      } catch (err: any) {
        toast.error('Erro ao carregar rascunho: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDraft()
  }, [id])

  const handleNext = async () => {
    const proximaEtapa = etapaAtual + 1
    await saveDraft(proximaEtapa)
    setEtapaAtual(proximaEtapa)
  }

  const handleBack = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1)
    } else {
      navigate(-1)
    }
  }

  const saveDraft = async (novaEtapa: number) => {
    if (!id) return
    try {
      setSaving(true)
      await comercialService.updateContratoDraft(id, {
        etapa_fluxo: novaEtapa,
        draft_dados: formData
      })
    } catch (err: any) {
      toast.error('Erro ao salvar rascunho')
    } finally {
      setSaving(false)
    }
  }

  const handleGerarContrato = async () => {
    if (!id) return
    try {
      setSaving(true)
      await saveDraft(4)
      const res = await comercialService.gerarContratoPdf(id)
      setContrato({ ...contrato, contrato_gerado_url: res.url })
      toast.success('Contrato em PDF gerado com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao gerar PDF: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleFinalizarEEnviar = async () => {
    if (!id) return
    if (!formData.email) {
      toast.error('Email do cliente é obrigatório para enviar o contrato')
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
      <button onClick={handleBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Formulário: Contrato de Assessoria</h1>
        <p className="text-gray-500 text-sm mt-1">Preencha as informações para gerar e enviar o contrato (Rascunho salvo automaticamente).</p>
      </div>

      {/* Progress Bar */}
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
                <input type="text" value={formData.nome || ''} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documento (CPF / Passaporte)</label>
                <input type="text" value={formData.documento || ''} onChange={(e) => setFormData({...formData, documento: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nacionalidade</label>
                <input type="text" value={formData.nacionalidade || ''} onChange={(e) => setFormData({...formData, nacionalidade: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado Civil</label>
                <input type="text" value={formData.estado_civil || ''} onChange={(e) => setFormData({...formData, estado_civil: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profissão</label>
                <input type="text" value={formData.profissao || ''} onChange={(e) => setFormData({...formData, profissao: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone (DDD / DDI)</label>
                <input type="text" value={formData.telefone || ''} onChange={(e) => setFormData({...formData, telefone: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço Completo</label>
                <input type="text" value={formData.endereco || ''} onChange={(e) => setFormData({...formData, endereco: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={handleNext} disabled={saving} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                Próximo {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Serviços e Valores</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Serviço</label>
              <input type="text" value={formData.tipo_servico || ''} onChange={(e) => setFormData({...formData, tipo_servico: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titulares e Dependentes (Descrição)</label>
              <textarea rows={3} value={formData.descricao_pessoas || ''} onChange={(e) => setFormData({...formData, descricao_pessoas: e.target.value})} placeholder="Ex: FULANO DE TAL, titular, 600 euros." className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Total (em Euros extenso)</label>
                <input type="text" placeholder="Ex: 1000 (mil euros)" value={formData.valor_pavao || ''} onChange={(e) => setFormData({...formData, valor_pavao: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor com Desconto (em Euros extenso)</label>
                <input type="text" placeholder="Ex: 800 (oitocentos euros)" value={formData.valor_desconto || ''} onChange={(e) => setFormData({...formData, valor_desconto: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Consultoria a abater (em Euros extenso)</label>
                <input type="text" placeholder="Ex: 200 (duzentos euros)" value={formData.valor_consultoria || ''} onChange={(e) => setFormData({...formData, valor_consultoria: e.target.value})} className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
              </div>
            </div>
            <div className="pt-4 flex justify-between">
              <button onClick={handleBack} disabled={saving} className="px-6 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800">Anterior</button>
              <button onClick={handleNext} disabled={saving} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                Próximo {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Forma de Pagamento</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opção de Pagamento (Texto pro contrato)</label>
              <textarea rows={4} value={formData.forma_pagamento || formData.formaPagamento || ''} onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value, formaPagamento: e.target.value})} placeholder="Descreva como será pago (Ex: Via PIX ou Transferência em 3 parcelas...)" className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm" />
            </div>
            <div className="pt-4 flex justify-between">
              <button onClick={handleBack} disabled={saving} className="px-6 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800">Anterior</button>
              <button onClick={handleNext} disabled={saving} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                Revisar {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resumo e Geração</h2>
            
            <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Nome:</strong> {formData.nome}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Serviço:</strong> {formData.tipo_servico}</p>
              <p><strong>Valor Desconto:</strong> {formData.valor_desconto}</p>
              <p><strong>Forma Pagamento:</strong> Definida na Etapa 3</p>
            </div>
            
            {!contrato?.contrato_gerado_url ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">Tudo pronto! Gerar o contrato DOCX preenchido.</p>
                <button onClick={handleGerarContrato} disabled={saving} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex justify-center items-center gap-2">
                  <FileText className="w-5 h-5" /> Gerar Contrato (DOCX)
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
                <button onClick={handleBack} disabled={saving} className="w-full py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium">Editar Dados</button>
              </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href={contrato.contrato_gerado_url} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-3 bg-white dark:bg-neutral-800 border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold justify-center rounded-xl hover:bg-emerald-50 dark:hover:bg-neutral-700 flex items-center gap-2 transition">
                    <FileText className="w-5 h-5" /> Ver Contrato
                  </a>
                  <button onClick={handleFinalizarEEnviar} disabled={saving} className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold justify-center rounded-xl hover:bg-emerald-700 flex items-center gap-2 transition">
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
