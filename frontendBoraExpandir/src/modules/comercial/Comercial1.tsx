import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Clock, ShoppingCart, Check, ChevronLeft, ChevronRight, Search, X, Trash2, Loader2 } from 'lucide-react'
// import { useToast } from '../../components/Toast'
// Update the import path below if Toast is located elsewhere:
import { useToast } from '../../components/ui/Toast'
import { SUCESSO, ERRO, AVISO } from '../../components/MockFrases'
import { CalendarPicker } from '../../components/ui/CalendarPicker'
import { AgendamentoConfirmacaoModal } from './components/AgendamentoConfirmacaoModal'
import { useAuth } from '../../contexts/AuthContext'
import { catalogService, Service } from '../adm/services/catalogService'
import comercialService from './services/comercialService'

interface Cliente {
  id: string
  nome: string
  email?: string | null
  telefone: string
}

interface Produto {
  id: string
  nome: string
  descricao: string
  valor: number
  imagem?: string
  isEuro?: boolean
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

export interface Comercial1Props {
  preSelectedClient?: {
    id: string
    nome: string
    email: string
    telefone: string
  }
  isClientView?: boolean
}

export default function Comercial1({ preSelectedClient, isClientView = false }: Comercial1Props) {
  const { success, error } = useToast()
  const { activeProfile } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(false)

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoadingProdutos(true)
        // Fetch Clientes e Produtos em paralelo
        const [clientesData, produtosData] = await Promise.all([
          comercialService.getAllClientes(),
          catalogService.getCatalogServices()
        ])

        // Map Clientes
        const mappedClientes = clientesData.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          email: c.email || null,
          telefone: c.telefone
        }))
        setClientes(mappedClientes)

        // Map Produtos (Services) transformando para a interface Produto
        // Filtrar apenas os que possuem showInCommercial === true
        const mappedProdutos = produtosData
          .filter((s: Service) => s.showInCommercial)
          .map((s: Service) => ({
            id: s.id,
            nome: s.name,
            descricao: s.documents?.length 
              ? `Requer ${s.documents.length} documentos. Duração: ${s.duration}` 
              : `Duração estimada: ${s.duration}`,
            valor: Number(s.value),
            show: s.showInCommercial,
            isEuro: true // No catálogo atual os valores são em Euro
          }))
        setProdutos(mappedProdutos)

      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err)
        error("Erro ao carregar serviços ou clientes.")
      } finally {
        setLoadingProdutos(false)
      }
    }
    fetchInitialData()
  }, [])
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined)
  const [horaSelecionada, setHoraSelecionada] = useState<string>('')
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)

  // Exchange Rate State
  const [exchangeRate, setExchangeRate] = useState<number>(0)

  useEffect(() => {
    // Buscar cotação do Euro apenas se for visualização do cliente
    if (isClientView) {
      fetch('https://api.exchangerate-api.com/v4/latest/EUR')
        .then(res => res.json())
        .then(data => {
          setExchangeRate(data.rates.BRL)
        })
        .catch(err => {
          console.error("Erro ao buscar cotação", err)
          setExchangeRate(6.27) // Fallback seguro
        })
    }
  }, [isClientView])

  // Initialize with preSelectedClient if provided
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    preSelectedClient ? (preSelectedClient as Cliente) : null
  )
  const [duracaoMinutos, setDuracaoMinutos] = useState<number>(isClientView ? 40 : 60)
  const [emailTemporario, setEmailTemporario] = useState<string>('')

  // Novo fluxo: Produto -> Data -> Hora -> Lead (ou apenas Produto -> Data -> Hora se for cliente)
  const [passo, setPasso] = useState<'cliente' | 'calendario' | 'horario' | 'produto' | 'confirmacao'>(
    'produto'
  )

  useEffect(() => {
    if (preSelectedClient) {
      setClienteSelecionado(preSelectedClient as Cliente)
      // Cliente já está selecionado, começa no produto
      setPasso('produto')
    }
  }, [preSelectedClient])

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
  const [showConfirmacao, setShowConfirmacao] = useState(false)
  const [agendamentoPayload, setAgendamentoPayload] = useState<any>(null)
  const clienteSelectorRef = useRef<HTMLDivElement | null>(null)

  // Filtrar clientes por busca
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchCliente.toLowerCase()))
    )
  }, [searchCliente, clientes])

  const agendamentoPreview = useMemo<Agendamento | null>(() => {
    // Debug log para identificar campos faltando
    console.log('DEBUG Agendamento Preview State:', {
      cliente: !!clienteSelecionado,
      data: !!dataSelecionada,
      hora: !!horaSelecionada,
      produto: !!produtoSelecionado,
      emailCheck: clienteSelecionado?.email || !!emailTemporario
    })

    if (!clienteSelecionado || !dataSelecionada || !horaSelecionada || !produtoSelecionado) return null

    // Se o cliente não tem email, verificar se o email temporário foi preenchido
    if (!clienteSelecionado.email && !emailTemporario) return null

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
  }, [clienteSelecionado, dataSelecionada, horaSelecionada, produtoSelecionado, duracaoMinutos, emailTemporario])

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
    // Se for cliente (já tem lead), finaliza. Senão, vai para seleção de lead
    if (isClientView || preSelectedClient) {
      setPasso('confirmacao')
    } else {
      setPasso('cliente')
    }
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
    setDataSelecionada(undefined)
    setHoraSelecionada('')
    setPasso('produto')
  }

  const handleRemoverCliente = () => {
    setClienteSelecionado(null)
    setPasso('cliente')
    setMostrarListaClientes(false)
    setShowNovoCliente(false)
    setSearchCliente('')
    setEmailTemporario('')
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
    setPasso('calendario')
  }

  const handleSelecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setSearchCliente('')
    setMostrarListaClientes(false)
    setPasso('confirmacao')
  }

  const handleVoltar = () => {
    switch (passo) {
      case 'calendario':
        setPasso('produto')
        break
      case 'horario':
        setPasso('calendario')
        break
      case 'cliente':
        setPasso('horario')
        break
      case 'confirmacao':
        if (isClientView || preSelectedClient) {
          setPasso('horario')
        } else {
          setPasso('cliente')
        }
        break
      default:
        break
    }
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

    const emailFinal = agendamentoPreview.cliente.email || emailTemporario

    setAgendamentoPayload({
      nome: agendamentoPreview.cliente.nome,
      email: emailFinal,
      telefone: agendamentoPreview.cliente.telefone,
      data_hora: `${agendamentoPreview.data}T${agendamentoPreview.hora}:00`,
      produto_id: agendamentoPreview.produto.id,
      produto_nome: agendamentoPreview.produto.nome,
      valor: agendamentoPreview.produto.valor,
      isEuro: (agendamentoPreview.produto as any).isEuro,
      duracao_minutos: agendamentoPreview.duracaoMinutos,
      status: agendamentoPreview.status,
      usuario_id: activeProfile?.id,
      cliente_id: agendamentoPreview.cliente.id
    })

    console.log('========== AGENDAMENTO PAYLOAD DEBUG ==========')
    console.log('Payload que será enviado ao modal:', {
      usuario_id: activeProfile?.id,
      cliente_id: agendamentoPreview.cliente.id,
      cliente_id_source: agendamentoPreview.cliente.id ? 'Presente' : 'AUSENTE'
    })
    console.log('================================================')

    setShowConfirmacao(true)
  }

  const handleSuccessAgendamento = (responseData: any) => {
    setShowConfirmacao(false)
  
    
    // Tenta obter o link de várias formas possíveis para garantir compatibilidade
    // Prioridade máxima para o que vier no responseData direto ou dentro de .data
    const backendLink = 
      responseData.checkoutUrl || 
      responseData.data?.checkoutUrl || 
      responseData.paymentLink || 
      responseData.data?.paymentLink ||
      responseData.url ||
      responseData.data?.url;

    console.log('DEBUG COMERCIAL1: Link detectado (backendLink):', backendLink)

    // Garante que o link tenha protocolo se não for vazio
    let finalPaymentLink = backendLink || `https://FALLBACK-ERROR-${Date.now()}.com`
    if (backendLink && !backendLink.startsWith('http')) {
      finalPaymentLink = `https://${backendLink}`
    }
    console.log('DEBUG COMERCIAL1: Link final (finalPaymentLink):', finalPaymentLink)
  

    const resumoTexto = `Oi ${agendamentoPayload.nome}! Seu agendamento está marcado para ${agendamentoPreview?.data} às ${agendamentoPreview?.hora} (${agendamentoPayload.duracao_minutos} min) - ${agendamentoPayload.produto_nome}.`

    setAgendamentos([...agendamentos, agendamentoPreview!])

    if (isClientView) {
      console.log('Redirecionando cliente para:', finalPaymentLink)
      window.location.href = finalPaymentLink
    } else {
      setPaymentLink(finalPaymentLink)
      setShareMessage(`${resumoTexto} Link de pagamento: ${finalPaymentLink}`)
      setShowModalPagamento(true)
    }

    if (!isClientView) {
      setDataSelecionada(undefined)
      setHoraSelecionada('')
      setProdutoSelecionado(null)
      setClienteSelecionado(null)
      setDuracaoMinutos(60)
      setEmailTemporario('')
      setPasso('calendario')
    }
  }

  const handleCadastrarNovoCliente = async () => {
    if (!novoCliente.nome || !novoCliente.email || !novoCliente.telefone) {
      error('Preencha nome, e-mail e telefone.')
      return
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''

    // Se não houver backend, cria localmente
    if (!backendUrl) {
      console.warn('VITE_BACKEND_URL não configurado; criando lead localmente')
      const cliente: Cliente = {
        ...novoCliente,
        id: Date.now().toString(),
      }
      setClientes((prev) => [...prev, cliente])
      setClienteSelecionado(cliente)
      setShowNovoCliente(false)
      setMostrarListaClientes(false)
      setNovoCliente({ id: '', nome: '', email: '', telefone: '' })
      success('Lead cadastrado e selecionado.')
      setPasso('calendario')
      return
    }

    try {
      // POST para registrar o lead no backend
      const leadPayload = {
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
      }
      //Criar endpoint de cadastro de lead
      const response = await fetch(`${backendUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        console.error('Erro ao registrar lead no backend:', errorBody)
        error(errorBody?.message || 'Erro ao registrar lead')
        return
      }

      const leadData = await response.json()
      console.log('Lead registrado no backend:', leadData)

      // Cria o cliente localmente com ID retornado do backend
      const cliente: Cliente = {
        id: leadData.id || novoCliente.id || Date.now().toString(),
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
      }

      setClientes((prev) => [...prev, cliente])
      setClienteSelecionado(cliente)
      setShowNovoCliente(false)
      setMostrarListaClientes(false)
      setNovoCliente({ id: '', nome: '', email: '', telefone: '' })
      success('Lead cadastrado e selecionado.')
      setPasso('confirmacao')
    } catch (err) {
      console.error('Erro ao registrar lead:', err)
      error('Erro ao registrar lead. Tente novamente.')
    }
  }

  const mostrarFluxo = passo === 'produto' || passo === 'calendario' || (passo === 'horario' && dataSelecionada) || passo === 'cliente' || passo === 'confirmacao'

  return (
    <div className="w-full bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Agendamento de Vendas</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Escolha o produto, selecione data e horário, e finalize o agendamento</p>


      {/* Fluxo de agendamento: Produto → Data → Hora → Lead */}
      {mostrarFluxo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* PASSO 1: Seleção de Produto */}
            {passo === 'produto' && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selecione o Serviço</h3>
                {loadingProdutos ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 opacity-20" />
                    <p>Carregando catálogo de serviços...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {produtos.map((produto: any) => (
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
                            {produto.isEuro ? (
                              <>
                                <p className="text-xl font-bold text-emerald-600">€ {produto.valor.toFixed(2)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  (Aprox. R$ {(produto.valor * (exchangeRate || 6.27)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                </p>
                              </>
                            ) : (
                              <p className="text-xl font-bold text-emerald-600">R$ {produto.valor}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                    {produtos.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-30">
                        <Search className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-bold">Nenhum serviço disponível no catálogo.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PASSO 2: Seleção de Data */}
            {passo === 'calendario' && (
              <CalendarPicker
                onDateSelect={handleSelecionarData}
                selectedDate={dataSelecionada || undefined}
                disabledDates={[]}
                disablePastDates={true}
                minDate={(() => {
                  // Impede agendamento para o dia atual, apenas dia seguinte em diante
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  return tomorrow
                })()}
              />
            )}

            {/* PASSO 3: Seleção de Horário */}
            {passo === 'horario' && dataSelecionada && (
              <div className="mt-6 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selecione o Horário</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Escolha o início e a duração do atendimento</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isClientView ? (
                      <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-2 rounded-lg text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                        40 min
                      </div>
                    ) : (
                      [30, 60, 90].map((duracao) => (
                        <button
                          key={duracao}
                          onClick={() => setDuracaoMinutos(duracao)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${duracaoMinutos === duracao
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                            : 'bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-neutral-600 hover:border-emerald-400'}`}
                        >
                          {duracao} min
                        </button>
                      ))
                    )}
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
                  {(isClientView ? [
                    '08:00', '09:00', '10:00', '11:00',
                    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
                  ] : HORARIOS_DISPONIVEIS).map((hora) => {
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

            {/* PASSO 4: Seleção de Lead (apenas no módulo comercial) */}
            {passo === 'cliente' && !isClientView && !preSelectedClient && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Busque um lead ou cadastre um novo</p>
                  </div>
                  <button
                    onClick={() => setShowNovoCliente((v) => !v)}
                    className="px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition"
                  >
                    {showNovoCliente ? 'Cancelar cadastro' : 'Cadastrar novo lead'}
                  </button>
                </div>

                {/* Busca de lead */}
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
                      placeholder="Digite o nome ou email do lead..."
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
                      <p className="text-gray-500 dark:text-gray-400 text-center">Nenhum lead encontrado</p>
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
                      value={novoCliente.email || ''}
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
              </div>
            )}
          </div>

          <div className="lg:col-span-1 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm sticky top-8">
              
              {/* Header com Voltar e Título */}
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-neutral-800 pb-4">
                {passo !== 'produto' && (
                  <button
                    onClick={handleVoltar}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition-colors"
                    aria-label="Voltar etapa"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resumo</h3>
              </div>

              {/* Informações dos Envolvidos */}
              {(clienteSelecionado || activeProfile) && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-lg border border-gray-100 dark:border-neutral-800">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Agendado por</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {activeProfile?.full_name || 'Administrador'}
                    </p>
                    {activeProfile?.email && (
                      <p className="text-xs text-gray-500">{activeProfile.email}</p>
                    )}
                  </div>

                  {clienteSelecionado && (
                    <div className="pt-4 border-t border-gray-100 dark:border-neutral-700">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Lead</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{clienteSelecionado.nome}</p>
                      {clienteSelecionado.email ? (
                        <p className="text-xs text-gray-500">{clienteSelecionado.email}</p>
                      ) : (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            E-mail do Lead <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={emailTemporario}
                            onChange={(e) => setEmailTemporario(e.target.value)}
                            placeholder="email@exemplo.com"
                            className={`w-full px-3 py-1.5 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 ${!emailTemporario
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-neutral-600 focus:ring-emerald-500'
                              }`}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Produto */}
              {produtoSelecionado ? (
                <div className="mb-4 pb-4 border-b border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Produto</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{produtoSelecionado.nome}</p>

                    {(produtoSelecionado as any).isEuro ? (
                      <div className="mt-2">
                        <p className="text-2xl font-bold text-emerald-600">
                          € {produtoSelecionado.valor.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Aprox. R$ {(produtoSelecionado.valor * (exchangeRate || 6.27)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                          * Cotação estimada: €1 = R${(exchangeRate || 6.27).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-emerald-600 mt-2">
                        R$ {produtoSelecionado.valor}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleRemoverProduto}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    aria-label="Alterar produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mb-4 pb-4 border-b border-dashed border-gray-200 dark:border-neutral-700">
                   <p className="text-xs text-gray-400 mb-1 italic">Produto não selecionado</p>
                   <button onClick={() => setPasso('produto')} className="text-xs text-blue-500 hover:underline">Selecionar agora</button>
                </div>
              )}

              {/* Data */}
              {dataSelecionada && (
                <div className="mb-4 pb-4 border-b border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Data</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {dataSelecionada.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoverData}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    aria-label="Alterar data"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Hora */}
              {horaSelecionada && (
                <div className="mb-4 pb-4 border-b border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Horário</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {horaSelecionada} - {calcularHoraFim(horaSelecionada, duracaoMinutos)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Duração: {duracaoMinutos} min</p>
                  </div>
                  <button
                    onClick={handleRemoverHora}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    aria-label="Alterar horário"
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
                  {!clienteSelecionado ? 'Incompleto: Selecione o Lead' : 
                   !produtoSelecionado ? 'Incompleto: Selecione o Produto' :
                   !dataSelecionada ? 'Incompleto: Selecione a Data' :
                   !horaSelecionada ? 'Incompleto: Selecione o Horário' :
                   (!clienteSelecionado.email && !emailTemporario) ? 'Incompleto: Informe o E-mail' :
                   'Criar agendamento'}
                </button>
                {!agendamentoPreview && (
                  <div className="text-xs text-red-500 font-medium text-center mt-2 space-y-1">
                    {!produtoSelecionado && <p>• Selecione um Produto na primeira etapa</p>}
                    {!dataSelecionada && <p>• Escolha uma data no calendário</p>}
                    {!horaSelecionada && <p>• Escolha um horário disponível</p>}
                    {!clienteSelecionado && <p>• Identifique o Lead (Cliente)</p>}
                    {clienteSelecionado && !clienteSelecionado.email && !emailTemporario && <p>• O lead selecionado não possui e-mail cadastrado</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
            
            {/* Header com Voltar e Título */}
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-neutral-800 pb-4">
              <button
                onClick={handleVoltar}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition-colors"
                aria-label="Voltar etapa"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resumo</h3>
            </div>

            {/* Informações dos Envolvidos */}
            {(clienteSelecionado || activeProfile) && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-lg border border-gray-100 dark:border-neutral-800">
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Agendado por</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {activeProfile?.full_name || 'Administrador'}
                  </p>
                  {activeProfile?.email && (
                    <p className="text-xs text-gray-500">{activeProfile.email}</p>
                  )}
                </div>

                {clienteSelecionado && (
                  <div className="pt-4 border-t border-gray-100 dark:border-neutral-700">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Lead</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{clienteSelecionado.nome}</p>
                    {clienteSelecionado.email && (
                      <p className="text-xs text-gray-500">{clienteSelecionado.email}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Produto */}
            {produtoSelecionado && (
              <div className="mb-4 pb-4 border-b border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Produto</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{produtoSelecionado.nome}</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">
                    R$ {produtoSelecionado.valor}
                  </p>
                </div>
                <button
                  onClick={handleRemoverProduto}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                  aria-label="Alterar produto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Data */}
            {dataSelecionada && (
              <div className="mb-4 pb-4 border-b border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Data</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dataSelecionada.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={handleRemoverData}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                  aria-label="Alterar data"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Hora */}
            {horaSelecionada && (
              <div className="mb-4 pb-4 border-b border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Horário</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {horaSelecionada} - {calcularHoraFim(horaSelecionada, duracaoMinutos)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Duração: {duracaoMinutos} min</p>
                </div>
                <button
                  onClick={handleRemoverHora}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                  aria-label="Alterar horário"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleFinalizarAgendamento}
                disabled={!agendamentoPreview}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${agendamentoPreview
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
              >
                <Check className="h-5 w-5" />
                {!clienteSelecionado ? 'Incompleto: Selecione o Lead' : 
                 !produtoSelecionado ? 'Incompleto: Selecione o Produto' :
                 !dataSelecionada ? 'Incompleto: Selecione a Data' :
                 !horaSelecionada ? 'Incompleto: Selecione o Horário' :
                 (!clienteSelecionado.email && !emailTemporario) ? 'Incompleto: Informe o E-mail' :
                 'Criar agendamento'}
              </button>
              {!agendamentoPreview && (
                <div className="text-xs text-red-500 font-medium text-center mt-3 space-y-1">
                  {!produtoSelecionado && <p>• Selecione um Produto</p>}
                  {!dataSelecionada && <p>• Escolha uma data</p>}
                  {!horaSelecionada && <p>• Escolha um horário</p>}
                  {!clienteSelecionado && <p>• Identifique o Lead (Cliente)</p>}
                  {clienteSelecionado && !clienteSelecionado.email && !emailTemporario && <p>• Informe o e-mail do lead</p>}
                </div>
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
                  onClick={() => navigator.share({ text: shareMessage, url: paymentLink }).catch(() => { })}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Compartilhar (nativo)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmacao && agendamentoPayload && (
        <AgendamentoConfirmacaoModal
          isOpen={showConfirmacao}
          onClose={() => setShowConfirmacao(false)}
          onSuccess={handleSuccessAgendamento}
          onError={(msg) => error(msg)}
          payload={agendamentoPayload}
          exchangeRate={exchangeRate}
        />
      )}
      </div>
    </div>
  )
}

