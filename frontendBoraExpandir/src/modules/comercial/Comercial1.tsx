import React, { useState, useMemo } from 'react'
import { Calendar, Clock, ShoppingCart, Check, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
// import { useToast } from '../../components/Toast'
// Update the import path below if Toast is located elsewhere:
import { useToast } from '../../components/ui/Toast' // <-- Ensure this file exists or update the path
import { SUCESSO, ERRO, AVISO } from '../../components/MockFrases'

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

// Mock de clientes cadastrados
const mockClientes: Cliente[] = [
  { id: '1', nome: 'João Silva', email: 'joao@example.com', telefone: '(11) 99999-1111' },
  { id: '2', nome: 'Maria Santos', email: 'maria@example.com', telefone: '(11) 99999-2222' },
  { id: '3', nome: 'Pedro Oliveira', email: 'pedro@example.com', telefone: '(11) 99999-3333' },
  { id: '4', nome: 'Ana Costa', email: 'ana@example.com', telefone: '(11) 99999-4444' },
  { id: '5', nome: 'Carlos Mendes', email: 'carlos@example.com', telefone: '(11) 99999-5555' },
  { id: '6', nome: 'Lucia Ferreira', email: 'lucia@example.com', telefone: '(11) 99999-6666' },
]

// Mock de produtos cadastrados pelo super admin
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

// Horários disponíveis para agendamento (configurável pelo super admin)
// TODO: Mover para configuração do banco de dados gerenciada pelo super admin
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
  const [mesAtual, setMesAtual] = useState(new Date())
  const [diasSelecionados, setDiasSelecionados] = useState<Set<number>>(new Set())
  const [horaSelecionada, setHoraSelecionada] = useState<string>('')
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [duracaoMinutos, setDuracaoMinutos] = useState<number>(60)
  const [passo, setPasso] = useState<'calendario' | 'horario' | 'produto' | 'cliente' | 'confirmacao'>(
    'calendario'
  )
  const [agendamentoPreview, setAgendamentoPreview] = useState<Agendamento | null>(null)
  const [searchCliente, setSearchCliente] = useState('')
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false)
  const [agendamentosDia, setAgendamentosDia] = useState<any[]>([])
  const [dataSelecionadaIso, setDataSelecionadaIso] = useState<string>('')

  // Cálculos de calendário
  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate()
  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay()
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1)

  // Filtrar clientes por busca
  const clientesFiltrados = useMemo(() => {
    return mockClientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchCliente.toLowerCase())
    )
  }, [searchCliente])

  const handleMesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))
  }

  const handleProximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))
  }

  const handleSelecionarDia = (dia: number) => {
    const novosDias = new Set(diasSelecionados)
    if (novosDias.has(dia)) {
      novosDias.delete(dia)
      setDataSelecionadaIso('')
      setAgendamentosDia([])
    } else {
      novosDias.clear()
      novosDias.add(dia)
    }
    setDiasSelecionados(novosDias)
    setHoraSelecionada('')
    if (novosDias.size > 0) {
      const dataIso = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia)
        .toISOString()
        .split('T')[0]
      setDataSelecionadaIso(dataIso)
      carregarAgendamentosDoDia(dataIso)
      setPasso('horario')
    }
  }

  const handleSelecionarHora = (hora: string) => {
    setHoraSelecionada(hora)
    setPasso('produto')
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

    if (!produtoSelecionado || diasSelecionados.size === 0 || !horaSelecionada) return

    const dia = Array.from(diasSelecionados)[0]
    const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia)
      .toISOString()
      .split('T')[0]

    const preview: Agendamento = {
      id: Date.now().toString(),
      data,
      hora: horaSelecionada,
      produto: produtoSelecionado,
      cliente,
      duracaoMinutos,
      status: 'agendado',
    }
    setAgendamentoPreview(preview)
    setPasso('confirmacao')
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

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
    if (!backendUrl) {
      console.error('VITE_BACKEND_URL não configurado; abortando chamada ao backend')
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

    // Reset
    setDiasSelecionados(new Set())
    setHoraSelecionada('')
    setProdutoSelecionado(null)
    setClienteSelecionado(null)
    setAgendamentoPreview(null)
    setDuracaoMinutos(60)
    setPasso('calendario')
  }

  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    mesAtual
  )

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Agendamento de Vendas</h1>
      <p className="text-gray-600 mb-8">Selecione um produto e agende seu atendimento</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CALENDÁRIO */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleMesAnterior}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleProximoMes}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Cabeçalho dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((dia) => (
                <div key={dia} className="text-center text-sm font-semibold text-gray-500">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: primeiroDia }).map((_, i) => (
                <div key={`vazio-${i}`} />
              ))}

              {dias.map((dia) => {
                const isSelected = diasSelecionados.has(dia)
                const isHoje =
                  dia === new Date().getDate() &&
                  mesAtual.getMonth() === new Date().getMonth() &&
                  mesAtual.getFullYear() === new Date().getFullYear()

                return (
                  <button
                    key={dia}
                    onClick={() => handleSelecionarDia(dia)}
                    className={`aspect-square rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : isHoje
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {dia}
                  </button>
                )
              })}
            </div>
          </div>

          {/* HORÁRIOS */}
          {passo === 'horario' && diasSelecionados.size > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Selecione o Horário</h3>
                  <p className="text-sm text-gray-600">Escolha o início e a duração do atendimento</p>
                </div>
                <div className="flex items-center gap-2">
                  {[30, 60, 90].map((duracao) => (
                    <button
                      key={duracao}
                      onClick={() => setDuracaoMinutos(duracao)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        duracaoMinutos === duracao
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : 'bg-white text-gray-800 border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {duracao} min
                    </button>
                  ))}
                </div>
              </div>

              {horaSelecionada && (
                <div className="mb-3 text-sm text-gray-700 flex items-center gap-2">
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
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        !disponivel
                          ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : horaSelecionada === hora
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      <Clock className="h-4 w-4 inline mr-2" />
                      {hora}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* PRODUTOS */}
          {passo === 'produto' && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecione o Produto</h3>
              <div className="space-y-3">
                {mockProdutos.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => handleSelecionarProduto(produto)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      produtoSelecionado?.id === produto.id
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300 bg-gray-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{produto.nome}</h4>
                        <p className="text-sm text-gray-600 mt-1">{produto.descricao}</p>
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

          {/* SELEÇÃO DE CLIENTE */}
          {passo === 'cliente' && produtoSelecionado && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Cliente</h3>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procurar Cliente
                  </label>
                  <div className="flex items-center gap-2 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchCliente}
                      onChange={(e) => {
                        setSearchCliente(e.target.value)
                        setMostrarListaClientes(true)
                      }}
                      onFocus={() => setMostrarListaClientes(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="Digite o nome ou email do cliente..."
                    />
                  </div>

                  {mostrarListaClientes && clientesFiltrados.length > 0 && (
                    <div className="absolute top-20 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {clientesFiltrados.map((cliente) => (
                        <button
                          key={cliente.id}
                          onClick={() => handleSelecionarCliente(cliente)}
                          className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-gray-200 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-800">{cliente.nome}</div>
                          <div className="text-sm text-gray-600">{cliente.email}</div>
                          <div className="text-xs text-gray-500">{cliente.telefone}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {mostrarListaClientes && searchCliente && clientesFiltrados.length === 0 && (
                    <div className="absolute top-20 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4">
                      <p className="text-gray-500 text-center">Nenhum cliente encontrado</p>
                    </div>
                  )}
                </div>

                {clienteSelecionado && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-emerald-900">Cliente Selecionado:</div>
                    <div className="mt-2 space-y-1">
                      <div className="text-emerald-800 font-medium">{clienteSelecionado.nome}</div>
                      <div className="text-emerald-700">{clienteSelecionado.email}</div>
                      <div className="text-emerald-700">{clienteSelecionado.telefone}</div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* RESUMO LATERAL */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 p-6 shadow-sm sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumo</h3>

            {/* Data */}
            {diasSelecionados.size > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Data</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Array.from(diasSelecionados)[0]} de {nomeMes}
                </p>
              </div>
            )}

            {/* Hora */}
            {horaSelecionada && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Horário</p>
                <p className="text-lg font-semibold text-gray-900">
                  {horaSelecionada} - {calcularHoraFim(horaSelecionada, duracaoMinutos)}
                </p>
                <p className="text-xs text-gray-600">Duração: {duracaoMinutos} min</p>
              </div>
            )}

            {/* Produto */}
            {produtoSelecionado && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Produto</p>
                <p className="text-lg font-semibold text-gray-900">{produtoSelecionado.nome}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">
                  R$ {produtoSelecionado.valor}
                </p>
              </div>
            )}

            {/* Cliente */}
            {clienteSelecionado && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Cliente</p>
                <p className="text-lg font-semibold text-gray-900">{clienteSelecionado.nome}</p>
                <p className="text-sm text-gray-600 mt-1">{clienteSelecionado.email}</p>
              </div>
            )}

          
            {agendamentoPreview ? (
              <button
                onClick={handleFinalizarAgendamento}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                Confirmar Agendamento
              </button>
            ) : (
              <p className="text-sm text-gray-600 text-center">
                {passo === 'calendario'
                  ? 'Selecione uma data'
                  : passo === 'horario'
                    ? 'Selecione um horário'
                    : passo === 'produto'
                      ? 'Escolha um produto'
                      : 'Selecione um cliente para confirmar'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* LISTA DE AGENDAMENTOS */}
      {agendamentos.length > 0 && (
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Agendamentos Realizados</h3>
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-xs text-gray-600">Data</p>
                    <p className="font-semibold text-gray-900">{agendamento.data}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Horário</p>
                    <p className="font-semibold text-gray-900">
                      {agendamento.hora} - {calcularHoraFim(agendamento.hora, agendamento.duracaoMinutos)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Produto</p>
                    <p className="font-semibold text-gray-900">{agendamento.produto.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Cliente</p>
                    <p className="font-semibold text-gray-900">{agendamento.cliente.nome}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {agendamento.status}
                    </span>
                    {agendamento.linkPagamento && (
                      <a
                        href={agendamento.linkPagamento}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                      >
                        Link →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

