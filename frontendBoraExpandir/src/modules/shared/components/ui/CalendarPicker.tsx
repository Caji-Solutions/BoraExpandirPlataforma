import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from '@/modules/shared/components/ui/button'

interface CalendarPickerProps {
  onDateSelect: (date: Date) => void
  selectedDate?: Date
  disabledDates?: Date[]
  disablePastDates?: boolean
  disableWeekends?: boolean
  minDate?: Date
}

const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]

export function CalendarPicker({ 
  onDateSelect, 
  selectedDate,
  disabledDates = [],
  disablePastDates,
  disableWeekends,
  minDate
}: CalendarPickerProps) {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); const [currentMonth, setCurrentMonth] = useState(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1))

  const monthName = currentMonth.toLocaleString("pt-BR", { month: "long" })
  const year = currentMonth.getFullYear()

  // Calcular dias do mês
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Criar array de dias
  const days = []
  
  // Dias vazios antes do primeiro dia
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateSelect(date)
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    if (disabledDates.some(
      disabledDate =>
        disabledDate.getDate() === date.getDate() &&
        disabledDate.getMonth() === date.getMonth() &&
        disabledDate.getFullYear() === date.getFullYear()
    )) return true

    if (disableWeekends) {
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) return true
    }

    if (disablePastDates) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) return true
    }

    if (minDate) {
      const min = new Date(minDate)
      min.setHours(0, 0, 0, 0)
      if (date < min) return true
    }

    return false
  }

  const isWeekend = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 text-gray-700" />
        </Button>
        
        <h3 className="text-lg font-semibold capitalize text-gray-900">
          {monthName}, {year}
        </h3>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4 text-gray-700" />
        </Button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />
          }

          const disabled = isDateDisabled(day)
          const selected = isDateSelected(day)
          const today = isToday(day)
          const isWknd = isWeekend(day)

          return (
            <button
              key={day}
              onClick={() => !disabled && handleDayClick(day)}
              disabled={disabled}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all duration-200
                ${
                  disabled && isWknd && disableWeekends
                  ? 'bg-gray-300 dark:bg-neutral-700 text-gray-500 opacity-40 cursor-not-allowed pointer-events-none'
                  : disabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none' 
                  : selected
                  ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700 cursor-pointer'
                  : today
                  ? 'bg-blue-100 text-blue-900 font-bold hover:bg-blue-200 cursor-pointer'
                  : 'bg-gray-50 text-gray-900 hover:bg-gray-200 cursor-pointer'
                }
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
