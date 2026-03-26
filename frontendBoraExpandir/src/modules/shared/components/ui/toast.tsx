import React, { useState, useEffect } from 'react'
import { Check, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  const baseStyles = 'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-xs sm:max-w-sm md:max-w-md'

  const variants = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
  }

  const icons = {
    success: <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
  }

  return (
    <div className={cn(baseStyles, variants[type])}>
      {icons[type]}
      <span className="text-sm font-medium flex-1 break-words">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Hook para usar Toast facilmente
export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string
      message: string
      type: ToastType
      duration?: number
    }>
  >([])

  const showToast = (message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => {
      const novosToasts = [...prev, { id, message, type, duration }]
      return novosToasts
    })
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (message: string, duration?: number) => showToast(message, 'success', duration)
  const error = (message: string, duration?: number) => showToast(message, 'error', duration)
  const info = (message: string, duration?: number) => showToast(message, 'info', duration)
  const warning = (message: string, duration?: number) => showToast(message, 'warning', duration)

  return {
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
    toasts,
  }
}

// Componente para renderizar múltiplos Toasts
export function ToastContainer({ toasts, onRemove }: { toasts: Array<{ id: string; message: string; type: ToastType; duration?: number }>; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

// Componentes compostos para compatibilidade com shadcn/ui toast
import { createContext, useContext as useReactContext } from 'react'

interface ToastContextType {
  toasts: Array<any>
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts] = useState<any[]>([])
  return <ToastContext.Provider value={{ toasts }}>{children}</ToastContext.Provider>
}

export function ToastTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-sm">{children}</h3>
}

export function ToastDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm opacity-90">{children}</p>
}

export function ToastClose({ onClick, ...props }: { onClick?: () => void; [key: string]: any }) {
  return (
    <button
      onClick={onClick}
      className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0 ml-auto"
      aria-label="Fechar notificação"
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  )
}

export function ToastViewport() {
  return <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 pointer-events-none" />
}

export default Toast
