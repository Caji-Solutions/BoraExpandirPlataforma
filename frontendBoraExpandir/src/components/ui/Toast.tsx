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

  const baseStyles = 'fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in fade-in slide-in-from-bottom-4 duration-300'

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
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="p-1 hover:bg-white/20 rounded transition-colors"
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
    setToasts((prev) => [...prev, { id, message, type, duration }])
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
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

export default Toast
