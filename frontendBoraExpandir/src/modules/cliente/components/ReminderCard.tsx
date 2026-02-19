import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Bell, Briefcase, FileText, Scale, ArrowRight, Clock, Info, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Reminder } from '../types'
import { Link } from 'react-router-dom'
import { formatDateSimple } from '../lib/utils'

interface ReminderCardProps {
    title: string
    type: 'admin' | 'legal' | 'commercial'
    reminders: Reminder[]
}

export function ReminderCard({ title, type, reminders }: ReminderCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextReminder = () => {
        setCurrentIndex((prev) => (prev + 1) % reminders.length)
    }

    const prevReminder = () => {
        setCurrentIndex((prev) => (prev - 1 + reminders.length) % reminders.length)
    }

    const currentReminder = reminders[currentIndex]

    const getIcon = () => {
        switch (type) {
            case 'admin':
                return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            case 'legal':
                return <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            case 'commercial':
                return <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            default:
                return <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        }
    }

    const getHeaderColor = () => {
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
    }

    const getStatusIcon = (reminderType: Reminder['type']) => {
        switch (reminderType) {
            case 'urgent':
                return <AlertTriangle className="h-4 w-4 text-red-500" />
            case 'warning':
                return <Clock className="h-4 w-4 text-orange-500" />
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            default:
                return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <Card className={`h-full ${getHeaderColor()} shadow-sm hover:shadow-md transition-shadow`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-base">
                        {getIcon()}
                        <span>{title}</span>
                    </CardTitle>
                    {reminders.length > 1 && (
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={prevReminder}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4 text-gray-500" />
                            </button>
                            <span className="text-xs text-gray-400 font-medium w-4 text-center">
                                {currentIndex + 1}/{reminders.length}
                            </span>
                            <button
                                onClick={nextReminder}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {reminders.length > 0 && currentReminder ? (
                    <div className="h-full flex flex-col justify-between">
                        <div key={currentReminder.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[120px]">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-2 w-full">
                                    <div className="mt-0.5 flex-shrink-0">{getStatusIcon(currentReminder.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight truncate">
                                            {currentReminder.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                                            {currentReminder.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-3">
                                            {formatDateSimple(currentReminder.date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                        Nenhum lembrete no momento.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
