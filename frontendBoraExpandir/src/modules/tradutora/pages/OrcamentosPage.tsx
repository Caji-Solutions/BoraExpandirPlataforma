import React, { useMemo, useState } from 'react'
import { FileText, Calendar, Send, Folder, ArrowLeft, Search, User, ChevronRight, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import OrcamentoModal from '../components/OrcamentoModal'
import type { OrcamentoItem, OrcamentoFormData } from '../types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface OrcamentosPageProps {
  orcamentos: OrcamentoItem[]
  onResponderOrcamento: (orcamentoId: string, dados: OrcamentoFormData) => void
}

const statusConfig: Record<OrcamentoItem['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; label: string }> = {
  pendente: {
    variant: 'warning',
    label: 'Pendente',
  },
  respondido: {
    variant: 'success',
    label: 'Já Respondido',
  },
  aprovado: {
    variant: 'success',
    label: 'Aprovado',
  },
  recusado: {
    variant: 'destructive',
    label: 'Recusado',
  },
}

export default function OrcamentosPage({ orcamentos, onResponderOrcamento }: OrcamentosPageProps) {
  const [selectedOrcamento, setSelectedOrcamento] = useState<OrcamentoItem | null>(null)
  
  // Navigation State
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'todos' | OrcamentoItem['status']>('todos')

  // 1. Filtered Base Data
  const filteredBase = useMemo(() => {
    return orcamentos.filter(o => {
      const matchesFilter = filter === 'todos' ? true : o.status === filter
      const matchesSearch = o.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.documentoNome.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [orcamentos, filter, searchTerm])

  // 2. Group by Process
  const processes = useMemo(() => {
    const groups: Record<string, {
      id: string,
      clientName: string,
      items: OrcamentoItem[],
      pendentes: number
    }> = {}

    filteredBase.forEach(item => {
      const pId = item.processoId || `manual-${item.clienteNome}`
      if (!groups[pId]) {
        groups[pId] = {
          id: pId,
          clientName: item.clienteNome,
          items: [],
          pendentes: 0
        }
      }
      groups[pId].items.push(item)
      if (item.status === 'pendente') {
        groups[pId].pendentes++
      }
    })

    return Object.values(groups).sort((a, b) => {
        if (b.pendentes !== a.pendentes) return b.pendentes - a.pendentes
        return a.clientName.localeCompare(b.clientName)
    })
  }, [filteredBase])

  const currentProcess = selectedProcessId ? processes.find(p => p.id === selectedProcessId) : null

  // 3. Group Members within a Process
  const members = useMemo(() => {
    if (!currentProcess) return []

    const memberGroups: Record<string, {
      id: string,
      name: string,
      type: string,
      isTitular: boolean,
      items: OrcamentoItem[],
      pendentes: number
    }> = {}

    currentProcess.items.forEach(item => {
      const mId = item.dependenteId || 'titular'
      if (!memberGroups[mId]) {
        memberGroups[mId] = {
          id: mId,
          name: item.dependente?.nome_completo || currentProcess.clientName,
          type: item.dependente?.parentesco || 'Titular',
          isTitular: mId === 'titular',
          items: [],
          pendentes: 0
        }
      }
      memberGroups[mId].items.push(item)
      if (item.status === 'pendente') {
        memberGroups[mId].pendentes++
      }
    })

    return Object.values(memberGroups).sort((a, b) => {
      if (a.isTitular) return -1
      if (b.isTitular) return 1
      return a.name.localeCompare(b.name)
    })
  }, [currentProcess])

  const currentMember = selectedMemberId ? members.find(m => m.id === selectedMemberId) : null

  const pendentesTotal = orcamentos.filter(o => o.status === 'pendente').length

  const handleBack = () => {
    if (selectedMemberId) {
      setSelectedMemberId(null)
    } else if (selectedProcessId) {
      setSelectedProcessId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {(selectedProcessId || selectedMemberId) && (
              <button 
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {selectedMemberId ? currentMember?.name : selectedProcessId ? currentProcess?.clientName : 'Orçamentos'}
            </h1>
            {!selectedProcessId && pendentesTotal > 0 && (
              <Badge variant="warning" className="animate-pulse px-3 py-1">
                {pendentesTotal} {pendentesTotal === 1 ? 'pendente' : 'pendentes'}
              </Badge>
            )}
            {selectedProcessId && !selectedMemberId && currentProcess?.pendentes! > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                    {currentProcess?.pendentes} Pendente{currentProcess?.pendentes! > 1 ? 's' : ''}
                </Badge>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {selectedMemberId 
              ? `Documentos aguardando orçamento de ${currentMember?.name}`
              : selectedProcessId 
              ? `Membros do processo de ${currentProcess?.clientName}`
              : 'Gestão de orçamentos organizados por processo'}
          </p>
        </div>

        {!selectedMemberId && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar processo ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!selectedProcessId ? (
        <>
          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'todos', label: 'Todos', color: 'blue' },
              { id: 'pendente', label: 'Pendentes', color: 'yellow' },
              { id: 'respondido', label: 'Respondidos', color: 'green' },
              { id: 'aprovado', label: 'Aprovados', color: 'blue' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border ${
                  filter === f.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700 border-gray-200 dark:border-neutral-700 shadow-sm'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Process List View (ProcessQueue Style) */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-3xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b bg-gray-50/50 dark:bg-neutral-900/10 text-[10px] uppercase font-black text-gray-400 tracking-widest">
              <div className="col-span-4 text-left">Processo</div>
              <div className="col-span-3 text-center">Status dos Orçamentos</div>
              <div className="col-span-3 text-center">Última Atualização</div>
              <div className="col-span-2 text-center">Ação</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-neutral-700/50">
              {processes.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <Folder className="h-16 w-16 mx-auto mb-4 opacity-10" />
                  <p className="font-medium text-lg italic">Nenhum processo aguardando orçamento</p>
                </div>
              ) : (
                processes.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedProcessId(p.id)}
                    className="grid grid-cols-12 gap-4 px-8 py-6 items-center transition-all hover:bg-gray-50 dark:hover:bg-neutral-900/50 cursor-pointer group"
                  >
                    <div className="col-span-4 flex items-center gap-4 text-left">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${p.pendentes > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                        <Folder className={`h-6 w-6 ${p.pendentes > 0 ? 'text-red-500' : 'text-blue-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{p.clientName}</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{p.items.length} docs</span>
                           {p.pendentes > 0 && (
                             <Badge variant="destructive" className="animate-pulse text-[8px] h-4 py-0 font-black tracking-tighter">URGENTE</Badge>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30 text-center">
                          <span className="block text-sm font-black text-amber-600">{p.pendentes}</span>
                          <span className="text-[8px] uppercase font-bold text-amber-700/60 leading-none">Aguardam</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                          <span className="block text-sm font-black text-emerald-600">{p.items.length - p.pendentes}</span>
                          <span className="text-[8px] uppercase font-bold text-emerald-700/60 leading-none">Feitos</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3 text-center">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {new Date(p.items[0].created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] opacity-40 uppercase font-bold">Solicitado em</div>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <Button className="w-full max-w-[140px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-10 font-bold transition-all shadow-md active:scale-95">
                        Gerenciar
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : !selectedMemberId ? (
        /* Member List View (ProcessMemberCard Style) */
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b bg-gray-50/50 dark:bg-neutral-900/10 text-[10px] uppercase font-black text-gray-400 tracking-widest">
            <div className="col-span-5 text-left">Membro do Processo</div>
            <div className="col-span-2 text-center">Parentesco</div>
            <div className="col-span-3 text-center">Situação</div>
            <div className="col-span-2 text-center">Ação</div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-neutral-700/50">
            {members.map((member) => (
              <div 
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className="grid grid-cols-12 gap-4 px-8 py-6 items-center transition-all hover:bg-gray-50 dark:hover:bg-neutral-900/50 cursor-pointer group"
              >
                <div className="col-span-5 flex items-center gap-4 text-left">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${member.pendentes > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                    <User className={`h-5 w-5 ${member.pendentes > 0 ? 'text-red-500' : 'text-blue-600'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{member.name}</h3>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{member.items.length} Documentos</p>
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <Badge variant="outline" className="text-[10px] font-black uppercase bg-gray-50 border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
                    {member.type}
                  </Badge>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 px-3 py-1.5 rounded-xl text-center min-w-[60px]">
                      <span className="block text-sm font-black text-amber-600">{member.pendentes}</span>
                      <span className="text-[8px] uppercase font-bold text-amber-700/50 leading-none">Pendente</span>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 px-3 py-1.5 rounded-xl text-center min-w-[60px]">
                      <span className="block text-sm font-black text-emerald-600">{member.items.length - member.pendentes}</span>
                      <span className="text-[8px] uppercase font-bold text-emerald-700/50 leading-none">Ok</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex justify-center">
                  <Button variant="ghost" className="w-full max-w-[140px] text-blue-600 hover:bg-blue-50 rounded-2xl h-10 font-bold transition-all shadow-sm active:scale-95 group-hover:translate-x-1">
                    Documentos
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Document Cards View (within member) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
          {currentMember?.items.map(orcamento => (
            <div
              key={orcamento.id}
              className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-sm border transition-all flex flex-col p-6 hover:shadow-xl ${
                orcamento.status === 'pendente' 
                  ? 'border-red-200 dark:border-red-900/30 ring-1 ring-red-50 dark:ring-red-900/10' 
                  : 'border-gray-200 dark:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-6">
                <Badge variant={statusConfig[orcamento.status].variant} className="rounded-lg px-3 py-1 font-bold text-[10px]">
                  {statusConfig[orcamento.status].label}
                </Badge>
                <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase bg-gray-50/50 dark:bg-neutral-900 border-gray-200">
                  {orcamento.parIdiomas.origem} → {orcamento.parIdiomas.destino}
                </Badge>
              </div>

              <div className="mb-6 flex-1">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl shrink-0 ${orcamento.status === 'pendente' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                    <FileText className={`h-6 w-6 ${orcamento.status === 'pendente' ? 'text-red-500' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-2 text-lg">
                      {orcamento.documentoNome}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                       ID: {orcamento.id.slice(0, 8)}
                       <span className="w-1 h-1 rounded-full bg-gray-300" />
                       <Calendar className="h-3 w-3" />
                       {new Date(orcamento.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {orcamento.valorOrcamento && (
                <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 p-4 rounded-2xl mb-6">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Orçamento Enviado</span>
                     <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                       R$ {orcamento.valorOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </span>
                  </div>
                  {orcamento.prazoEntrega && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-600/70 font-medium">Previsão:</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                         {new Date(orcamento.prazoEntrega).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {orcamento.status === 'pendente' ? (
                <button
                  onClick={() => setSelectedOrcamento(orcamento)}
                  className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  Responder Orçamento
                </button>
              ) : (
                <div className="text-center py-4 border-2 border-dashed border-gray-100 dark:border-neutral-700/50 rounded-2xl text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Aguardando Aprovação
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <OrcamentoModal
        orcamento={selectedOrcamento}
        onClose={() => setSelectedOrcamento(null)}
        onSubmit={onResponderOrcamento}
      />
    </div>
  )
}
