import React, { useState, useMemo, useEffect, useRef } from 'react'
import {  Clock, ShoppingCart, Check, ChevronLeft, ChevronRight, Search, X, Trash2 } from 'lucide-react'
// import { useToast } from '../../components/Toast'
// Update the import path below if Toast is located elsewhere:
import { useToast } from '../../components/ui/Toast' // <-- Ensure this file exists or update the path
import { SUCESSO, ERRO, AVISO } from '../../components/MockFrases'
import { CalendarPicker } from '../../components/ui/CalendarPicker'

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
}

interface Produto {
  id: string
  nome: string
  descricao: string
  valor: number
  imagem?: string
}

interface Agendamento {
  id: string
  data: string
  hora: string
  produto: Produto
  cliente: Cliente
  duracaoMinutos: number
  linkPagamento?: string
  status: 'agendado' | 'confirmado' | 'pago'
}

const mockClientes: Cliente[] = [
  { id: '1', nome: 'João Silva', email: 'joao@example.com', telefone: '(11) 99999-1111' },
  { id: '2', nome: 'Maria Santos', email: 'maria@example.com', telefone: '(11) 99999-2222' },
  { id: '3', nome: 'Pedro Oliveira', email: 'pedro@example.com', telefone: '(11) 99999-3333' },
  { id: '4', nome: 'Ana Costa', email: 'ana@example.com', telefone: '(11) 99999-4444' },
  { id: '5', nome: 'Carlos Mendes', email: 'carlos@example.com', telefone: '(11) 99999-5555' },
  { id: '6', nome: 'Lucia Ferreira', email: 'lucia@example.com', telefone: '(11) 99999-6666' },
]

const mockProdutos: Produto[] = [
  {
    id: '1',
    nome: 'Consultoria Empresarial 1h',
    descricao: 'Sessão de consultoria empresarial com especialista',
    valor: 300,
  },
  {
    id: '2',
    nome: 'Mentoria de Negócios 2h',
    descricao: 'Mentoria intensiva para estratégia de negócios',
    valor: 500,
  },
  {
    id: '3',
    nome: 'Análise de Mercado',
    descricao: 'Análise completa do seu mercado e concorrência',
    valor: 800,
  },
  {
    id: '4',
    nome: 'Workshop Expansão Internacional',
    descricao: 'Workshop sobre expansão para mercados internacionais',
    valor: 1200,
  },
]

const HORARIOS_DISPONIVEIS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
]

export default function Comercial1() {
  const { success, error } = useToast()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes)
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined)
  const [horaSelecionada, setHoraSelecionada] = useState<string>('')
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [duracaoMinutos, setDuracaoMinutos] = useState<number>(60)
  const [passo, setPasso] = useState<'cliente' | 'calendario' | 'horario' | 'produto' | 'confirmacao'>('cliente')
  const [searchCliente, setSearchCliente] = useState('')
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false)
  const [agendamentosDia, setAgendamentosDia] = useState<any[]>([])
  const [dataSelecionadaIso, setDataSelecionadaIso] = useState<string>('')
  const [showNovoCliente, setShowNovoCliente] = useState(false)
  const [showModalPagamento, setShowModalPagamento] = useState(false)
  const [paymentLink, setPaymentLink] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [novoCliente, setNovoCliente] = useState<Cliente>({
    id: '',
    nome: '',
    email: '',
    telefone: '',
  })
  const clienteSelectorRef = useRef<HTMLDivElement | null>(null)

  // Filtrar clientes por busca
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchCliente.toLowerCase())
    )
  }, [searchCliente, clientes])

  const agendamentoPreview = useMemo<Agendamento | null>(() => {
    if (!clienteSelecionado || !dataSelecionada || !horaSelecionada || !produtoSelecionado) return null
    const dataIso = dataSelecionada.toISOString().split('T')[0]
    return {
      id: Date.now().toString(),
      data: dataIso,
      hora: horaSelecionada,
      produto: produtoSelecionado,
      cliente: clienteSelecionado,
      duracaoMinutos,
      status: 'agendado',
    }
  }, [clienteSelecionado, dataSelecionada, horaSelecionada, produtoSelecionado, duracaoMinutos])

  // Fechar a lista de clientes ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (clienteSelectorRef.current && !clienteSelectorRef.current.contains(event.target as Node)) {
        setMostrarListaClientes(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const handleSelecionarData = (data: Date) => {
    setDataSelecionada(data)
    setHoraSelecionada('')
    const dataIso = data.toISOString().split('T')[0]
    setDataSelecionadaIso(dataIso)
    carregarAgendamentosDoDia(dataIso)
    setPasso('horario')
  }

  const handleSelecionarHora = (hora: string) => {
    setHoraSelecionada(hora)
    setPasso('produto')
  }

  const handleRemoverData = () => {
    setDataSelecionada(undefined)
    setHoraSelecionada('')
    setPasso('calendario')
  }

  const handleRemoverHora = () => {
    setHoraSelecionada('')
    setPasso('horario')
  }

  const handleRemoverProduto = () => {
    setProdutoSelecionado(null)
    setPasso('produto')
  }

  const handleRemoverCliente = () => {
    setClienteSelecionado(null)
    setPasso('cliente')
    setMostrarListaClientes(false)
    setShowNovoCliente(false)
    setSearchCliente('')
  }

  const calcularHoraFim = (horaInicio: string, duracao: number) => {
    const [h, m] = horaInicio.split(':').map(Number)
    const inicio = new Date(2000, 0, 1, h, m)
    const fim = new Date(inicio.getTime() + duracao * 60000)
    const hh = fim.getHours().toString().padStart(2, '0')
    const mm = fim.getMinutes().toString().padStart(2, '0')
    return `${hh}:${mm}`
  }

  const handleSelecionarProduto = (produto: Produto) => {
    setProdutoSelecionado(produto)
    setPasso('cliente')
  }

  const handleSelecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setSearchCliente('')
    setMostrarListaClientes(false)
    setPasso('calendario')
  }

  const carregarAgendamentosDoDia = async (dataIso: string) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
    if (!backendUrl) {
      console.error('VITE_BACKEND_URL não configurado; não foi possível buscar disponibilidade')
      setAgendamentosDia([])
      return
    }

    try {
      const response = await fetch(`${backendUrl}/comercial/agendamentos/${dataIso}`)
      if (!response.ok) {
        console.error('Erro ao buscar agendamentos do dia')
        setAgendamentosDia([])
        return
      }
      const data = await response.json()
      setAgendamentosDia(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar agendamentos do dia:', error)
      setAgendamentosDia([])
    }
  }

  const isHorarioDisponivel = (hora: string) => {
    if (!dataSelecionadaIso) return true

    const inicioNovo = new Date(`${dataSelecionadaIso}T${hora}:00Z`)
    const fimNovo = new Date(inicioNovo.getTime() + duracaoMinutos * 60000)

    return agendamentosDia.every((agendamento) => {
      const inicioExistente = new Date(agendamento.data_hora)
      const duracaoExistente = agendamento.duracao_minutos || 60
      const fimExistente = new Date(inicioExistente.getTime() + duracaoExistente * 60000)

      const sobrepoe = inicioExistente < fimNovo && inicioNovo < fimExistente
      return !sobrepoe
    })
  }

  const handleFinalizarAgendamento = async () => {
    if (!agendamentoPreview) return

    const resumoTexto = `Oi ${agendamentoPreview.cliente.nome}! Seu agendamento está marcado para ${agendamentoPreview.data} às ${agendamentoPreview.hora} (${agendamentoPreview.duracaoMinutos} min) - ${agendamentoPreview.produto.nome}.`
    const linkPagamentoGerado = `https://pay.example.com/${agendamentoPreview.id}`

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
    if (!backendUrl) {
      console.error('VITE_BACKEND_URL não configurado; abortando chamada ao backend')
      // Mesmo sem backend, exibe modal com link mockado
      setPaymentLink(linkPagamentoGerado)
      setShareMessage(`${resumoTexto} Link de pagamento: ${linkPagamentoGerado}`)
      setShowModalPagamento(true)
      return
    }

    // Monta payload esperado pelo backend
    const payload = {
      nome: agendamentoPreview.cliente.nome,
      email: agendamentoPreview.cliente.email,
      telefone: agendamentoPreview.cliente.telefone,
      data_hora: `${agendamentoPreview.data}T${agendamentoPreview.hora}:00`,
      produto_id: agendamentoPreview.produto.id,
      duracao_minutos: agendamentoPreview.duracaoMinutos,
      status: agendamentoPreview.status,
    }
    console.log('Agendamento salvo no backend:', payload)

    try {
      const response = await fetch(`${backendUrl}/comercial/agendamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.status === 409) {
        const body = await response.json().catch(() => ({}))
        const msg = body?.message || ERRO.HORARIO_INDISPONIVEL
        error(msg)
        return
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        console.error('Erro ao salvar agendamento:', body)
        error(body?.message || ERRO.AGENDAMENTO_FALHOU)
        return
      }

      console.log('Agendamento salvo no backend:', payload)
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err)
      error(ERRO.AGENDAMENTO_FALHOU)
      return
    }

    setAgendamentos([...agendamentos, agendamentoPreview])

    // Sucesso: prepara modal de pagamento/compartilhamento
    setPaymentLink(linkPagamentoGerado)
    setShareMessage(`${resumoTexto} Link de pagamento: ${linkPagamentoGerado}`)
    setShowModalPagamento(true)

    // Reset
    setDataSelecionada(undefined)
    setHoraSelecionada('')
    setProdutoSelecionado(null)
    setClienteSelecionado(null)
    setDuracaoMinutos(60)
    setPasso('calendario')
  }

  const handleCadastrarNovoCliente = () => {
    if (!novoCliente.nome || !novoCliente.email || !novoCliente.telefone) {
      error('Preencha nome, e-mail e telefone.')
      return
    }
    const cliente: Cliente = {
      ...novoCliente,
      id: Date.now().toString(),
    }
    setClientes((prev) => [...prev, cliente])
    setClienteSelecionado(cliente)
    setShowNovoCliente(false)
    setMostrarListaClientes(false)
    setNovoCliente({ id: '', nome: '', email: '', telefone: '' })
    success('Cliente cadastrado e selecionado.')
    setPasso('calendario')
  }

  const mostrarFluxo = clienteSelecionado && ((passo === 'calendario') || (passo === 'horario' && dataSelecionada) || passo === 'produto')

  return (
  <div className="max-w-6xl mx-auto py-8">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Agendamento de Vendas</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-8">Selecione ou cadastre um cliente e agende o atendimento</p>

    {/* SELEÇÃO / CADASTRO DE CLIENTE (só mostra se não houver cliente selecionado) */}
    {!clienteSelecionado ? (
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cliente</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Busque um cliente ou cadastre um novo lead</p>
          </div>
          <button
            onClick={() => setShowNovoCliente((v) => !v)}
            className="px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition"
          >
            {showNovoCliente ? 'Cancelar cadastro' : 'Cadastrar novo cliente'}
          </button>
        </div>

        {/* Busca de cliente */}
        <div className="relative mb-4" ref={clienteSelectorRef}>
          <div className="flex items-center gap-2 relative">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchCliente}
              onChange={(e) => {
                setSearchCliente(e.target.value)
                setMostrarListaClientes(true)
              }}
              onFocus={() => setMostrarListaClientes(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Digite o nome ou email do cliente..."
            />
          </div>

          {mostrarListaClientes && clientesFiltrados.length > 0 && (
            <div className="absolute top-14 left-0 right-0 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {clientesFiltrados.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => handleSelecionarCliente(cliente)}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-b border-gray-200 dark:border-neutral-700 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-gray-800 dark:text-gray-200">{cliente.nome}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{cliente.email}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">{cliente.telefone}</div>
                </button>
              ))}
            </div>
          )}

          {mostrarListaClientes && searchCliente && clientesFiltrados.length === 0 && (
            <div className="absolute top-14 left-0 right-0 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg shadow-lg z-10 p-4">
              <p className="text-gray-500 dark:text-gray-400 text-center">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>

        {/* Cadastro rápido de lead */}
        {showNovoCliente && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
              placeholder="Nome"
              value={novoCliente.nome}
              onChange={(e) => setNovoCliente((p) => ({ ...p, nome: e.target.value }))}
            />
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
              placeholder="E-mail"
              value={novoCliente.email}
              onChange={(e) => setNovoCliente((p) => ({ ...p, email: e.target.value }))}
            />
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
              placeholder="Telefone"
              value={novoCliente.telefone}
              onChange={(e) => setNovoCliente((p) => ({ ...p, telefone: e.target.value }))}
            />
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={handleCadastrarNovoCliente}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Salvar e selecionar
              </button>
            </div>
          </div>
        )}

        {/* Botão para prosseguir após selecionar */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => clienteSelecionado ? setPasso('calendario') : error('Selecione ou cadastre um cliente.')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              clienteSelecionado
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Prosseguir para calendário
          </button>
        </div>
      </div>
    ) : null}

    {mostrarFluxo ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {clienteSelecionado && passo === 'calendario' && (
            <CalendarPicker
              onDateSelect={handleSelecionarData}
              selectedDate={dataSelecionada || undefined}
              disabledDates={[]}
            />
          )}

          {clienteSelecionado && passo === 'horario' && dataSelecionada && (
            <div className="mt-6 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selecione o Horário</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Escolha o início e a duração do atendimento</p>
                </div>
                <div className="flex items-center gap-2">
                  {[30, 60, 90].map((duracao) => (
                    <button
                      key={duracao}
                      onClick={() => setDuracaoMinutos(duracao)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${duracaoMinutos === duracao
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : 'bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-neutral-600 hover:border-emerald-400'}`}
                    >
                      {duracao} min
                    </button>
                  ))}
                </div>
              </div>

              {horaSelecionada && (
                <div className="mb-3 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>
                    Início {horaSelecionada} · Término {calcularHoraFim(horaSelecionada, duracaoMinutos)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {HORARIOS_DISPONIVEIS.map((hora) => {
                  const disponivel = isHorarioDisponivel(hora)
                  return (
                    <button
                      key={hora}
                      onClick={() => disponivel && handleSelecionarHora(hora)}
                      disabled={!disponivel}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${!disponivel
                          ? 'bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-neutral-500 border border-gray-200 dark:border-neutral-600 cursor-not-allowed'
                          : horaSelecionada === hora
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-neutral-600 border border-gray-300 dark:border-neutral-600'}`}
                    >
                      <Clock className="h-4 w-4 inline mr-2" />
                      {hora}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {clienteSelecionado && passo === 'produto' && (
            <div className="mt-6 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selecione o Produto</h3>
              <div className="space-y-3">
                {mockProdutos.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => handleSelecionarProduto(produto)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${produtoSelecionado?.id === produto.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
                        : 'border-gray-200 dark:border-neutral-600 hover:border-emerald-300 bg-gray-50 dark:bg-neutral-700 hover:bg-white dark:hover:bg-neutral-600'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{produto.nome}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{produto.descricao}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-emerald-600">R$ {produto.valor}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 flex justify-center">
          <div className="w-full max-w-md bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-neutral-800 rounded-xl border border-emerald-200 dark:border-emerald-500/30 p-6 shadow-sm sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">Resumo</h3>

          {/* Data */}
          {dataSelecionada && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Data</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {dataSelecionada.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button
                onClick={handleRemoverData}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Remover data"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Hora */}
          {horaSelecionada && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Horário</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {horaSelecionada} - {calcularHoraFim(horaSelecionada, duracaoMinutos)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Duração: {duracaoMinutos} min</p>
              </div>
              <button
                onClick={handleRemoverHora}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Remover horário"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Produto */}
          {produtoSelecionado && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Produto</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{produtoSelecionado.nome}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">
                  R$ {produtoSelecionado.valor}
                </p>
              </div>
              <button
                onClick={handleRemoverProduto}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Remover produto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Cliente */}
          {clienteSelecionado && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cliente</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{clienteSelecionado.nome}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{clienteSelecionado.email}</p>
              </div>
              <button
                onClick={handleRemoverCliente}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Remover cliente"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}


            <div className="pt-2">
              <button
                onClick={handleFinalizarAgendamento}
                disabled={!agendamentoPreview}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${agendamentoPreview
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                <Check className="h-5 w-5" />
                Criar agendamento
              </button>
              {!agendamentoPreview && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  Complete cliente, data, horário e produto para liberar.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex justify-center">
        <div className="w-full max-w-xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-neutral-800 rounded-xl border border-emerald-200 dark:border-emerald-500/30 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">Resumo</h3>
          {/* Data */}
          {dataSelecionada && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Data</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {dataSelecionada.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button
                onClick={handleRemoverData}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Remover data"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Hora */}
          {horaSelecionada && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Horário</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {horaSelecionada} - {calcularHoraFim(horaSelecionada, duracaoMinutos)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Duração: {duracaoMinutos} min</p>
              </div>
              <button
                onClick={handleRemoverHora}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Remover horário"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Produto */}
          {produtoSelecionado && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Produto</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{produtoSelecionado.nome}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">
                  R$ {produtoSelecionado.valor}
                </p>
              </div>
              <button
                onClick={handleRemoverProduto}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Remover produto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Cliente */}
          {clienteSelecionado && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-neutral-700 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cliente</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{clienteSelecionado.nome}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{clienteSelecionado.email}</p>
              </div>
              <button
                onClick={handleRemoverCliente}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Remover cliente"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleFinalizarAgendamento}
              disabled={!agendamentoPreview}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${agendamentoPreview
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              <Check className="h-5 w-5" />
              Criar agendamento
            </button>
            {!agendamentoPreview && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Complete cliente, data, horário e produto para liberar.
              </p>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Modal Pagamento / Compartilhar */}
    {showModalPagamento && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-6 relative">
          <button
            onClick={() => setShowModalPagamento(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Link de pagamento gerado</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Envie para o cliente e confirme o pagamento.</p>

          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Link</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={paymentLink}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={() => navigator.clipboard?.writeText(paymentLink)}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Copiar
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mensagem pronta</p>
            <textarea
              readOnly
              value={shareMessage}
              className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigator.clipboard?.writeText(shareMessage)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
            >
              Copiar mensagem
            </button>
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={() => navigator.share({ text: shareMessage, url: paymentLink }).catch(() => {})}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Compartilhar (nativo)
              </button>
            )}
          </div>
        </div>
      </div>
    )}

  </div>
  )
}

