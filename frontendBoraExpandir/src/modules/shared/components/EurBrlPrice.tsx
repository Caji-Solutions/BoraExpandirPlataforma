import { cn } from '@/lib/utils'
import {
  formatBrl,
  formatEur,
  useCotacaoEurBrl,
} from '@/modules/shared/hooks/useCotacaoEurBrl'

interface EurBrlPriceProps {
  /** Valor em EUR (a moeda nativa do orçamento de tradução). */
  valorEur: number
  /** Alinhamento do bloco. */
  align?: 'left' | 'right' | 'center'
  /** Tamanho do valor em EUR. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Classe extra aplicada ao valor em EUR. */
  className?: string
  /** Classe extra aplicada ao valor em BRL (linha inferior). */
  brlClassName?: string
  /** Layout inline coloca EUR e BRL lado a lado (default: stack vertical). */
  inline?: boolean
}

const SIZE_EUR: Record<NonNullable<EurBrlPriceProps['size']>, string> = {
  xs: 'text-xs font-semibold',
  sm: 'text-sm font-bold',
  md: 'text-base font-bold',
  lg: 'text-lg font-bold',
  xl: 'text-xl font-bold',
}

const SIZE_BRL: Record<NonNullable<EurBrlPriceProps['size']>, string> = {
  xs: 'text-[10px]',
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-sm',
}

export function EurBrlPrice({
  valorEur,
  align = 'left',
  size = 'md',
  className,
  brlClassName,
  inline = false,
}: EurBrlPriceProps) {
  const cotacao = useCotacaoEurBrl()
  const valorBrl = cotacao ? valorEur * cotacao : null

  const alignClass =
    align === 'right'
      ? 'items-end text-right'
      : align === 'center'
        ? 'items-center text-center'
        : 'items-start text-left'

  if (inline) {
    return (
      <span className={cn('inline-flex items-baseline gap-2', className)}>
        <span className={SIZE_EUR[size]}>{formatEur(valorEur)}</span>
        <span
          className={cn(
            SIZE_BRL[size],
            'text-gray-500 dark:text-gray-400',
            brlClassName,
          )}
        >
          {valorBrl != null ? `≈ ${formatBrl(valorBrl)}` : ''}
        </span>
      </span>
    )
  }

  return (
    <div className={cn('flex flex-col leading-tight', alignClass, className)}>
      <span className={SIZE_EUR[size]}>{formatEur(valorEur)}</span>
      <span
        className={cn(
          SIZE_BRL[size],
          'text-gray-500 dark:text-gray-400',
          brlClassName,
        )}
      >
        {valorBrl != null ? `≈ ${formatBrl(valorBrl)}` : ''}
      </span>
    </div>
  )
}
