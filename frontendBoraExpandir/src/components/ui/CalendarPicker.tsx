import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useState } from "react"

interface CalendarPickerProps {
  onDateSelect: (date: Date) => void
  selectedDate?: Date
  disabledDates?: Date[]
  disablePastDates?: boolean
  minDate?: Date
  occupancyData?: Record<string, number> // key: YYYY-MM-DD, value: 0-1 (percentage)
  disableWeekends?: boolean
}

const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]

export function CalendarPicker({
  onDateSelect,
  selectedDate,
  disabledDates = [],
  disablePastDates = false,
  minDate,
  occupancyData,
  disableWeekends = false
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

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

  const isPastDate = (day: number) => {
    // Se minDate for fornecido, usa ele como referência
    if (minDate) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const minDateNormalized = new Date(minDate)
      minDateNormalized.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)
      return date < minDateNormalized
    }

    if (!disablePastDates) return false

    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date()

    // Zerar as horas para comparar apenas a data
    date.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    return date < today
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

    // Verificar se é uma data passada (ou anterior a minDate)
    if (isPastDate(day)) return true

    if (disableWeekends) {
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) return true
    }

    // Verificar se está na lista de datas desabilitadas
    return disabledDates.some(
      disabledDate =>
        disabledDate.getDate() === date.getDate() &&
        disabledDate.getMonth() === date.getMonth() &&
        disabledDate.getFullYear() === date.getFullYear()
    )
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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:rounded-3xl dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-neutral-300" />
        </Button>

        <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-neutral-100 md:text-xl">
          {monthName}, {year}
        </h3>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <ChevronRight className="h-4 w-4 text-gray-700 dark:text-neutral-300" />
        </Button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 py-2 dark:text-neutral-400"
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

          const dateKey = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0]
          const occupancy = occupancyData?.[dateKey] || 0

          let occupancyClass = ''
          if (!disabled && !selected && !today) {
            if (occupancy > 0.7) {
              occupancyClass = 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
            } else if (occupancy >= 0.5) {
              occupancyClass = 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50'
            } else if (occupancy > 0) {
              occupancyClass = 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
            }
          }

          return (
            <button
              key={day}
              onClick={() => !disabled && handleDayClick(day)}
              disabled={disabled}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                ${disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-500'
                  : selected
                    ? 'bg-blue-700 text-white shadow-md hover:bg-blue-500 hover:text-white'
                    : today
                      ? 'bg-blue-900 text-white font-bold hover:bg-blue-500 hover:text-white dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-500'
                      : occupancyClass || 'bg-gray-50 text-gray-900 hover:bg-blue-500 hover:text-white dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-blue-500 dark:hover:text-white'
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

