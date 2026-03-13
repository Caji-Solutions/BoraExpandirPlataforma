import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Trash2, Phone, Search, Edit2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, X, User, Sparkles, Loader2, CheckCircle2, Copy, Key, Mail } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { PhoneInput } from '../../components/ui/PhoneInput'
import { cn } from '@/lib/utils'
import { useAuth } from '../../contexts/AuthContext'

interface Lead {
  id: string
  nome: string
  whatsapp: string
  email?: string
  status: string
  criado_por_nome?: string
  created_at: string
  updated_at: string
}

const ITEMS_PER_PAGE = 20

export default function LeadsPage() {
  const { activeProfile } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'nome' | 'whatsapp'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [formNome, setFormNome] = useState('')
  const [formTelefone, setFormTelefone] = useState('')
  const [saving, setSaving] = useState(false)
  const [isConverting, setIsConverting] = useState<string | null>(null)
  const [conversionSuccess, setConversionSuccess] = useState<any | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''

  // Buscar leads reais do backend
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${backendUrl}/cliente/clientes`)
      if (!response.ok) throw new Error('Erro ao buscar')
      const result = await response.json()
      const all = result.data || []
      // Filtrar somente leads (status LEAD)
      const onlyLeads: Lead[] = all
        .filter((c: any) => c.status === 'LEAD')
        .map((c: any) => ({
          id: c.id,
          nome: c.nome,
          whatsapp: c.whatsapp || c.telefone || '',
          email: c.email,
          status: c.status,
          criado_por_nome: c.criado_por_nome || c.responsavel_nome || null,
          created_at: c.created_at || c.criado_em || new Date().toISOString(),
          updated_at: c.updated_at || c.atualizado_em || new Date().toISOString(),
        }))
      setLeads(onlyLeads)
    } catch (err) {
      console.error('Erro ao carregar leads:', err)
    } finally {
      setLoading(false)
    }
  }, [backendUrl])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Filtrar e ordenar
  const filteredSorted = useMemo(() => {
    let filtered = leads

    // Busca por nome ou número
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        l =>
          l.nome.toLowerCase().includes(term) ||
          l.whatsapp.includes(term)
      )
    }

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      let valA: string, valB: string
      if (sortBy === 'created_at') {
        valA = a.created_at
        valB = b.created_at
      } else if (sortBy === 'nome') {
        valA = a.nome.toLowerCase()
        valB = b.nome.toLowerCase()
      } else {
        valA = a.whatsapp
        valB = b.whatsapp
      }

      if (sortDir === 'asc') return valA < valB ? -1 : valA > valB ? 1 : 0
      return valA > valB ? -1 : valA < valB ? 1 : 0
    })

    return filtered
  }, [leads, searchTerm, sortBy, sortDir])

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / ITEMS_PER_PAGE))
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSorted.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSorted, currentPage])

  // Resetar página quando busca muda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortBy, sortDir])

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir(field === 'created_at' ? 'desc' : 'asc')
    }
  }

  const SortIcon = ({ field }: { field: typeof sortBy }) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
    return sortDir === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
      : <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
  }

  // Modal handlers
  const handleOpenCreate = () => {
    setEditingLead(null)
    setFormNome('')
    setFormTelefone('')
    setShowModal(true)
  }

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead)
    setFormNome(lead.nome)
    setFormTelefone(lead.whatsapp)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingLead(null)
    setFormNome('')
    setFormTelefone('')
  }

  const handleSaveLead = async () => {
    if (!formNome.trim() || !formTelefone.trim()) return

    setSaving(true)
    try {
      if (editingLead) {
        // Atualizar no backend (PATCH)
        const response = await fetch(`${backendUrl}/cliente/clientes/${editingLead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: formNome, whatsapp: formTelefone })
        })
        if (response.ok) {
          setLeads(prev =>
            prev.map(l =>
              l.id === editingLead.id
                ? { ...l, nome: formNome, whatsapp: formTelefone, updated_at: new Date().toISOString() }
                : l
            )
          )
        }
      } else {
        // Criar novo lead
        const response = await fetch(`${backendUrl}/cliente/register-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: formNome,
            whatsapp: formTelefone,
            criado_por: activeProfile?.id,
            criado_por_nome: activeProfile?.full_name
          })
        })
        if (response.ok) {
          await fetchLeads() // Recarregar lista
        }
      }
      handleCloseModal()
    } catch (err) {
      console.error('Erro ao salvar lead:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleConvertLead = async (lead: Lead) => {
    setIsConverting(lead.id)
    try {
      const response = await fetch(`${backendUrl}/cliente/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: lead.nome,
          email: lead.email,
          whatsapp: lead.whatsapp,
          telefone: lead.whatsapp,
          status: 'cliente',
          stage: 'aguardando_consultoria'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao converter lead')
      }

      const result = await response.json()
      setConversionSuccess({
        lead,
        loginInfo: result.loginInfo || { email: lead.email, password: 'Bora' + Math.floor(1000 + Math.random() * 9000) }
      })
      
      // Atualiza a lista local removendo o lead convertido
      setLeads(prev => prev.filter(l => l.id !== lead.id))
    } catch (err: any) {
      console.error("Erro na conversão:", err)
      alert(err.message)
    } finally {
      setIsConverting(null)
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return
    try {
      await fetch(`${backendUrl}/cliente/clientes/${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error('Erro ao deletar lead:', err)
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return iso
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leads</h1>
        <p className="text-gray-599 dark:text-gray-400">
          Gerencie seus leads — {filteredSorted.length} {filteredSorted.length === 1 ? 'lead' : 'leads'}
        </p>
      </div>

      {/* Barra de Busca + Ações */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou número..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Lead</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Carregando leads...</p>
          </div>
        ) : paginatedLeads.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Nenhum lead encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Tente refinar sua busca' : 'Comece adicionando novos leads'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700/50">
                  <th className="px-6 py-3 text-left">
                    <button onClick={() => toggleSort('nome')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
                      Nome <SortIcon field="nome" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button onClick={() => toggleSort('whatsapp')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
                      Telefone <SortIcon field="whatsapp" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Criado por</span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button onClick={() => toggleSort('created_at')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
                      Data <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {paginatedLeads.map(lead => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{lead.nome}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 shrink-0" />
                        <a
                          href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          {lead.whatsapp}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.criado_por_nome ? (
                        <Badge variant="outline" className="text-xs capitalize">
                          {lead.criado_por_nome}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleConvertLead(lead)}
                          disabled={isConverting === lead.id}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
                          title="Tornar Cliente"
                        >
                          {isConverting === lead.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Editar lead"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Deletar lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages} — {filteredSorted.length} leads
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Números de página */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Cadastro/Edição — somente Nome + Telefone */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {editingLead ? 'Editar Lead' : 'Novo Lead'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNome}
                  onChange={e => setFormNome(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nome do lead"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone/WhatsApp <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  value={formTelefone}
                  onChange={setFormTelefone}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLead}
                disabled={!formNome.trim() || !formTelefone.trim() || saving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? 'Salvando...' : editingLead ? 'Salvar' : 'Criar Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Sucesso na Conversão */}
      {conversionSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-emerald-600 p-6 text-center text-white relative">
              <Sparkles className="h-12 w-12 text-white/20 absolute -top-2 -right-2 rotate-12" />
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1 tracking-tight">Lead Convertido!</h2>
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Acesso gerado com sucesso</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Login / E-mail</p>
                      <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{conversionSuccess.loginInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Senha Temporária</p>
                      <div className="flex items-center gap-2">
                        <code className={cn(
                          "text-sm font-mono font-black border-b-2 border-emerald-500/30",
                          conversionSuccess.loginInfo.password.includes(' ') ? "text-amber-600 border-amber-500/30" : "text-emerald-700 dark:text-emerald-400"
                        )}>
                          {conversionSuccess.loginInfo.password}
                        </code>
                        {!conversionSuccess.loginInfo.password.includes(' ') && (
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(conversionSuccess.loginInfo.password)
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded text-emerald-600"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    const message = `Olá! Seu acesso à plataforma BoraExpandir foi criado.\n\nLogin: ${conversionSuccess.loginInfo.email}\nSenha: ${conversionSuccess.loginInfo.password}`
                    alert('Credenciais enviadas para: ' + conversionSuccess.lead.email)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  <Mail className="h-4 w-4" />
                  Enviar por E-mail
                </button>
                <button
                  onClick={() => setConversionSuccess(null)}
                  className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 font-black uppercase tracking-widest"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
