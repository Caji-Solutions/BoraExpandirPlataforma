import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Clock, ShoppingCart, Check, ChevronLeft, ChevronRight, Search, X, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
// import { useToast } from '../../components/Toast'
// Update the import path below if Toast is located elsewhere:
import { useToast } from '@/components/ui/Toast'
import { SUCESSO, ERRO, AVISO } from '../../components/MockFrases'
import { CalendarPicker } from '@/components/ui/CalendarPicker'
import { AgendamentoConfirmacaoModal } from '../../components/AgendamentoConfirmacaoModal'
import { useAuth } from '../../../../contexts/AuthContext'
import { catalogService, Service } from '../../../adm/services/catalogService'
import comercialService from '../../services/comercialService'
import { useLocation } from 'react-router-dom'
import juridicoService from '../../../juridico/services/juridicoService'
import { parseBackendDate } from '../../../../utils/dateUtils'

/**
 * Converte string de duração do catálogo (ex: "1 horas", "30 minutos") para minutos.
 * Suporta: minutos, horas. Demais unidades retornam o valor numérico bruto.
 */
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0
  const parts = duration.trim().split(/\s+/)
  const value = parseInt(parts[0]) || 0
  const unit = (parts[1] || '').toLowerCase()

  switch (unit) {
    case 'minuto':
    case 'minutos':
      return value
    case 'hora':
    case 'horas':
      return value * 60
    default:
      // Se não tiver unidade reconhecida, assume minutos
      return value
  }
}

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
  duracaoMinutos?: number
  requiresLegalDelegation: boolean
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
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
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
  const navigate = useNavigate()
  const location = useLocation()
  const navigationState = location.state as { preSelectedClient?: Cliente, preSelectedProduto?: string, step?: 'produto' | 'data_hora' | 'cliente', paid?: boolean } | undefined
  const isPaidFromContrato = navigationState?.paid === true

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [usuariosSistema, setUsuariosSistema] = useState<any[]>([])

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoadingProdutos(true)
        // Fetch Clientes, Produtos e Usuarios do sistema em paralelo
        const [clientesData, produtosData, usuariosData] = await Promise.all([
          comercialService.getAllClientes(),
          catalogService.getCatalogServices(),
          juridicoService.getFuncionariosJuridico().catch(() => [])
        ])

        setUsuariosSistema(Array.isArray(usuariosData) ? usuariosData : [])

        // Map Clientes
        const mappedClientes = clientesData.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          email: c.email || null,
          telefone: c.telefone
        }))
        setClientes(mappedClientes)

        // Map Produtos (Services) transformando para a interface Produto
        // Se for visualização do cliente (isClientView), filtrar APENAS por showToClient
        // Se for visualização administrativa, filtrar por showInCommercial
        const mappedProdutos = produtosData
          .filter((s: Service) => {
            const tipo = s.type || 'agendavel'
            if (tipo !== 'agendavel') return false
            if (isClientView) {
              return s.showToClient
            }
            return s.showInCommercial
          })
          .map((s: Service) => ({
            id: s.id,
            nome: s.name,
            descricao: s.documents?.length
              ? `Requer ${s.documents.length} documentos. Duração: ${s.duration}`
              : `Duração estimada: ${s.duration}`,
            valor: Number(s.value),
            show: s.showInCommercial,
            isEuro: true, // No catálogo atual os valores são em Euro
            duracaoMinutos: parseDurationToMinutes(s.duration) || 60,
            requiresLegalDelegation: s.requiresLegalDelegation
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
          console.error("Erro ao buscar cotacao", err)
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
  const [showEmailPopup, setShowEmailPopup] = useState(false)

  // Novo fluxo: Produto -> Cliente -> Data/Hora (ou Produto -> Data/Hora se for cliente)
  const [passo, setPasso] = useState<
    'produto' | 'data_hora' | 'cliente'
  >(navigationState?.step || 'produto')

  const { id: editId } = useParams<{ id: string }>()
  const [loadingEdit, setLoadingEdit] = useState(false)
  const preselectedProdutoHandledRef = useRef(false)

  useEffect(() => {
    preselectedProdutoHandledRef.current = false
  }, [navigationState?.preSelectedProduto])

  // Carregar dados para edição se ID estiver presente
  useEffect(() => {
    if (!editId || produtos.length === 0) return

    async function carregarAgendamento() {
      setLoadingEdit(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comercial/agendamento/${editId}`)
        if (response.ok) {
          const ag = await response.json()

          // Preencher Data e Hora
          if (ag.data_hora) {
            const dt = parseBackendDate(ag.data_hora)
            // Agora garantimos o local time direto pelo dateUtils
            setDataSelecionada(dt)
            setHoraSelecionada(ag.data_hora.includes('T') ? ag.data_hora.split('T')[1].substring(0, 5) : '')
          }

          // Preencher Produto (do catálogo carregado)
          if (ag.produto_id) {
            const pEncontrado = produtos.find(p => p.id === ag.produto_id)
            if (pEncontrado) setProdutoSelecionado(pEncontrado)
          }

          // Preencher Cliente (da lista de clientes carregada via props)
          if (ag.cliente_id) {
            const cEncontrado = clientes.find(c => c.id === ag.cliente_id)
            if (cEncontrado) {
              setClienteSelecionado(cEncontrado)
            } else if (ag.nome) { // Fallback se não estiver na lista de props
              setClienteSelecionado({
                id: ag.cliente_id,
                nome: ag.nome,
                email: ag.email,
                telefone: ag.telefone || ''
              })
            }
          } else if (ag.nome) { // Caso seja lead sem ID fixo
            setClienteSelecionado({
              id: 'lead_temporario',
              nome: ag.nome,
              email: ag.email,
              telefone: ag.telefone || ''
            })
          }

        }
      } catch (err) {
        console.error('Erro ao carregar agendamento para edicao', err)
      } finally {
        setLoadingEdit(false)
      }
    }

    carregarAgendamento()
  }, [editId, produtos, clientes])

  // Initialize with location state or props if provided
  useEffect(() => {
    if (navigationState?.preSelectedClient) {
      setClienteSelecionado(navigationState.preSelectedClient)
      if (navigationState?.preSelectedClient.email && !navigationState.preSelectedClient.email.includes('lead_')) {
        setEmailTemporario(navigationState.preSelectedClient.email)
      }
    } else if (preSelectedClient) {
      setClienteSelecionado(preSelectedClient as Cliente)
      // Se não vier via state.step de dentro, vai para produto
      if (!navigationState?.step) setPasso('produto')
    }

    if (navigationState?.preSelectedProduto && produtos.length > 0 && !preselectedProdutoHandledRef.current) {
      preselectedProdutoHandledRef.current = true
      const preSelectedValue = String(navigationState.preSelectedProduto).trim()
      const normalizedPreSelected = preSelectedValue.toLowerCase()

      const pEncontrado = produtos.find((p) => {
        const nomeProduto = String(p.nome || '').trim().toLowerCase()
        return p.id === preSelectedValue || p.nome === preSelectedValue || nomeProduto === normalizedPreSelected
      })

      if (pEncontrado) {
        setProdutoSelecionado(pEncontrado)
        setDuracaoMinutos(pEncontrado.duracaoMinutos || 60)
      } else if (navigationState?.step === 'data_hora') {
        setPasso('produto')
        error('Nao encontramos o servico para este agendamento. Selecione o produto para continuar.')
      }
    }
  }, [preSelectedClient, navigationState, produtos, error])

  const [searchCliente, setSearchCliente] = useState('')
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false)
  const [agendamentosDia, setAgendamentosDia] = useState<any[]>([])
  const [dataSelecionadaIso, setDataSelecionadaIso] = useState<string>('')
  const [showNovoCliente, setShowNovoCliente] = useState(false)
  const [showModalPagamento, setShowModalPagamento] = useState(false)
  const [paymentLink, setPaymentLink] = useState('')
  const [shareMessage, setShareMessage] = useState('')

  // Paginação de Leads
  const [paginaLeads, setPaginaLeads] = useState(1)
  const leadsPorPagina = 8 // 2 colunas x 4 linhas

  const [novoCliente, setNovoCliente] = useState<Cliente>({
    id: '',
    nome: '',
    email: '',
    telefone: '',
  })
  const [showConfirmacao, setShowConfirmacao] = useState(false)
  const [agendamentoPayload, setAgendamentoPayload] = useState<any>(null)
  const clienteSelectorRef = useRef<HTMLDivElement | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Popup de conflito ao clicar num horário indisponível
  const [conflictPopup, setConflictPopup] = useState<{ agendamento: any, horasOcupadas: string[], x: number, y: number } | null>(null)

  // Calcula quais slots estão diretamente ocupados por um agendamento
  function getDirectlyOccupiedSlots(ag: any, allSlots: string[], dateIso: string): string[] {
    const inicio = parseBackendDate(ag.data_hora)
    const fim = new Date(inicio.getTime() + (ag.duracao_minutos || 60) * 60000)
    return allSlots.filter(hora => {
      const slotTime = new Date(`${dateIso}T${hora}:00`)
      return slotTime >= inicio && slotTime < fim
    })
  }


  // Filtrar clientes por busca
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchCliente.toLowerCase())) ||
        (cliente.telefone && cliente.telefone.includes(searchCliente))
    )
  }, [searchCliente, clientes])

  // Paginação dos clientes filtrados
  const clientesPaginados = useMemo(() => {
    const inicio = (paginaLeads - 1) * leadsPorPagina
    return clientesFiltrados.slice(inicio, inicio + leadsPorPagina)
  }, [clientesFiltrados, paginaLeads])

  const totalPaginasLeads = Math.ceil(clientesFiltrados.length / leadsPorPagina)

  useEffect(() => {
    setPaginaLeads(1)
  }, [searchCliente])

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

    const dataIso = dataSelecionada.toISOString().split('T')[0]
    return {
      id: Date.now().toString(),
      data: dataIso,
      hora: horaSelecionada,
      produto: produtoSelecionado,
      cliente: clienteSelecionado,
      duracaoMinutos,
      status: isPaidFromContrato ? 'confirmado' : 'agendado',
    }
  }, [clienteSelecionado, dataSelecionada, horaSelecionada, produtoSelecionado, duracaoMinutos, emailTemporario, isPaidFromContrato])

  // Fechar a lista de clientes ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Fecha lista de clientes
      if (clienteSelectorRef.current && !clienteSelectorRef.current.contains(event.target as Node)) {
        setMostrarListaClientes(false)
      }

      // Fecha popup de conflito
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setConflictPopup(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // Ref para auto-scroll aos horários
  const horariosRef = useRef<HTMLDivElement | null>(null)

  const handleSelecionarData = (data: Date) => {
    setDataSelecionada(data)
    setHoraSelecionada('')
    setConflictPopup(null)
    const dataIso = data.toISOString().split('T')[0]
    setDataSelecionadaIso(dataIso)
    carregarAgendamentosDoDia(dataIso)

    // Auto-scroll aos horários após breve render cycle
    setTimeout(() => {
      horariosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleSelecionarHora = (hora: string) => {
    setHoraSelecionada(hora)
    setConflictPopup(null)
    // O avanço de etapa agora é controlado pelo botão "Próximo"
  }

  const handleRemoverData = () => {
    setDataSelecionada(undefined)
    setHoraSelecionada('')
  }

  const handleRemoverHora = () => {
    setHoraSelecionada('')
  }

  const handleRemoverProduto = () => {
    setProdutoSelecionado(null)
    setDataSelecionada(undefined)
    setHoraSelecionada('')
  }

  const handleRemoverCliente = () => {
    setClienteSelecionado(null)
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
    setDuracaoMinutos(produto.duracaoMinutos || 60)
    // O avanço de etapa agora é controlado pelo botão "Próximo"
  }

  const handleSelecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setSearchCliente('')
    setMostrarListaClientes(false)
    // Preencher email temporário se o lead já tiver email real
    if (cliente.email && !cliente.email.includes('lead_')) {
      setEmailTemporario(cliente.email)
    } else {
      setEmailTemporario('')
    }
  }

  const handleProxPasso = () => {
    switch (passo) {
      case 'produto':
        if (produtoSelecionado) {
          if (isClientView) {
            setPasso('data_hora')
          } else {
            setPasso('cliente')
          }
        }
        break
      case 'cliente':
        if (clienteSelecionado) {
          const temEmailReal = emailTemporario || (clienteSelecionado.email && !clienteSelecionado.email.includes('lead_'))
          if (!temEmailReal) {
            setShowEmailPopup(true)
          } else {
            setPasso('data_hora')
          }
        }
        break
      case 'data_hora':
        if (!dataSelecionada || !horaSelecionada) {
          error('Selecione data e horario para continuar.')
          return
        }

        if (!agendamentoPreview) {
          if (!produtoSelecionado) {
            setPasso('produto')
            error('Selecione o produto para finalizar o agendamento.')
            return
          }

          if (!isClientView && !clienteSelecionado) {
            setPasso('cliente')
            error('Selecione o cliente para finalizar o agendamento.')
            return
          }

          error('Nao foi possivel montar o agendamento. Revise os dados e tente novamente.')
          return
        }

        handleFinalizarAgendamento()
        break
      default:
        break
    }
  }

  const handleVoltar = () => {
    switch (passo) {
      case 'cliente':
        setPasso('produto')
        break
      case 'data_hora':
        if (isClientView) {
          setPasso('produto')
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
      console.error('VITE_BACKEND_URL nao configurado; nao foi possivel buscar disponibilidade')
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

    const inicioNovo = new Date(`${dataSelecionadaIso}T${hora}:00`)
    const fimNovo = new Date(inicioNovo.getTime() + duracaoMinutos * 60000)

    return agendamentosDia.every((agendamento) => {
      const inicioExistente = parseBackendDate(agendamento.data_hora)
      const duracaoExistente = agendamento.duracao_minutos || 60
      const fimExistente = new Date(inicioExistente.getTime() + duracaoExistente * 60000)

      const sobrepoe = inicioExistente < fimNovo && inicioNovo < fimExistente
      return !sobrepoe
    })
  }

  const handleUnavailableSlotClick = (e: React.MouseEvent, hora: string) => {
    if (!dataSelecionadaIso) return

    const rect = e.currentTarget.getBoundingClientRect()
    const parentRect = e.currentTarget.closest('.relative')?.getBoundingClientRect()

    // Calcular posição relativa ao container .relative
    const x = rect.left - (parentRect?.left || 0) + rect.width / 2
    const y = rect.top - (parentRect?.top || 0) + rect.height + 10

    const inicioNovo = new Date(`${dataSelecionadaIso}T${hora}:00`)
    const fimNovo = new Date(inicioNovo.getTime() + duracaoMinutos * 60000)

    const conflito = agendamentosDia.find((agendamento) => {
      const inicioExistente = parseBackendDate(agendamento.data_hora)
      const duracaoExistente = agendamento.duracao_minutos || 60
      const fimExistente = new Date(inicioExistente.getTime() + duracaoExistente * 60000)

      return inicioExistente < fimNovo && inicioNovo < fimExistente
    })

    if (conflito) {
      const horasOcupadas = getDirectlyOccupiedSlots(
        conflito,
        isClientView ? ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] : HORARIOS_DISPONIVEIS,
        dataSelecionadaIso
      )
      setConflictPopup({ agendamento: conflito, horasOcupadas, x, y })
    }
  }

  const handleFinalizarAgendamento = async () => {
    if (!agendamentoPreview) {
      error('Nao foi possivel finalizar o agendamento. Revise os dados e tente novamente.')
      return
    }

    const emailFinal = emailTemporario || (agendamentoPreview.cliente.email && !agendamentoPreview.cliente.email.includes('lead_') ? agendamentoPreview.cliente.email : '');

    const payload = {
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
      pagamento_status: isPaidFromContrato ? 'aprovado' : undefined,
      usuario_id: activeProfile?.id,
      cliente_id: agendamentoPreview.cliente.id,
      requer_delegacao: agendamentoPreview.produto.requiresLegalDelegation,
      id: editId || undefined
    }

    setAgendamentoPayload(payload)

    console.log('DEBUG AGENDAMENTO: Iniciando processo de finalizacao. Payload gerado:', {
      nome: agendamentoPreview.cliente.nome,
      email: emailFinal,
      telefone: agendamentoPreview.cliente.telefone,
      data_hora: `${agendamentoPreview.data}T${agendamentoPreview.hora}:00`,
      produto_nome: agendamentoPreview.produto.nome,
      valor: agendamentoPreview.produto.valor,
      usuario_id: activeProfile?.id,
      cliente_id: agendamentoPreview.cliente.id
    })

    if (isPaidFromContrato) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
      if (!backendUrl) {
        error('Backend não configurado para criar agendamento.')
        return
      }
      try {
        const response = await fetch(`${backendUrl}/comercial/agendamento`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (response.status === 409) {
          const body = await response.json().catch(() => ({}))
          error(body?.message || 'Este horário não está mais disponível.')
          return
        }

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          error(body?.message || 'Não foi possível criar o agendamento.')
          return
        }

        const responseData = await response.json()
        handleSuccessAgendamento(responseData)
        return
      } catch (err) {
        console.error('Erro ao criar agendamento pago:', err)
        error('Erro ao criar agendamento.')
        return
      }
    }

    setShowConfirmacao(true)
  }

  const handleSuccessAgendamento = (responseData: any) => {
    setShowConfirmacao(false)
    console.log('DEBUG AGENDAMENTO: Sucesso. Response data:', responseData)
    success('Agendamento criado com sucesso!')
    navigate('/comercial/meus-agendamentos', { replace: true })
  }

  const handleCadastrarNovoCliente = async () => {
    if (!novoCliente.nome || !novoCliente.email || !novoCliente.telefone) {
      error('Preencha nome, e-mail e telefone.')
      return
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''

    // Se não houver backend, cria localmente
    if (!backendUrl) {
      console.warn('VITE_BACKEND_URL nao configurado; criando lead localmente')
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
      // O avanço de etapa agora é controlado pelo botão "Próximo"
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

      // Abre popup para garantir e-mail válido também em novos cadastros
      if (cliente.email && !cliente.email.includes('lead_')) {
        setEmailTemporario(cliente.email)
      } else {
        setEmailTemporario('')
      }
      success('Lead cadastrado. Pronto para concluir agendamento.')
    } catch (err) {
      console.error('Erro ao registrar lead:', err)
      error('Erro ao registrar lead. Tente novamente.')
    }
  }

  // Componente Reutilizável de Botões de Navegação
  const BotoesNavegacao = ({ canNext = false }: { canNext?: boolean }) => (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800">
      {passo !== 'produto' ? (
        <button
          onClick={handleVoltar}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-600 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
      ) : (
        <div /> // Espaçador
      )}
      <button
        onClick={handleProxPasso}
        disabled={!canNext}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition ${canNext
          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
          : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
          }`}
      >
        Próximo
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <div className="w-full bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Agendamento de Vendas</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Escolha o produto, identifique o lead e agende horário para finalizar</p>


        {/* Fluxo de agendamento: Produto → Lead → Data e Hora (ou apenas Produto → Data/Hora se for cliente) */}
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
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm'
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
                <BotoesNavegacao canNext={!!produtoSelecionado} />
              </div>
            )}

            {/* PASSO 2: Seleção de Data e Hora */}
            {passo === 'data_hora' && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Escolha a Data e Horário</h3>
                  <CalendarPicker
                    onDateSelect={handleSelecionarData}
                    selectedDate={dataSelecionada || undefined}
                    disabledDates={[]}
                    disablePastDates={true}
                    disableWeekends={true}
                    minDate={(() => {
                      // Impede agendamento para o dia atual, apenas dia seguinte em diante
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      tomorrow.setHours(0, 0, 0, 0)
                      return tomorrow
                    })()}
                  />
                </div>

                {dataSelecionada && (
                  <div ref={horariosRef} className="pt-6 mt-6 border-t border-gray-100 dark:border-neutral-700 scroll-mt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Horários em {dataSelecionada.toLocaleDateString()}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Escolha o início e a duração do atendimento</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-2 rounded-lg text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                          {duracaoMinutos} min
                        </div>
                      </div>
                    </div>

                    {horaSelecionada && (
                      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">
                          Agendamento das {horaSelecionada} às {calcularHoraFim(horaSelecionada, duracaoMinutos)}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-h-[200px]">
                      {(isClientView ? [
                        '08:00', '09:00', '10:00', '11:00',
                        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
                      ] : HORARIOS_DISPONIVEIS).map((hora) => {
                        const disponivel = isHorarioDisponivel(hora)
                        const isDirectlyOccupied = conflictPopup?.horasOcupadas.includes(hora)
                        return (
                          <button
                            key={hora}
                            onClick={(e) => disponivel ? handleSelecionarHora(hora) : handleUnavailableSlotClick(e, hora)}
                            className={`py-3 px-4 rounded-lg font-medium transition-all ${!disponivel
                              ? isDirectlyOccupied
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-2 border-red-400 dark:border-red-500 cursor-pointer ring-2 ring-red-300/50 dark:ring-red-500/30'
                                : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 border border-gray-200 dark:border-neutral-700 cursor-pointer opacity-60'
                              : horaSelecionada === hora
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border-emerald-600'
                                : 'bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 hover:border-emerald-500 hover:text-emerald-700 border border-gray-300 dark:border-neutral-600'}`}
                          >
                            <Clock className="h-4 w-4 inline mr-2 opacity-70" />
                            {hora}
                          </button>
                        )
                      })}
                    </div>

                    {/* Popup de Conflito */}
                    {conflictPopup && (
                      <div
                        ref={popupRef}
                        className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="bg-white/80 dark:bg-neutral-800/80 rounded-xl border-2 border-red-300 dark:border-red-700 shadow-2xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                              <AlertCircle className="w-5 h-5" />
                              Horário Ocupado
                            </div>
                            <button
                              onClick={() => setConflictPopup(null)}
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Cliente</span>
                              <p className="font-medium text-gray-900 dark:text-white">{conflictPopup.agendamento.nome || '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">E-mail</span>
                              <p className="font-medium text-gray-900 dark:text-white truncate">{conflictPopup.agendamento.email || '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Telefone</span>
                              <p className="font-medium text-gray-900 dark:text-white">{conflictPopup.agendamento.telefone || '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Status</span>
                              <p className="font-medium text-gray-900 dark:text-white capitalize">{conflictPopup.agendamento.status || '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Horário</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {(() => { try { const dt = new Date(conflictPopup.agendamento.data_hora); return `${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` } catch { return conflictPopup.agendamento.data_hora } })()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Duração</span>
                              <p className="font-medium text-gray-900 dark:text-white">{conflictPopup.agendamento.duracao_minutos || 60} min</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Produto</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {conflictPopup.agendamento.produto_nome || 
                                 produtos.find(p => p.id === conflictPopup.agendamento.produto_id)?.nome || 
                                 conflictPopup.agendamento.produto_id || '—'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Pagamento</span>
                              <p className="font-medium text-gray-900 dark:text-white capitalize">{conflictPopup.agendamento.metodo_pagamento || '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Valor</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {conflictPopup.agendamento.valor ? `R$ ${Number(conflictPopup.agendamento.valor).toFixed(2)}` : '—'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Criado por</span>
                              <p className="font-medium text-gray-900 dark:text-white truncate text-xs">
                                {(() => {
                                  const uid = conflictPopup.agendamento.usuario_id
                                  if (!uid) return '—'
                                  const user = usuariosSistema.find((u: any) => u.id === uid)
                                  if (user) return user.full_name
                                  if (activeProfile?.id === uid) return activeProfile?.full_name || 'Você'
                                  return 'Não identificado'
                                })()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
                            <p className="text-xs text-red-500 dark:text-red-400">
                              Slots ocupados: <strong>{conflictPopup.horasOcupadas.join(', ')}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <BotoesNavegacao canNext={!!dataSelecionada && !!horaSelecionada && !!agendamentoPreview} />
              </div>
            )}

            {/* PASSO 4: Seleção de Lead (apenas no módulo comercial) */}
            {passo === 'cliente' && !isClientView && !preSelectedClient && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Busque um lead</p>
                  </div>
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
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="Digite o nome, email ou telefone do lead..."
                    />
                  </div>

                  <div>
                    {clienteSelecionado && (
                      <div className="mt-4 border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-5 relative overflow-hidden flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-xl">
                            {clienteSelecionado.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{clienteSelecionado.nome}</div>
                            <div className="text-gray-500 dark:text-gray-400">{clienteSelecionado.email || 'Sem e-mail'}</div>
                            <div className="text-sm text-gray-400 dark:text-neutral-500 mt-1">{clienteSelecionado.telefone}</div>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoverCliente}
                          className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition"
                          title="Remover esse lead"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    <div className={`mt-4 grid gap-3 pr-2 pb-2 ${!clienteSelecionado ? 'min-h-[360px]' : ''} ${clientesPaginados.length === 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-start content-start' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {clientesPaginados.length > 0 ? (
                        clientesPaginados.map((cliente) => (
                          <button
                            key={cliente.id}
                            onClick={() => handleSelecionarCliente(cliente)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${clienteSelecionado?.id === cliente.id
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                              : 'border-transparent bg-gray-50 dark:bg-neutral-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-white dark:hover:bg-neutral-700'
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-lg">
                                {cliente.nome.charAt(0).toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{cliente.nome}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{cliente.email || 'Sem e-mail'}</div>
                                <div className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{cliente.telefone}</div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        searchCliente ? (
                          <div className="col-span-1 border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-xl p-8 text-center sm:col-span-2 flex flex-col items-center justify-center h-[200px]">
                            <p className="text-gray-500 dark:text-gray-400 font-medium pb-2">Nenhum lead encontrado com esse dado.</p>
                          </div>
                        ) : (
                          <div className="col-span-1 border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-xl p-8 text-center sm:col-span-2 flex flex-col items-center justify-center h-[200px]">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Você ainda não tem leads na plataforma.</p>
                          </div>
                        )
                      )}
                    </div>

                    {/* Controles de Paginação */}
                    {totalPaginasLeads > 1 && (
                      <div className="flex items-center justify-between mt-4 py-2 border-t border-gray-100 dark:border-neutral-800">
                        <button
                          onClick={() => setPaginaLeads(p => Math.max(1, p - 1))}
                          disabled={paginaLeads === 1}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-neutral-800 transition text-sm font-medium flex items-center gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" /> Anterior
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Página {paginaLeads} de {totalPaginasLeads}
                        </span>
                        <button
                          onClick={() => setPaginaLeads(p => Math.min(totalPaginasLeads, p + 1))}
                          disabled={paginaLeads === totalPaginasLeads}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-neutral-800 transition text-sm font-medium flex items-center gap-1"
                        >
                          Próxima <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>


                <BotoesNavegacao canNext={!!clienteSelecionado} />
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
                    {activeProfile?.telefone && (
                      <p className="text-xs text-gray-500">{activeProfile.telefone}</p>
                    )}
                  </div>

                  {clienteSelecionado && (
                    <div className="pt-4 border-t border-gray-100 dark:border-neutral-700">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Lead</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{clienteSelecionado.nome}</p>
                      {emailTemporario && (
                        <p className="text-xs text-gray-500">{emailTemporario}</p>
                      )}
                      {clienteSelecionado.telefone && (
                        <p className="text-xs text-gray-500">{clienteSelecionado.telefone}</p>
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


              <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
                {!agendamentoPreview ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 block">Próximos Passos</p>
                    <ul className="space-y-3">
                      <li className={`flex items-center gap-3 text-sm ${produtoSelecionado ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${produtoSelecionado ? 'bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30' : 'bg-gray-100 border-gray-200 dark:bg-neutral-800 dark:border-neutral-700'}`}>
                          {produtoSelecionado ? <Check className="h-3 w-3" /> : '1'}
                        </div>
                        Escolher Produto
                      </li>
                      {!isClientView && (
                        <li className={`flex items-center gap-3 text-sm ${(clienteSelecionado && (clienteSelecionado.email || emailTemporario)) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${(clienteSelecionado && (clienteSelecionado.email || emailTemporario)) ? 'bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30' : 'bg-gray-100 border-gray-200 dark:bg-neutral-800 dark:border-neutral-700'}`}>
                            {(clienteSelecionado && (clienteSelecionado.email || emailTemporario)) ? <Check className="h-3 w-3" /> : '2'}
                          </div>
                          Identificar o Lead
                        </li>
                      )}
                      <li className={`flex items-center gap-3 text-sm ${(dataSelecionada && horaSelecionada) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${(dataSelecionada && horaSelecionada) ? 'bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30' : 'bg-gray-100 border-gray-200 dark:bg-neutral-800 dark:border-neutral-700'}`}>
                          {(dataSelecionada && horaSelecionada) ? <Check className="h-3 w-3" /> : isClientView ? '2' : '3'}
                        </div>
                        Definir Data e Horário
                      </li>
                      <li className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="h-5 w-5 rounded-full flex items-center justify-center border bg-gray-100 border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
                          {isClientView ? '3' : '4'}
                        </div>
                        Confirmação
                      </li>
                    </ul>
                  </div>
                ) : (
                  <button
                    onClick={handleProxPasso}
                    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
                  >
                    <Check className="h-5 w-5" />
                    Criar Agendamento
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

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

        {/* Popup de E-mail do Lead */}
        {
          showEmailPopup && clienteSelecionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
              <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  E-mail do Lead
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Informe o e-mail de <span className="font-semibold text-gray-700 dark:text-gray-200">{clienteSelecionado.nome}</span> para prosseguir com o agendamento.
                </p>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailTemporario}
                    onChange={e => setEmailTemporario(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter' && emailTemporario.trim()) {
                        setShowEmailPopup(false)
                        setPasso('data_hora')
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowEmailPopup(false)
                      handleRemoverCliente()
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (!emailTemporario.trim()) {
                        error('Informe o e-mail do lead.')
                        return
                      }
                      setShowEmailPopup(false)
                      setPasso('data_hora')
                    }}
                    disabled={!emailTemporario.trim()}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {showConfirmacao && agendamentoPayload && (
          <AgendamentoConfirmacaoModal
            isOpen={showConfirmacao}
            onClose={() => setShowConfirmacao(false)}
            onSuccess={handleSuccessAgendamento}
            onError={(msg) => error(msg)}
            onNavigateToAgendamentos={() => {
              setShowConfirmacao(false)
              success('Agendamento criado com sucesso!')
              navigate('/comercial/meus-agendamentos', { replace: true })
            }}
            payload={agendamentoPayload}
            exchangeRate={exchangeRate}
          />
        )}
      </div>
    </div >
  )
}
