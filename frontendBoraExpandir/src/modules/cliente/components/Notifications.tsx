import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Bell, AlertCircle, CheckCircle, Info, Trash2, Eye, EyeOff, CheckCheck } from 'lucide-react'
import { Notification } from '../types'
import { cn, formatDate } from '../lib/utils'

interface NotificationsProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string, lida: boolean) => void
  onMarkAllAsRead: () => void
  onDismiss: (notificationId: string) => void
}

const notificationConfig = {
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200',
    badge: 'default' as const,
  },
  success: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200',
    badge: 'success' as const,
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200',
    badge: 'warning' as const,
  },
  error: {
    icon: AlertCircle,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200',
    badge: 'destructive' as const,
  },
}

export function Notifications({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDismiss 
}: NotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('unread')

  const isNotificationRead = (n: Notification) => n.read === true || n.lida === true;

  const unreadCount = notifications.filter(n => !isNotificationRead(n)).length
  const readCount = notifications.filter(n => isNotificationRead(n)).length
  
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !isNotificationRead(n))
    : filter === 'read'
    ? notifications.filter(n => isNotificationRead(n))
    : notifications

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const aRead = isNotificationRead(a)
    const bRead = isNotificationRead(b)
    
    // Unread first if in "all" view
    if (filter === 'all' && aRead !== bRead) {
      return aRead ? 1 : -1
    }
    
    // Then by date (newest first)
    return new Date(b.createdAt || b.criado_em || 0).getTime() - new Date(a.createdAt || a.criado_em || 0).getTime()
  })

  const unreadNotifications = sortedNotifications.filter(n => !isNotificationRead(n))
  const readNotifications = sortedNotifications.filter(n => isNotificationRead(n))

  const renderNotificationCard = (notification: Notification) => {
    const type = notification.type || notification.tipo || 'info'
    const config = notificationConfig[type as keyof typeof notificationConfig] || notificationConfig.info
    const NotificationIcon = config.icon

    return (
      <Card 
        key={notification.id} 
        className={cn(
          "group transition-all duration-300 border-l-4 overflow-hidden relative",
          !isNotificationRead(notification) 
            ? "border-l-blue-500 bg-white dark:bg-gray-800/50 shadow-md translate-x-1 cursor-pointer hover:shadow-lg hover:border-l-blue-600" 
            : "border-l-gray-300 bg-gray-50/50 dark:bg-gray-900/20 opacity-80"
        )}
      >
        {!isNotificationRead(notification) && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
        
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex-shrink-0 p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110",
              config.bgColor
            )}>
              <NotificationIcon className={cn("h-6 w-6", config.color)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "text-lg font-bold truncate transition-colors duration-200",
                  !isNotificationRead(notification) ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                )}>
                  {notification.title || notification.titulo}
                </h3>
                <Badge 
                  variant={config.badge} 
                  className="text-[10px] uppercase tracking-wider font-bold h-5"
                >
                  {(notification.type || notification.tipo || 'info')}
                </Badge>
              </div>
              
              <p className={cn(
                "text-sm mb-4 leading-relaxed",
                !isNotificationRead(notification) ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-500 dark:text-gray-500"
              )}>
                {notification.message || notification.mensagem}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  {formatDate((notification.createdAt || notification.criado_em) as any)}
                </span>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id, !isNotificationRead(notification));
                    }}
                    className={cn(
                      "h-8 px-3 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all duration-200",
                      isNotificationRead(notification) 
                        ? "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700" 
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    )}
                  >
                    {isNotificationRead(notification) ? (
                      <><EyeOff className="h-3.5 w-3.5" /> Marcar como não lida</>
                    ) : (
                      <><Eye className="h-3.5 w-3.5" /> Marcar como lida</>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notification.id);
                    }}
                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Central de Alertas
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Gerencie suas notificações e acompanhe o progresso do seu processo.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter('unread')}
              className={cn(
                "rounded-lg px-4 h-9 font-bold transition-all duration-300 whitespace-nowrap",
                filter === 'unread' 
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/50" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              )}
            >
              Não Lidas
              {unreadCount > 0 && (
                <span className={cn(
                  "ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-black",
                  filter === 'unread' ? "bg-red-500 text-white" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {unreadCount}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter('read')}
              className={cn(
                "rounded-lg px-4 h-9 font-bold transition-all duration-300 whitespace-nowrap",
                filter === 'read'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              )}
            >
              Lidas
              {readCount > 0 && (
                <span className={cn(
                  "ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-black",
                  filter === 'read' ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                )}>
                  {readCount}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter('all')}
              className={cn(
                "rounded-lg px-4 h-9 font-bold transition-all duration-300 whitespace-nowrap",
                filter === 'all'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              )}
            >
              Todas
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center gap-2 h-11 px-5 font-bold whitespace-nowrap shadow-sm shadow-blue-100"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Marcar todas como lidas</span>
              <span className="sm:hidden inline">Lidas</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {sortedNotifications.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Tudo limpo por aqui!
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                {filter === 'unread' 
                  ? 'Você não tem nenhuma notificação pendente de leitura.' 
                  : 'Sua lista de notificações está vazia.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedNotifications.map(renderNotificationCard)}
          </div>
        )}
      </div>

      {/* Suggested Action for Rejections */}
      {notifications.some(n => (n.type === 'error' || n.tipo === 'error') && !isNotificationRead(n)) && (
        <Card className="border-none bg-gradient-to-r from-rose-500/10 to-rose-600/5 dark:from-rose-500/20 dark:to-transparent overflow-hidden border-rose-200/50">
          <CardContent className="p-6 relative">
            <div className="absolute -right-4 -top-8 opacity-10">
              <AlertCircle className="w-24 h-24 text-rose-600" />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-rose-900 dark:text-rose-100 mb-1">
                  Ação Necessária
                </h4>
                <p className="text-rose-700/80 dark:text-rose-300/80">
                  Detectamos documentos rejeitados. O reenvio rápido acelera seu processo.
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="lg" 
                className="rounded-xl shadow-lg shadow-rose-200 dark:shadow-none px-8 font-bold"
                onClick={() => window.location.href = '/cliente/upload'}
              >
                Resolver Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
