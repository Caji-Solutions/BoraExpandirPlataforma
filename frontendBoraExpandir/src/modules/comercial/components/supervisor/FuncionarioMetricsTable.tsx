import { ChevronRight } from 'lucide-react'
import type { FuncionarioMetricas } from '../../types/supervisorMetrics'

interface Props {
    funcionarios: FuncionarioMetricas[]
    loading?: boolean
    onSelect: (id: string) => void
}

function fmtBRL(v: number | null | undefined) {
    if (v == null) return '—'
    return v.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
    })
}

function fmtPct(v: number | null | undefined) {
    if (v == null) return '—'
    return `${(v * 100).toFixed(0)}%`
}

function NivelSection({
    titulo,
    subtitulo,
    funcionarios,
    isC2,
    onSelect,
}: {
    titulo: string
    subtitulo: string
    funcionarios: FuncionarioMetricas[]
    isC2: boolean
    onSelect: (id: string) => void
}) {
    if (funcionarios.length === 0) return null
    return (
        <div className="space-y-2">
            <div>
                <h3 className="text-base font-semibold">{titulo}</h3>
                <p className="text-xs text-muted-foreground">
                    {subtitulo} ({funcionarios.length})
                </p>
            </div>
            <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Nome</th>
                            <th className="px-3 py-2 text-right">Leads</th>
                            <th className="px-3 py-2 text-right">Consultorias</th>
                            <th className="px-3 py-2 text-right">Comparec.</th>
                            <th className="px-3 py-2 text-right">Conv. L→C</th>
                            {isC2 && (
                                <>
                                    <th className="px-3 py-2 text-right">Assess. fech.</th>
                                    <th className="px-3 py-2 text-right">Conv. C→A</th>
                                    <th className="px-3 py-2 text-right">Ticket médio</th>
                                    <th className="px-3 py-2 text-right">Faturam.</th>
                                </>
                            )}
                            <th className="px-3 py-2 text-right">Comissão</th>
                            <th className="px-3 py-2 w-8" />
                        </tr>
                    </thead>
                    <tbody>
                        {funcionarios.map((f) => (
                            <tr
                                key={f.id}
                                onClick={() => onSelect(f.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        onSelect(f.id)
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                className="border-t hover:bg-muted/30 cursor-pointer focus:outline-none focus:bg-muted/40"
                            >
                                <td className="px-3 py-2 font-semibold">{f.ranking}</td>
                                <td className="px-3 py-2">{f.nome}</td>
                                <td className="px-3 py-2 text-right">{f.leadsCriados}</td>
                                <td className="px-3 py-2 text-right">
                                    {f.consultoriasRealizadas}/{f.consultoriasAgendadas}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {fmtPct(f.taxaComparecimento)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {fmtPct(f.taxaConversaoLeadConsultoria)}
                                </td>
                                {isC2 && (
                                    <>
                                        <td className="px-3 py-2 text-right">
                                            {f.assessoriasFechadas ?? '—'}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {fmtPct(f.taxaConversaoConsultoriaAssessoria)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {fmtBRL(f.ticketMedio)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {fmtBRL(f.faturamentoGerado)}
                                        </td>
                                    </>
                                )}
                                <td className="px-3 py-2 text-right">
                                    {fmtBRL(f.comissaoAcumulada)}
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">
                                    <ChevronRight className="h-4 w-4" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function FuncionarioMetricsTable({ funcionarios, loading, onSelect }: Props) {
    if (loading) {
        return (
            <div className="space-y-3">
                <div className="h-32 rounded-lg border animate-pulse" />
                <div className="h-32 rounded-lg border animate-pulse" />
            </div>
        )
    }

    if (funcionarios.length === 0) {
        return (
            <div className="rounded-lg border bg-muted/30 p-8 text-center">
                <p className="text-muted-foreground text-sm">
                    Nenhum funcionário atribuído ao seu time. Peça ao admin para vincular
                    delegados.
                </p>
            </div>
        )
    }

    const c1 = funcionarios.filter((f) => f.nivel === 'C1')
    const c2 = funcionarios.filter((f) => f.nivel === 'C2')

    return (
        <div className="space-y-6">
            <NivelSection
                titulo="C2 — Closer"
                subtitulo="Vendedores que fecham assessoria"
                funcionarios={c2}
                isC2={true}
                onSelect={onSelect}
            />
            <NivelSection
                titulo="C1 — Hunter"
                subtitulo="Captação de leads + agendamento"
                funcionarios={c1}
                isC2={false}
                onSelect={onSelect}
            />
        </div>
    )
}
