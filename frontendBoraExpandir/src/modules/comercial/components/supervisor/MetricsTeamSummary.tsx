import {
    Users,
    Calendar,
    CheckCircle2,
    DollarSign,
    FileText,
    Percent,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { KpisTime } from '../../types/supervisorMetrics'

interface Props {
    kpis: KpisTime
    loading?: boolean
}

function fmtBRL(v: number) {
    return v.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
    })
}

function fmtPct(v: number) {
    return `${(v * 100).toFixed(0)}%`
}

function KpiCard({
    icon: Icon,
    label,
    value,
    sublabel,
}: {
    icon: LucideIcon
    label: string
    value: string
    sublabel?: string
}) {
    return (
        <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold mt-0.5 truncate">{value}</p>
                {sublabel && (
                    <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
                )}
            </div>
        </div>
    )
}

function SkeletonCard() {
    return <div className="rounded-lg border bg-card p-4 h-[88px] animate-pulse" />
}

export function MetricsTeamSummary({ kpis, loading }: Props) {
    if (loading) {
        return (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        )
    }
    return (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={Users} label="Leads criados" value={String(kpis.totalLeads)} />
            <KpiCard
                icon={Calendar}
                label="Consultorias"
                value={`${kpis.consultoriasRealizadas}/${kpis.consultoriasAgendadas}`}
                sublabel={`Comparecimento ${fmtPct(kpis.taxaComparecimento)}`}
            />
            <KpiCard
                icon={CheckCircle2}
                label="Assessorias fechadas"
                value={String(kpis.assessoriasFechadas)}
            />
            <KpiCard
                icon={DollarSign}
                label="Faturamento"
                value={fmtBRL(kpis.faturamentoTotal)}
            />
            <KpiCard
                icon={FileText}
                label="Ticket médio"
                value={kpis.ticketMedio > 0 ? fmtBRL(kpis.ticketMedio) : '—'}
            />
            <KpiCard
                icon={Percent}
                label="Taxa comparecimento"
                value={fmtPct(kpis.taxaComparecimento)}
            />
            <KpiCard
                icon={DollarSign}
                label="Comissão time"
                value={fmtBRL(kpis.comissaoTimeTotal)}
                sublabel="Últimos 30d"
            />
        </div>
    )
}
