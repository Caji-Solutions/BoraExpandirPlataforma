'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
    targetDate: Date
    className?: string
    variant?: 'blue' | 'yellow' | 'red'
}

interface TimeRemaining {
    days: number
    hours: number
    minutes: number
    seconds: number
    isPast: boolean
}

export function CountdownTimer({ targetDate, className = "", variant = 'blue' }: CountdownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isPast: false
    })

    const colors = {
        blue: {
            text: 'text-blue-600 dark:text-blue-400',
            subText: 'text-gray-600 dark:text-gray-400',
            bg: 'bg-white dark:bg-gray-800',
            label: 'text-blue-900 dark:text-blue-100',
            border: ''
        },
        yellow: {
            text: 'text-yellow-600 dark:text-yellow-400',
            subText: 'text-yellow-700 dark:text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            label: 'text-yellow-700 dark:text-yellow-400',
            border: 'border border-yellow-200 dark:border-yellow-800'
        },
        red: {
            text: 'text-red-600 dark:text-red-400',
            subText: 'text-red-700 dark:text-red-500',
            bg: 'bg-white dark:bg-neutral-800',
            label: 'text-red-700 dark:text-red-400',
            border: 'border border-red-100 dark:border-red-900/50 shadow-sm'
        }
    }

    const currentColors = colors[variant]

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date()
            const diff = targetDate.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeRemaining({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isPast: true
                })
                return
            }

            const daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hoursRemaining = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const secondsRemaining = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeRemaining({
                days: daysRemaining,
                hours: hoursRemaining,
                minutes: minutesRemaining,
                seconds: secondsRemaining,
                isPast: false
            })
        }

        calculateTimeRemaining()
        const interval = setInterval(calculateTimeRemaining, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    if (timeRemaining.isPast) {
        return <span className="text-red-500 font-bold">Prazo Expirado</span>
    }

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <p className={`text-sm font-medium ${currentColors.label} mb-2`}>
                Falta apenas:
            </p>
            <div className="grid grid-cols-4 gap-2">
                <div className={`${currentColors.bg} ${currentColors.border} rounded-lg p-2 text-center min-w-[60px]`}>
                    <p className={`text-xl font-bold ${currentColors.text}`}>
                        {timeRemaining.days}
                    </p>
                    <p className={`text-[10px] uppercase ${currentColors.subText}`}>
                        Dias
                    </p>
                </div>
                <div className={`${currentColors.bg} ${currentColors.border} rounded-lg p-2 text-center min-w-[60px]`}>
                    <p className={`text-xl font-bold ${currentColors.text}`}>
                        {String(timeRemaining.hours).padStart(2, '0')}
                    </p>
                    <p className={`text-[10px] uppercase ${currentColors.subText}`}>
                        Horas
                    </p>
                </div>
                <div className={`${currentColors.bg} ${currentColors.border} rounded-lg p-2 text-center min-w-[60px]`}>
                    <p className={`text-xl font-bold ${currentColors.text}`}>
                        {String(timeRemaining.minutes).padStart(2, '0')}
                    </p>
                    <p className={`text-[10px] uppercase ${currentColors.subText}`}>
                        Min
                    </p>
                </div>
                <div className={`${currentColors.bg} ${currentColors.border} rounded-lg p-2 text-center min-w-[60px]`}>
                    <p className={`text-xl font-bold ${currentColors.text}`}>
                        {String(timeRemaining.seconds).padStart(2, '0')}
                    </p>
                    <p className={`text-[10px] uppercase ${currentColors.subText}`}>
                        Seg
                    </p>
                </div>
            </div>
        </div>
    )
}
