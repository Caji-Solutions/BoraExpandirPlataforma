import React, { useState } from 'react'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  Bell,
  X,
  ChevronRight,
  FileWarning,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

// Interface e dados de notificações
interface Notificacao {
  id: string
  tipo: 'vencido' | 'urgente' | 'aviso' | 'info'
  titulo: string
  descricao: string
  valor?: number
  data: string
  lida: boolean
}

const mockNotificacoes: Notificacao[] = [
  {
    id: '1',
    tipo: 'vencido',
    titulo: 'Encontros Vencidos',
    descricao: '3 pagamentos de clientes estão vencidos há mais de 30 dias',
    valor: 24000,
    data: '2026-01-07',
    lida: false,
  },
  {
    id: '2',
    tipo: 'urgente',
    titulo: 'Comissões Pendentes',
    descricao: 'Existem comissões aguardando aprovação para pagamento',
    valor: 8750,
    data: '2026-01-06',
    lida: false,
  },
  {
    id: '3',
    tipo: 'vencido',
    titulo: 'Fatura Vencida - Empresa ABC',
    descricao: 'Fatura #2024-0892 vencida há 15 dias',
    valor: 5500,
    data: '2026-01-05',
    lida: false,
  },
  {
    id: '4',
    tipo: 'aviso',
    titulo: 'Meta de Vendas',
    descricao: 'A meta de vendas está em 45% - acelere a prospecção',
    data: '2026-01-05',
    lida: false,
  },
  {
    id: '5',
    tipo: 'urgente',
    titulo: 'Vendedores Abaixo da Meta',
    descricao: '2 vendedores estão abaixo da meta - considere contato motivacional',
    data: '2026-01-04',
    lida: true,
  },
  {
    id: '6',
    tipo: 'info',
    titulo: 'Relatório Mensal Disponível',
    descricao: 'O relatório financeiro de dezembro está pronto para download',
    data: '2026-01-03',
    lida: true,
  },
]

// Configuração visual por tipo
const tipoConfig = {
  vencido: {
    icon: FileWarning,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    badgeBg: 'bg-red-100 text-red-700 border-red-200',
    badgeText: 'VENCIDO',
  },
  urgente: {
    icon: AlertTriangle,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    badgeBg: 'bg-orange-100 text-orange-700 border-orange-200',
    badgeText: 'URGENTE',
  },
  aviso: {
    icon: AlertCircle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    badgeBg: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    badgeText: 'AVISO',
  },
  info: {
    icon: Bell,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeText: 'INFO',
  },
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notificacoes, setNotificacoes] = useState(mockNotificacoes)

  const naoLidas = notificacoes.filter(n => !n.lida).length
  const vencidos = notificacoes.filter(n => n.tipo === 'vencido').length
  const urgentes = notificacoes.filter(n => n.tipo === 'urgente').length

  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
  }

  const dispensarNotificacao = (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id))
  }

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => prev.map(n => 
      n.id === id ? { ...n, lida: true } : n
    ))
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Botão do Sino */}
      <DialogPrimitive.Trigger asChild>
        <button
          className={`relative p-2 rounded-lg transition-all duration-200 ${
            isOpen 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'hover:bg-gray-100'
          }`}
          title="Notificações"
        >
          <Bell className={`h-5 w-5 ${
            naoLidas > 0 ? 'text-gray-700' : 'text-gray-500'
          }`} />
          
          {/* Badge de contagem */}
          {naoLidas > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              {naoLidas > 9 ? '9+' : naoLidas}
            </span>
          )}
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {/* Overlay escuro */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        {/* Modal de Notificações */}
        <DialogPrimitive.Content 
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-md max-h-[85vh] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
        >
          {/* Header do Modal */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogPrimitive.Title className="font-bold text-white">
                    Central de Alertas
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="text-sm text-white/80">
                    {naoLidas} notificações não lidas
                  </DialogPrimitive.Description>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={marcarTodasComoLidas}
                  className="text-xs text-white/90 hover:text-white font-medium transition-colors px-2 py-1 rounded hover:bg-white/10"
                >
                  Marcar lidas
                </button>
                <DialogPrimitive.Close className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </div>
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="overflow-y-auto max-h-[50vh] bg-white">
            {notificacoes.length === 0 ? (
              <div className="p-8 text-center bg-white">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Tudo em dia!</p>
                <p className="text-sm text-gray-500">Nenhuma notificação pendente</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificacoes.map((notificacao) => {
                  const config = tipoConfig[notificacao.tipo]
                  const IconComponent = config.icon

                  return (
                    <div 
                      key={notificacao.id}
                      onClick={() => marcarComoLida(notificacao.id)}
                      className={`p-4 cursor-pointer transition-colors bg-white hover:bg-gray-50 ${
                        !notificacao.lida ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícone */}
                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${config.iconBg}`}>
                          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className={`font-semibold text-sm text-gray-900 ${
                              notificacao.lida ? 'opacity-70' : ''
                            }`}>
                              {notificacao.titulo}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${config.badgeBg}`}>
                              {config.badgeText}
                            </span>
                            {!notificacao.lida && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notificacao.descricao}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            {notificacao.valor && (
                              <span className="text-sm font-bold text-gray-900">
                                R$ {notificacao.valor.toLocaleString('pt-BR')}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(notificacao.data).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Ação Dispensar */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            dispensarNotificacao(notificacao.id)
                          }}
                          className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                          title="Dispensar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer do Modal */}
          {notificacoes.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-red-600">
                    <FileWarning className="h-4 w-4" />
                    {vencidos} vencidos
                  </span>
                  <span className="flex items-center gap-1.5 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    {urgentes} urgentes
                  </span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                  Configurações
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default NotificationsDropdown
