import React, { useState, useEffect } from 'react'
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
import { clienteService } from '../../modules/cliente/services/clienteService'
import { mockClient } from '../../modules/cliente/lib/mock-data'

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
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'unread' | 'read'>('unread')

  const fetchNotificacoes = async () => {
    try {
      setIsLoading(true)
      const data = await clienteService.getNotificacoes(mockClient.id)
      
      const mapped = data.map((n: any) => {
        const isRead = n.lida === true || String(n.lida) === 'true' || n.lida === 1;
        
        // Map backend types to local UI types
        let tipo: 'vencido' | 'urgente' | 'aviso' | 'info' = 'info'
        if (n.tipo === 'error') tipo = 'vencido'
        else if (n.tipo === 'warning') tipo = 'urgente'
        else if (n.tipo === 'success') tipo = 'aviso'

        return {
          id: n.id,
          tipo: tipo,
          titulo: n.titulo,
          descricao: n.mensagem,
          data: n.criado_em || new Date().toISOString(),
          lida: isRead
        }
      })
      
      setNotificacoes(mapped)
    } catch (error) {
      console.error('Erro ao buscar notificações no dropdown:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotificacoes()
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotificacoes()
    }
  }, [isOpen])

  const naoLidas = notificacoes.filter(n => !n.lida).length
  const lidasCount = notificacoes.filter(n => n.lida).length
  const vencidos = notificacoes.filter(n => n.tipo === 'vencido').length
  const urgentes = notificacoes.filter(n => n.tipo === 'urgente').length

  const filteredNotificacoes = notificacoes
    .filter(n => filter === 'unread' ? !n.lida : n.lida)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  const marcarTodasComoLidas = async () => {
    try {
      // Optimistic update
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
      await clienteService.markAllNotificacoesAsRead(mockClient.id)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const dispensarNotificacao = (id: string) => {
    // Para dispensar, geralmente precisaríamos de um endpoint de delete
    // Por enquanto, apenas removemos da UI
    setNotificacoes(prev => prev.filter(n => n.id !== id))
  }

  const marcarComoLida = async (id: string, currentStatus: boolean) => {
    if (currentStatus) return // Já está lida

    try {
      // Optimistic update
      setNotificacoes(prev => prev.map(n => 
        n.id === id ? { ...n, lida: true } : n
      ))
      await clienteService.updateNotificacaoStatus(id, true)
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
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
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full ring-2 ring-white shadow-sm animate-pulse">
              {naoLidas > 99 ? '99+' : naoLidas}
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

          {/* Tabs para Filtragem */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-3 text-sm font-semibold transition-all relative ${
                filter === 'unread' 
                ? 'text-red-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              Não Lidas
              {naoLidas > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full">
                  {naoLidas}
                </span>
              )}
              {filter === 'unread' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
              )}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`flex-1 py-3 text-sm font-semibold transition-all relative ${
                filter === 'read' 
                ? 'text-red-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              Lidas
              {lidasCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-gray-200 text-gray-600 rounded-full">
                  {lidasCount}
                </span>
              )}
              {filter === 'read' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
              )}
            </button>
          </div>

          {/* Lista de Notificações */}
          <div className="overflow-y-auto max-h-[50vh] bg-white">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto" />
                <p className="mt-4 text-gray-500 text-sm">Carregando...</p>
              </div>
            ) : filteredNotificacoes.length === 0 ? (
              <div className="p-12 text-center bg-white">
                <CheckCircle className="h-12 w-12 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Nenhuma notificação</p>
                <p className="text-sm text-gray-500">
                  {filter === 'unread' ? 'Você leu todas as mensagens!' : 'Sua aba de lidas está vazia.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotificacoes.map((notificacao) => {
                  const config = tipoConfig[notificacao.tipo as keyof typeof tipoConfig]
                  const IconComponent = config.icon

                  return (
                    <div 
                      key={notificacao.id}
                      className={`p-4 transition-colors bg-white hover:bg-gray-50 ${
                        !notificacao.lida ? 'bg-blue-50/50' : ''
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
