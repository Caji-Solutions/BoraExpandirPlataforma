import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Loader2, AlertCircle, CheckCircle2,
  CalendarDays, MapPin, Users, Scale,
  Lock, FileStack, Building2, Plane, Search
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import juridicoService, { getDependentes } from '@/modules/juridico/services/juridicoService'
import { getContratosServicos } from '@/modules/comercial/services/comercialService'
import { getCatalogServices } from '@/modules/adm/services/catalogService'

interface CRMFormData {
  titular_nome: string
  pedido_para: 'titular_somente' | 'titular_dependentes' | ''
  pedido_para_detalhe: string
  membro_id?: string
  local_solicitacao: 'consulado' | 'espanha' | ''
  consulado_cidade: string
  cidade_protocolo: string
  cidade_chegada: string
  data_chegada: string
  tipo_agendamento: 'data_prevista' | 'data_confirmada' | ''
  tem_parceiro_cap: boolean
  nome_parceiro_cap: string
}

const initialFormData: CRMFormData = {
  titular_nome: '',
  pedido_para: '',
  pedido_para_detalhe: '',
  local_solicitacao: '',
  consulado_cidade: '',
  cidade_protocolo: '',
  cidade_chegada: '',
  data_chegada: '',
  tipo_agendamento: '',
  tem_parceiro_cap: false,
  nome_parceiro_cap: '',
}

interface AssessoriaFormModalProps {
  clienteId: string
  clienteNome: string
  agendamentoId: string
  produtoId?: string
  onClose: () => void
  onSuccess: () => void
}

export function AssessoriaFormModal({
  clienteId,
  clienteNome,
  agendamentoId,
  produtoId,
  onClose,
  onSuccess,
}: AssessoriaFormModalProps) {
  const { activeProfile } = useAuth()
  const [formData, setFormData] = useState<CRMFormData>({ ...initialFormData, titular_nome: clienteNome })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  const [allSubservices, setAllSubservices] = useState<any[]>([])
  const [filteredSubservices, setFilteredSubservices] = useState<any[]>([])
  const [selectedSubserviceId, setSelectedSubserviceId] = useState('')
  const [subserviceSearchTerm, setSubserviceSearchTerm] = useState('')
  const [requiresSubservice, setRequiresSubservice] = useState(false)
  const [contratoDependentes, setContratoDependentes] = useState<{ id?: string; nome: string; grau: string }[]>([])
  const [titularContrato, setTitularContrato] = useState('')
  const [documentosPreview, setDocumentosPreview] = useState<{ id: string; nome: string; obrigatorio?: boolean }[]>([])
  const [servicoNome, setServicoNome] = useState('')
  const [mainServiceRequisitos, setMainServiceRequisitos] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [subservicesData, contratos, assessoria, catalogServices] = await Promise.all([
          juridicoService.getAllSubservices(),
          getContratosServicos(clienteId),
          juridicoService.getLatestAssessoria(clienteId).catch(() => null),
          getCatalogServices().catch(() => []),
        ])

        setAllSubservices(subservicesData)
        setFilteredSubservices(subservicesData)

        // Dados do contrato (read-only)
        const contratoAtivo = contratos?.find((c: any) => !c.is_draft) || contratos?.[0] || null
        if (contratoAtivo?.draft_dados) {
          setTitularContrato(contratoAtivo.draft_dados.nome || clienteNome)
        }

        // Buscar dependentes: tabela dependentes (fonte primária) + draft_dados (fallback)
        let dependentesApi: { id?: string; nome: string; grau: string }[] = []
        try {
          const apiDeps = await getDependentes(clienteId)
          dependentesApi = (apiDeps || []).map((d: any) => ({
            id: d.id,
            nome: d.nome_completo || d.nome || '',
            grau: d.parentesco || '',
          }))
        } catch (depErr) {
          console.error('[AssessoriaFormModal] Erro ao buscar dependentes da API:', depErr)
        }

        const rawDependents = contratoAtivo?.draft_dados?.dependentes
        let parsedDependents: any[] = []

        if (rawDependents === undefined || rawDependents === null) {
          parsedDependents = []
        } else if (typeof rawDependents === 'string') {
          try {
            parsedDependents = JSON.parse(rawDependents)
          } catch (e) {
            console.error('[AssessoriaFormModal] Failed to parse dependentes JSON:', e)
            parsedDependents = []
          }
        } else if (Array.isArray(rawDependents)) {
          parsedDependents = rawDependents
        } else {
          parsedDependents = []
        }

        const dependentesDraft: { id?: string; nome: string; grau: string }[] = parsedDependents.map((d: any) => ({
          id: d.id,
          nome: d.nome || '',
          grau: d.grau || d.parentesco || '',
        }))

        const mergeMap = new Map<string, { id?: string; nome: string; grau: string }>()
        for (const dep of [...dependentesDraft, ...dependentesApi]) {
          if (dep.nome) {
            const key = dep.nome.trim().toLowerCase()
            const existing = mergeMap.get(key)
            if (!existing || (!existing.id && dep.id)) {
              mergeMap.set(key, dep)
            }
          }
        }
        const depsMapped = Array.from(mergeMap.values())
        setContratoDependentes(depsMapped)

        // Pré-preencher pedido_para com base nos dependentes do contrato
        if (contratoAtivo?.draft_dados) {
          const pedidoPara = depsMapped.length > 0 ? 'titular_dependentes' : 'titular_somente'
          const detalhe = depsMapped.length > 0
            ? depsMapped.map((d: any) => d.nome).filter(Boolean).join(', ')
            : ''
          setFormData(prev => ({
            ...prev,
            titular_nome: contratoAtivo.draft_dados.nome || clienteNome,
            pedido_para: pedidoPara,
            pedido_para_detalhe: detalhe,
          }))
        }

        // Subserviços do produto
        let productSubs: any[] = []
        if (produtoId) {
          productSubs = subservicesData.filter(
            (s: any) => s.servico?.id === produtoId || s.servico_id === produtoId
          )
          const hasSubs = productSubs.length > 0
          setRequiresSubservice(hasSubs)
          if (hasSubs && productSubs.length === 1) {
            setSelectedSubserviceId(productSubs[0].id)
          }

          // Nome do serviço principal
          const mainSvc = catalogServices.find((s: any) => s.id === produtoId)
          if (mainSvc) {
            setServicoNome(mainSvc.name || '')
            if (!hasSubs) {
              setMainServiceRequisitos(mainSvc.documents || [])
              setDocumentosPreview(
                (mainSvc.documents || []).map((d: any) => ({
                  id: d.id,
                  nome: d.name || d.nome,
                  obrigatorio: d.required ?? d.obrigatorio,
                }))
              )
            }
          }
        }

        // Pré-preencher dados existentes
        if (assessoria) {
          const respostas = assessoria.respostas || {}
          setFormData(prev => ({
            ...prev,
            ...Object.keys(initialFormData).reduce((acc, key) => {
              if (respostas[key] !== undefined) acc[key as keyof CRMFormData] = respostas[key]
              return acc
            }, {} as Partial<CRMFormData>),
          }))
          if (assessoria.servico_id) setSelectedSubserviceId(assessoria.servico_id)
        }
      } catch (err) {
        console.error('AssessoriaFormModal: erro ao carregar dados', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clienteId, produtoId])

  // Atualizar documentos preview quando subserviço é selecionado
  useEffect(() => {
    if (!selectedSubserviceId) {
      if (!requiresSubservice) {
        setDocumentosPreview(
          mainServiceRequisitos.map((d: any) => ({
            id: d.id,
            nome: d.name || d.nome,
            obrigatorio: d.required ?? d.obrigatorio,
          }))
        )
      } else {
        setDocumentosPreview([])
      }
      return
    }
    const sub = allSubservices.find(s => s.id === selectedSubserviceId)
    if (sub?.requisitos) {
      setDocumentosPreview(
        sub.requisitos.map((r: any) => ({
          id: r.id,
          nome: r.nome,
          obrigatorio: r.obrigatorio,
        }))
      )
    } else {
      setDocumentosPreview([])
    }
  }, [selectedSubserviceId, allSubservices, mainServiceRequisitos, requiresSubservice])

  useEffect(() => {
    if (!subserviceSearchTerm.trim()) {
      setFilteredSubservices(allSubservices)
    } else {
      const q = subserviceSearchTerm.toLowerCase()
      setFilteredSubservices(allSubservices.filter((s: any) => s.nome?.toLowerCase().includes(q)))
    }
  }, [subserviceSearchTerm, allSubservices])

  const handleFormChange = (field: keyof CRMFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!activeProfile?.id) return
    if (requiresSubservice && !selectedSubserviceId) {
      setError('Por favor, selecione um subserviço.')
      return
    }
    if (!formData.tipo_agendamento) {
      setError('Por favor, selecione o tipo de agendamento.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await juridicoService.createAssessoria({
        clienteId,
        respostas: {
          ...formData,
          consultora_nome: activeProfile.full_name || '',
          subservico_id: selectedSubserviceId || null,
        },
        observacoes: '',
        responsavelId: activeProfile.id,
        servicoId: produtoId || undefined,
        subservicoId: selectedSubserviceId || undefined,
        membroId: formData.membro_id || undefined
      })
      setShowSuccess(true)
      setTimeout(() => onSuccess(), 1200)
    } catch (err: any) {
      // Captura detalhes extras da resposta de erro do backend se disponível
      const detail = err?.detail || err?.response?.detail || ''
      const msg = err.message || 'tente novamente.'
      setError('Erro ao salvar: ' + msg + (detail ? ` (${detail})` : ''))
      console.error('[AssessoriaFormModal] createAssessoria error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalBeneficiarios = 1 + contratoDependentes.length

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 660,
          maxHeight: '92vh',
          animation: 'assessoriaSlideIn 0.28s cubic-bezier(.22,.68,0,1.2)',
          background: '#f8f7f4',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ─── TOPO ÂMBAR ─── */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #f59e0b, #d97706, #92400e)' }} />

        {/* ─── HEADER ─── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '18px 24px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(245,158,11,0.15)',
              border: '1.5px solid rgba(245,158,11,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Scale size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ color: '#f59e0b', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
                Formulário de Assessoria
              </div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
                {clienteNome}
              </div>
              {servicoNome && (
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{servicoNome}</div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#94a3b8', flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ─── BODY ─── */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
              <Loader2 size={28} color="#d97706" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 14px', background: '#fef2f2',
                  border: '1px solid #fecaca', borderRadius: 12,
                }}>
                  <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>
                </div>
              )}

              {/* ─── BENEFICIÁRIOS (read-only) ─── */}
              <Section
                icon={<Lock size={14} color="#d97706" />}
                title="Beneficiários"
                badge={{ text: 'Do contrato', color: '#d97706' }}
              >
                {/* Titular */}
                <div style={{ marginBottom: 10 }}>
                  <FieldLabel>Titular</FieldLabel>
                  <ReadOnlyField>{titularContrato || clienteNome}</ReadOnlyField>
                </div>

                {/* Dependentes */}
                {contratoDependentes.length > 0 ? (
                  <div>
                    <FieldLabel>Dependente(s) — {contratoDependentes.length}</FieldLabel>
                    <div style={{
                      border: '1.5px solid #fde68a',
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: '#fffbeb',
                    }}>
                      {contratoDependentes.map((dep, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'grid', gridTemplateColumns: '1fr auto',
                            padding: '9px 14px',
                            borderBottom: idx < contratoDependentes.length - 1 ? '1px solid #fde68a' : 'none',
                            gap: 12,
                          }}
                        >
                          <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{dep.nome}</span>
                          <span style={{ fontSize: 11, color: '#92400e', fontWeight: 600, background: '#fef3c7', padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                            {dep.grau}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 12px', background: '#f1f5f9', borderRadius: 8 }}>
                    Nenhum dependente no contrato
                  </div>
                )}

                <div style={{
                  marginTop: 10, display: 'flex', gap: 8,
                  padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
                  alignItems: 'center',
                }}>
                  <Users size={14} color="#16a34a" />
                  <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                    {totalBeneficiarios === 1 ? '1 beneficiário (somente titular)' : `${totalBeneficiarios} beneficiários (titular + ${contratoDependentes.length} dependente${contratoDependentes.length > 1 ? 's' : ''})`}
                  </span>
                </div>
              </Section>

              {/* ─── SUBSERVIÇO (se necessário) ─── */}
              {requiresSubservice && (
                <Section
                  icon={<Scale size={14} color="#6366f1" />}
                  title="Tipo de Processo"
                >
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Buscar subserviço..."
                      value={subserviceSearchTerm}
                      onChange={e => setSubserviceSearchTerm(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px 9px 34px', fontSize: 13,
                        border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                    {filteredSubservices.map((sub: any) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubserviceId(sub.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', textAlign: 'left',
                          border: selectedSubserviceId === sub.id ? '2px solid #f59e0b' : '1.5px solid #e2e8f0',
                          background: selectedSubserviceId === sub.id ? '#fffbeb' : '#fff',
                          color: selectedSubserviceId === sub.id ? '#92400e' : '#334155',
                          transition: 'all 0.15s',
                        }}
                      >
                        {sub.nome}
                        {selectedSubserviceId === sub.id && <CheckCircle2 size={16} color="#d97706" />}
                      </button>
                    ))}
                    {filteredSubservices.length === 0 && (
                      <div style={{ fontSize: 13, color: '#94a3b8', padding: '10px 0', textAlign: 'center' }}>
                        Nenhum subserviço encontrado
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* ─── PEDIDO PARA ─── */}
              <Section
                icon={<Users size={14} color="#6366f1" />}
                title="Pedido Para"
                badge={{ text: 'Do contrato', color: '#d97706' }}
              >
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <PillButton
                    active={formData.pedido_para === 'titular_somente'}
                    onClick={() => handleFormChange('pedido_para', 'titular_somente')}
                  >
                    Titular somente&nbsp;
                    <span style={{ opacity: 0.7, fontWeight: 500 }}>(1)</span>
                  </PillButton>
                  <PillButton
                    active={formData.pedido_para === 'titular_dependentes'}
                    onClick={() => handleFormChange('pedido_para', 'titular_dependentes')}
                    disabled={contratoDependentes.length === 0}
                  >
                    Titular + dependente(s)&nbsp;
                    <span style={{ opacity: 0.7, fontWeight: 500 }}>
                      ({1 + contratoDependentes.length})
                    </span>
                  </PillButton>
                </div>

                {contratoDependentes.length === 0 && (
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                    Nenhum dependente registrado no contrato.
                  </p>
                )}

                {formData.pedido_para === 'titular_dependentes' && contratoDependentes.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <FieldLabel>Dependentes incluídos</FieldLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {contratoDependentes.map((dep, idx) => (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 12px', background: '#fffbeb',
                          border: '1px solid #fde68a', borderRadius: 8,
                          fontSize: 13,
                        }}>
                          <span style={{ fontWeight: 600, color: '#1e293b', flex: 1 }}>{dep.nome}</span>
                          <span style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', padding: '1px 7px', borderRadius: 99 }}>{dep.grau}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SELEÇÃO DO MEMBRO ESPECÍFICO (NOVO) */}
                {(formData.pedido_para === 'titular_dependentes' || contratoDependentes.length > 0) && (
                  <div style={{ marginTop: 16 }}>
                    <FieldLabel>Associar este processo a:</FieldLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleFormChange('membro_id', null)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', textAlign: 'left',
                          border: !formData.membro_id ? '2px solid #f59e0b' : '1.5px solid #e2e8f0',
                          background: !formData.membro_id ? '#fffbeb' : '#fff',
                          color: !formData.membro_id ? '#92400e' : '#334155',
                        }}
                      >
                        <span>Titular: {clienteNome}</span>
                        {!formData.membro_id && <CheckCircle2 size={16} color="#d97706" />}
                      </button>

                      {contratoDependentes.map((dep, idx) => (
                        <button
                          key={dep.id || idx}
                          type="button"
                          onClick={() => dep.id && handleFormChange('membro_id', dep.id)}
                          disabled={!dep.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            cursor: dep.id ? 'pointer' : 'not-allowed', textAlign: 'left',
                            border: formData.membro_id === dep.id ? '2px solid #f59e0b' : '1.5px solid #e2e8f0',
                            background: formData.membro_id === dep.id ? '#fffbeb' : '#fff',
                            color: formData.membro_id === dep.id ? '#92400e' : '#334155',
                            opacity: dep.id ? 1 : 0.6,
                          }}
                        >
                          <span>Dependente: {dep.nome}</span>
                          {formData.membro_id === dep.id && <CheckCircle2 size={16} color="#d97706" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              {/* ─── LOCALIZAÇÃO ─── */}
              <Section
                icon={<MapPin size={14} color="#6366f1" />}
                title="Localização & Chegada"
              >
                <div style={{ marginBottom: 12 }}>
                  <FieldLabel>Local de solicitação</FieldLabel>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([
                      { val: 'consulado', label: 'No Consulado', icon: <Building2 size={13} /> },
                      { val: 'espanha', label: 'Dentro da Espanha', icon: <Plane size={13} /> },
                    ] as const).map(opt => (
                      <PillButton
                        key={opt.val}
                        active={formData.local_solicitacao === opt.val}
                        onClick={() => handleFormChange('local_solicitacao', opt.val)}
                        icon={opt.icon}
                        flex
                      >
                        {opt.label}
                      </PillButton>
                    ))}
                  </div>
                </div>

                {formData.local_solicitacao === 'consulado' && (
                  <div style={{ marginBottom: 12 }}>
                    <FieldLabel>Cidade do Consulado</FieldLabel>
                    <input
                      type="text"
                      value={formData.consulado_cidade}
                      onChange={e => handleFormChange('consulado_cidade', e.target.value)}
                      placeholder="Ex: São Paulo, Salvador..."
                      style={inputStyle}
                    />
                  </div>
                )}

                {formData.local_solicitacao === 'espanha' && (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <FieldLabel>Cidade para protocolar</FieldLabel>
                      <input
                        type="text"
                        value={formData.cidade_protocolo}
                        onChange={e => handleFormChange('cidade_protocolo', e.target.value)}
                        placeholder="Onde estarão no momento do pedido"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <FieldLabel>Cidade de chegada inicial</FieldLabel>
                      <input
                        type="text"
                        value={formData.cidade_chegada}
                        onChange={e => handleFormChange('cidade_chegada', e.target.value)}
                        placeholder="Opcional"
                        style={inputStyle}
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <FieldLabel>Tipo de agendamento</FieldLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {([
                        { val: 'data_prevista', label: 'Data Prevista' },
                        { val: 'data_confirmada', label: 'Data Confirmada' },
                      ] as const).map(opt => (
                        <PillButton
                          key={opt.val}
                          active={formData.tipo_agendamento === opt.val}
                          onClick={() => handleFormChange('tipo_agendamento', opt.val)}
                        >
                          {opt.label}
                        </PillButton>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>
                      Data de chegada na Espanha
                      {formData.tipo_agendamento && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: formData.tipo_agendamento === 'data_confirmada' ? '#16a34a' : '#d97706', fontWeight: 700, background: formData.tipo_agendamento === 'data_confirmada' ? '#dcfce7' : '#fef3c7', padding: '1px 6px', borderRadius: 99 }}>
                          {formData.tipo_agendamento === 'data_confirmada' ? 'CONFIRMADA' : 'PREVISTA'}
                        </span>
                      )}
                    </FieldLabel>
                    <input
                      type="date"
                      value={formData.data_chegada}
                      onChange={e => handleFormChange('data_chegada', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </Section>

              {/* ─── PARCEIRO CAP ─── */}
              <Section
                icon={<Users size={14} color="#6366f1" />}
                title="Parceiro CAP"
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: formData.tem_parceiro_cap ? 10 : 0 }}>
                  <PillButton active={formData.tem_parceiro_cap} onClick={() => handleFormChange('tem_parceiro_cap', true)}>Sim</PillButton>
                  <PillButton active={!formData.tem_parceiro_cap} onClick={() => { setFormData(prev => ({ ...prev, tem_parceiro_cap: false, nome_parceiro_cap: '' })) }}>Não</PillButton>
                </div>
                {formData.tem_parceiro_cap && (
                  <input
                    type="text"
                    value={formData.nome_parceiro_cap}
                    onChange={e => handleFormChange('nome_parceiro_cap', e.target.value)}
                    placeholder="Nome do parceiro CAP..."
                    style={inputStyle}
                  />
                )}
              </Section>

              {/* ─── DOCUMENTOS A SOLICITAR ─── */}
              {documentosPreview.length > 0 && (
                <Section
                  icon={<FileStack size={14} color="#0f172a" />}
                  title="Documentos a Solicitar"
                  dark
                >
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                    Estes documentos serão criados como <strong style={{ color: '#f8fafc' }}>pendentes</strong> para o cliente ao enviar:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {documentosPreview.map((doc, idx) => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 12px', borderRadius: 9,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: 'rgba(245,158,11,0.15)',
                          color: '#f59e0b', fontSize: 11, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: 13, color: '#e2e8f0', flex: 1 }}>{doc.nome}</span>
                        {doc.obrigatorio && (
                          <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, letterSpacing: '0.05em' }}>OBRIGATÓRIO</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {(requiresSubservice && !selectedSubserviceId) && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 10,
                }}>
                  <FileStack size={15} color="#d97706" />
                  <span style={{ fontSize: 12, color: '#92400e' }}>
                    Selecione um subserviço para ver os documentos que serão solicitados.
                  </span>
                </div>
              )}

            </div>
          )}
        </div>

        {/* ─── FOOTER ─── */}
        {!loading && (
          <div style={{
            padding: '14px 24px 18px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8f7f4',
          }}>
            {showSuccess ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', color: '#15803d', fontWeight: 700, fontSize: 14,
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
              }}>
                <CheckCircle2 size={18} />
                Assessoria salva com sucesso!
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (requiresSubservice && !selectedSubserviceId)}
                style={{
                  width: '100%', padding: '13px 20px', borderRadius: 12, cursor: isSubmitting || (requiresSubservice && !selectedSubserviceId) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontSize: 14, fontWeight: 700, letterSpacing: '0.03em', border: 'none',
                  background: isSubmitting || (requiresSubservice && !selectedSubserviceId)
                    ? '#e2e8f0'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: isSubmitting || (requiresSubservice && !selectedSubserviceId) ? '#94a3b8' : '#0f172a',
                  boxShadow: isSubmitting || (requiresSubservice && !selectedSubserviceId) ? 'none' : '0 4px 16px rgba(217,119,6,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {isSubmitting ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <CalendarDays size={16} />
                )}
                {isSubmitting
                  ? 'Salvando...'
                  : requiresSubservice && !selectedSubserviceId
                  ? 'Selecione um Subserviço'
                  : 'Enviar Formulário'}
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes assessoriaSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  )
}

// ─── Helpers de estilo ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 13,
  border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff',
  outline: 'none', boxSizing: 'border-box', color: '#1e293b',
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
      {children}
    </div>
  )
}

function ReadOnlyField({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '9px 12px', fontSize: 13, fontWeight: 600, color: '#1e293b',
      background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 10,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Lock size={12} color="#d97706" style={{ flexShrink: 0 }} />
      {children}
    </div>
  )
}

function PillButton({
  children, active, onClick, icon, flex, disabled,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
  flex?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
        transition: 'all 0.15s', border: 'none',
        flex: flex ? 1 : 'none',
        justifyContent: flex ? 'center' : 'flex-start',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        background: active ? '#f59e0b' : '#fff',
        color: active ? '#0f172a' : '#475569',
        boxShadow: active ? '0 2px 8px rgba(245,158,11,0.3)' : '0 0 0 1.5px #e2e8f0 inset',
      }}
    >
      {icon}
      {children}
    </button>
  )
}

function Section({
  children, icon, title, badge, dark,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  title: string
  badge?: { text: string; color: string }
  dark?: boolean
}) {
  return (
    <div style={{
      borderRadius: 14,
      border: dark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid #e2e8f0',
      background: dark ? '#0f172a' : '#ffffff',
      overflow: 'hidden',
    }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 16px 9px',
        borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9',
        background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
      }}>
        {icon}
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: dark ? '#94a3b8' : '#475569',
        }}>
          {title}
        </span>
        {badge && (
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700,
            color: badge.color, background: `${badge.color}18`,
            padding: '2px 8px', borderRadius: 99, letterSpacing: '0.06em',
          }}>
            {badge.text}
          </span>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        {children}
      </div>
    </div>
  )
}
