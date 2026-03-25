import React from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

export type TimeRange = 'current_month' | 'last_month' | 'last_90_days' | 'last_6_months' | 'current_year' | 'all'

export interface TimeRangeOption {
  value: TimeRange
  label: string
  description?: string
}

interface TimeRangeFilterProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
  className?: string
}

const timeRangeOptions: TimeRangeOption[] = [
  { value: 'current_month', label: 'Mês Atual', description: 'Registros deste mês' },
  { value: 'last_month', label: 'Mês Passado', description: 'Registros do mês anterior' },
  { value: 'last_90_days', label: 'Últimos 90 dias', description: 'Últimos 3 meses' },
  { value: 'last_6_months', label: 'Últimos 6 meses', description: 'Últimos 6 meses' },
  { value: 'current_year', label: 'Ano Atual', description: 'Registros deste ano' },
  { value: 'all', label: 'Todos', description: 'Todos os registros' },
]

export function TimeRangeFilter({ value, onChange, className = '' }: TimeRangeFilterProps) {
  const selectedOption = timeRangeOptions.find(opt => opt.value === value)

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Calendar className="inline h-4 w-4 mr-1" />
        Período
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as TimeRange)}
          className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
        >
          {timeRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
      {selectedOption?.description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {selectedOption.description}
        </p>
      )}
    </div>
  )
}

// Helper function to filter data by time range
export function filterByTimeRange<T extends { created_at: string }>(
  data: T[],
  timeRange: TimeRange
): T[] {
  if (timeRange === 'all') return data

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let startDate: Date

  switch (timeRange) {
    case 'current_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return data.filter(item => {
        const itemDate = new Date(item.created_at)
        return itemDate >= startDate && itemDate <= endDate
      })
    case 'last_90_days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'last_6_months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
      break
    case 'current_year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      return data
  }

  return data.filter(item => new Date(item.created_at) >= startDate)
}
