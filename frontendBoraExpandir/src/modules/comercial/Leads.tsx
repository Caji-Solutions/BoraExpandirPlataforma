import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Trash2, Phone, Search, Edit2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, X, User, Sparkles, Loader2, CheckCircle2, Copy, Key, Mail, StickyNote, Send } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { PhoneInput } from '@/components/ui/PhoneInput'
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

  // Notas do Lead
  const [notesModalLead, setNotesModalLead] = useState<Lead | null>(null)
  const [leadNotes, setLeadNotes] = useState<any[]>([])
  const [newLeadNote, setNewLeadNote] = useState('')
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
 
  // Conversão de Lead em Cliente
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null)
  const [formEmail, setFormEmail] = useState('')
  const [formCpf, setFormCpf] = useState('')
  const [formEndereco, setFormEndereco] = useState('')
  const [converting, setConverting] = useState(false)

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

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return
    try {
      await fetch(`${backendUrl}/cliente/clientes/${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error('Erro ao deletar lead:', err)
    }
  }

  // ========= NOTAS =========
  const handleOpenNotes = async (lead: Lead) => {
    setNotesModalLead(lead)
    setNewLeadNote('')
    setLoadingNotes(true)
    try {
      const response = await fetch(`${backendUrl}/cliente/lead-notas/${lead.id}`)
      if (response.ok) {
        const result = await response.json()
        setLeadNotes(result.data || [])
      }
    } catch (err) {
      console.error('Erro ao buscar notas:', err)
    } finally {
      setLoadingNotes(false)
    }
  }

  const handleSaveNote = async () => {
    if (!newLeadNote.trim() || !notesModalLead) return
    setSavingNote(true)
    try {
      const response = await fetch(`${backendUrl}/cliente/lead-notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: notesModalLead.id,
          texto: newLeadNote,
          autorId: activeProfile?.id,
          autorNome: activeProfile?.full_name,
          autorSetor: activeProfile?.role
        })
      })
      if (response.ok) {
        const result = await response.json()
        setLeadNotes(prev => [result.data, ...prev])
        setNewLeadNote('')
      }
    } catch (err) {
      console.error('Erro ao salvar nota:', err)
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`${backendUrl}/cliente/lead-notas/${noteId}?userId=${activeProfile?.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao deletar nota')
      }
      setLeadNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (err: any) {
      console.error('Erro ao deletar nota:', err)
      alert(err.message)
    }
  }

  // ========= CONVERSÃO =========
  const handleOpenConvert = (lead: Lead) => {
    setConvertingLead(lead)
    setFormEmail(lead.email || '')
    setFormCpf('')
    setFormEndereco('')
    setShowConvertModal(true)
  }

  const handleConvertLead = async () => {
    if (!convertingLead || !formEmail.trim()) return

    setConverting(true)
    try {
      const response = await fetch(`${backendUrl}/cliente/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: convertingLead.nome,
          email: formEmail,
          whatsapp: convertingLead.whatsapp,
          documento: formCpf,
          endereco: formEndereco,
          status: 'cliente'
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Lead convertido com sucesso!\n\nID: ${result.id}\nStatus: ${result.status}\n\nCredenciais Geradas:\nE-mail: ${result.loginInfo?.email}\nSenha Temporária: ${result.loginInfo?.password}`)
        // Remover da lista de leads
        setLeads(prev => prev.filter(l => l.id !== convertingLead.id))
        setShowConvertModal(false)
      } else {
        const errData = await response.json()
        alert(`Erro ao converter lead: ${errData.message}`)
      }
    } catch (err) {
      console.error('Erro ao converter lead:', err)
      alert('Erro interno ao converter lead')
    } finally {
      setConverting(false)
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
                          onClick={() => handleOpenNotes(lead)}
                          className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors border border-amber-100 dark:border-amber-500/20 shadow-sm"
                          title="Notas do lead"
                        >
                          <StickyNote className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenConvert(lead)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
                          title="Transformar em Cliente"
                        >
                          <CheckCircle2 className="h-4 w-4" />
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
      {/* Modal de Notas do Lead */}
      {notesModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 flex flex-col max-h-[80vh] relative">
            <button
              onClick={() => setNotesModalLead(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-amber-500" />
                Notas — {notesModalLead.nome}
              </h3>
            </div>

            {/* Input */}
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex gap-2">
                <textarea
                  value={newLeadNote}
                  onChange={e => setNewLeadNote(e.target.value)}
                  placeholder="Escreva uma nota..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none min-h-[60px]"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSaveNote()
                    }
                  }}
                />
                <button
                  onClick={handleSaveNote}
                  disabled={!newLeadNote.trim() || savingNote}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                >
                  {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingNotes ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500 mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Carregando notas...</p>
                </div>
              ) : leadNotes.length === 0 ? (
                <div className="text-center py-8">
                  <StickyNote className="h-10 w-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma nota ainda</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Adicione observações sobre este lead</p>
                </div>
              ) : (
                leadNotes.map((note: any) => (
                  <div key={note.id} className="bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-lg p-3 group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {note.autor_nome || note.autor?.full_name || 'Usuário'}
                        </span>
                        {(note.autor_setor || note.autor?.role) && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight bg-gray-200 text-gray-700 dark:bg-neutral-700 dark:text-gray-300">
                            {note.autor_setor || note.autor?.role}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">
                          {new Date(note.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {note.autor_id === activeProfile?.id && (
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                            title="Excluir nota"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.texto}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal de Conversão de Lead para Cliente */}
      {showConvertModal && convertingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-6 relative">
            <button
              onClick={() => setShowConvertModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              Converter em Cliente
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Ao converter, o sistema criará credenciais de login para <b>{convertingLead.nome}</b>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CPF/NIF (Opcional)
                </label>
                <input
                  type="text"
                  value={formCpf}
                  onChange={e => setFormCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endereço (Opcional)
                </label>
                <input
                  type="text"
                  value={formEndereco}
                  onChange={e => setFormEndereco(e.target.value)}
                  placeholder="Rua, Número, Cidade..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConvertLead}
                disabled={!formEmail.trim() || converting}
                className="px-6 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Converter Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
