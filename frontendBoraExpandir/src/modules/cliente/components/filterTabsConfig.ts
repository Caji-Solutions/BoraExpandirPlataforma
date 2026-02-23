import {
    FileClock,
    Clock,
    FileX,
    Stamp,
    Languages,
    FileCheck,
    ClipboardList,
    Folder,
} from 'lucide-react'

export interface FilterTab {
    id: string
    label: string
    description: string
    icon: typeof Clock
    color: string
    activeColor: string
    activeBorder: string
    textColor: string
    bgActive: string
    badgeBg: string
}

export const filterTabs: FilterTab[] = [
    {
        id: 'pending',
        label: 'Pendentes',
        description: 'Documentos principais para iniciar o processo',
        icon: FileClock,
        color: 'amber',
        activeColor: 'bg-amber-500',
        activeBorder: 'border-amber-500',
        textColor: 'text-amber-700 dark:text-amber-400',
        bgActive: 'bg-amber-50 dark:bg-amber-900/20',
        badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
        id: 'analyzing',
        label: 'Em Análise',
        description: 'Documentos sendo analisados pelo jurídico',
        icon: Clock,
        color: 'blue',
        activeColor: 'bg-blue-500',
        activeBorder: 'border-blue-500',
        textColor: 'text-blue-700 dark:text-blue-400',
        bgActive: 'bg-blue-50 dark:bg-blue-900/20',
        badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
        id: 'rejected',
        label: 'Rejeitados',
        description: 'Documentos rejeitados por haver algum erro',
        icon: FileX,
        color: 'red',
        activeColor: 'bg-red-500',
        activeBorder: 'border-red-500',
        textColor: 'text-red-700 dark:text-red-400',
        bgActive: 'bg-red-50 dark:bg-red-900/20',
        badgeBg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
    {
        id: 'apostille',
        label: 'Para Apostilar',
        description: 'Documentos corretos que necessitam ser apostilados',
        icon: Stamp,
        color: 'amber',
        activeColor: 'bg-orange-500',
        activeBorder: 'border-orange-500',
        textColor: 'text-orange-700 dark:text-orange-400',
        bgActive: 'bg-orange-50 dark:bg-orange-900/20',
        badgeBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    },
    {
        id: 'translation',
        label: 'Para Traduzir',
        description: 'Documentos apostilados que precisam ser traduzidos',
        icon: Languages,
        color: 'purple',
        activeColor: 'bg-purple-500',
        activeBorder: 'border-purple-500',
        textColor: 'text-purple-700 dark:text-purple-400',
        bgActive: 'bg-purple-50 dark:bg-purple-900/20',
        badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
    {
        id: 'completed',
        label: 'Aprovados',
        description: 'Documentos corretos, apostilados e traduzidos',
        icon: FileCheck,
        color: 'green',
        activeColor: 'bg-green-500',
        activeBorder: 'border-green-500',
        textColor: 'text-green-700 dark:text-green-400',
        bgActive: 'bg-green-50 dark:bg-green-900/20',
        badgeBg: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    },
    {
        id: 'forms',
        label: 'Formulários Solicitados',
        description: 'Formulários que necessitam do preenchimento e assinatura',
        icon: ClipboardList,
        color: 'indigo',
        activeColor: 'bg-indigo-500',
        activeBorder: 'border-indigo-500',
        textColor: 'text-indigo-700 dark:text-indigo-400',
        bgActive: 'bg-indigo-50 dark:bg-indigo-900/20',
        badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    {
        id: 'requirements',
        label: 'Requerimentos Solicitados',
        description: 'Documentos solicitados pelo governo espanhol',
        icon: Folder,
        color: 'slate',
        activeColor: 'bg-slate-500',
        activeBorder: 'border-slate-500',
        textColor: 'text-slate-700 dark:text-slate-400',
        bgActive: 'bg-slate-50 dark:bg-slate-900/20',
        badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
    },
]
