import React from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react'

export type SortDirection = 'asc' | 'desc'

export interface SortOption {
  value: string
  label: string
}

interface SortControlProps {
  sortBy: string
  sortDirection: SortDirection
  onSortChange: (sortBy: string, direction: SortDirection) => void
  options: SortOption[]
  className?: string
}

export function SortControl({
  sortBy,
  sortDirection,
  onSortChange,
  options,
  className = '',
}: SortControlProps) {
  const toggleDirection = () => {
    onSortChange(sortBy, sortDirection === 'asc' ? 'desc' : 'asc')
  }

  const handleSortByChange = (newSortBy: string) => {
    onSortChange(newSortBy, sortDirection)
  }

  const selectedOption = options.find(opt => opt.value === sortBy)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Ordenar por:
      </label>
      
      <div className="relative flex-1 min-w-[180px]">
        <select
          value={sortBy}
          onChange={(e) => handleSortByChange(e.target.value)}
          className="w-full appearance-none px-3 py-2 pr-10 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      <button
        onClick={toggleDirection}
        className="p-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
        title={sortDirection === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
      >
        {sortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ArrowDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>
    </div>
  )
}

// Helper function to sort data
export function sortData<T>(
  data: T[],
  sortBy: string,
  direction: SortDirection
): T[] {
  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortBy]
    const bValue = (b as any)[sortBy]

    // Handle null/undefined
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return direction === 'asc' ? 1 : -1
    if (bValue == null) return direction === 'asc' ? -1 : 1

    // Handle dates
    if (sortBy.includes('date') || sortBy.includes('_at')) {
      const aDate = new Date(aValue).getTime()
      const bDate = new Date(bValue).getTime()
      return direction === 'asc' ? aDate - bDate : bDate - aDate
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    // Handle strings
    const aString = String(aValue).toLowerCase()
    const bString = String(bValue).toLowerCase()
    
    if (direction === 'asc') {
      return aString.localeCompare(bString, 'pt-BR')
    } else {
      return bString.localeCompare(aString, 'pt-BR')
    }
  })
}
