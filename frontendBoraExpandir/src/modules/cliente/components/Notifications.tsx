import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Bell, AlertCircle, CheckCircle, Info, X } from 'lucide-react'
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
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    badge: 'default' as const,
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    badge: 'success' as const,
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    badge: 'warning' as const,
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    badge: 'destructive' as const,
  },
}

export function Notifications({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDismiss 
}: NotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.createdAt || b.criado_em || 0).getTime() - new Date(a.createdAt || a.criado_em || 0).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Bell className="h-6 w-6" />
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Fique por dentro das atualizações do seu processo.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs"
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="text-xs"
            >
              Não Lidas ({unreadCount})
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              Marcar Todas como Lidas
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sortedNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread' 
                  ? 'Você não tem notificações não lidas.' 
                  : 'Você não tem notificações.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedNotifications.map((notification) => {
            const config = notificationConfig[notification.type || 'info']
            const NotificationIcon = config.icon

            return (
              <Card 
                key={notification.id} 
                className={cn(
                  "transition-all hover:shadow-md relative",
                  !notification.read && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500",
                  notification.read && "opacity-75"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={cn("p-2 rounded-lg", config.bgColor)}>
                        <NotificationIcon className={cn("h-5 w-5", config.color)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {notification.title || notification.titulo}
                          </h3>
                          <Badge variant={config.badge} className="text-xs">
                            {(notification.type || 'info') === 'info' ? 'Info' :
                             notification.type === 'success' ? 'Sucesso' :
                             notification.type === 'warning' ? 'Aviso' :
                             'Erro'}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{notification.message || notification.mensagem}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate((notification.createdAt || notification.criado_em) as any)}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMarkAsRead(notification.id, !notification.read)}
                              className="text-xs"
                            >
                              {notification.read ? 'Marcar como não lida' : 'Marcar como lida'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDismiss(notification.id)}
                              className="text-xs p-1 h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Quick Actions for Rejected Documents */}
      {notifications.some(n => n.type === 'error' && !n.read) && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Ação Necessária</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300 mb-4">
              Você tem documentos rejeitados que precisam ser reenviados. 
              Acesse a área de upload de documentos para enviar as versões corrigidas.
            </p>
            <Button variant="destructive" size="sm">
              Ir para Upload de Documentos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
