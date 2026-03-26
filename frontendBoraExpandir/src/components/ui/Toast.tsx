/**
 * Re-export from the canonical Toast implementation in shared components
 * This file maintains backward compatibility with existing imports
 */

export {
  Toast,
  useToast,
  ToastContainer,
  ToastProvider,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
  type ToastType,
} from '@/modules/shared/components/ui/toast'

export { default } from '@/modules/shared/components/ui/toast'
