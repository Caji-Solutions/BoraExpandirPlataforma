import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/modules/shared/components/ui/dialog'
import { useFuncionarioDetails } from '../../hooks/useSupervisorMetrics'
import type { FuncionarioDetailsResponse } from '../../types/supervisorMetrics'

interface Props {
    funcionarioId: string | null
    startDate: string
    endDate: string
    onClose: () => void
}

type Tab = 'resumo' | 'leads' | 'consultorias' | 'assessorias'

function fmtBRL(v: number | null | undefined) {
    if (v == null) return '—'
    return v.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
    })
}

function fmtDate(iso?: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR')
}

function ResumoTab({ d }: { d: FuncionarioDetailsResponse }) {
    return (
        <div className="space-y-4 text-sm">
            <div>
                <h4 className="font-semibold mb-1">Leads criados por dia</h4>
                {d.detalhamento.leadsPorDia.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum lead no período.</p>
                ) : (
                    <ul className="space-y-1 max-h-40 overflow-auto">
                        {d.detalhamento.leadsPorDia.map((p) => (
                            <li key={p.data} className="flex justify-between">
                                <span>{fmtDate(p.data)}</span>
                                <span className="font-medium">{p.qtd}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div>
                <h4 className="font-semibold mb-1">Consultorias por status</h4>
                <ul className="space-y-1">
                    {Object.entries(d.detalhamento.consultoriasPorStatus).map(([k, v]) => (
                        <li key={k} className="flex justify-between">
                            <span>{k}</span>
                            <span className="font-medium">{v}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {d.funcionario.nivel === 'C2' && (
                <div>
                    <h4 className="font-semibold mb-1">Assessorias por status</h4>
                    <ul className="space-y-1">
                        {Object.entries(d.detalhamento.assessoriasPorStatus).map(([k, v]) => (
                            <li key={k} className="flex justify-between">
                                <span>{k}</span>
                                <span className="font-medium">{v}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

interface ListTabColumn {
    key: string
    label: string
    render?: (v: any) => string
}

function ListTab({
    items,
    columns,
    emptyText,
}: {
    items: any[]
    columns: ListTabColumn[]
    emptyText: string
}) {
    if (items.length === 0)
        return <p className="text-muted-foreground text-sm">{emptyText}</p>
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key} className="px-2 py-1.5 text-left">
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((it) => (
                        <tr key={it.id} className="border-t">
                            {columns.map((c) => (
                                <td key={c.key} className="px-2 py-1.5">
                                    {c.render ? c.render(it[c.key]) : (it[c.key] ?? '—')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function FuncionarioDetailsModal({
    funcionarioId,
    startDate,
    endDate,
    onClose,
}: Props) {
    const [tab, setTab] = useState<Tab>('resumo')
    const { data, isLoading, error } = useFuncionarioDetails(
        funcionarioId,
        startDate,
        endDate
    )

    useEffect(() => {
        setTab('resumo')
    }, [funcionarioId])

    const tabs: Tab[] =
        data?.funcionario.nivel === 'C2'
            ? ['resumo', 'leads', 'consultorias', 'assessorias']
            : ['resumo', 'leads', 'consultorias']

    return (
        <Dialog open={!!funcionarioId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {data?.funcionario.nome ?? 'Detalhes do funcionário'}
                    </DialogTitle>
                    {data && (
                        <p className="text-xs text-muted-foreground">
                            {data.funcionario.email} · {data.funcionario.nivel}
                        </p>
                    )}
                </DialogHeader>

                {isLoading && (
                    <p className="text-muted-foreground text-sm py-8 text-center">
                        Carregando...
                    </p>
                )}
                {error && (
                    <p className="text-destructive text-sm py-8 text-center">
                        Erro ao carregar detalhes.
                    </p>
                )}

                {data && (
                    <>
                        <div className="flex gap-1 border-b mb-3">
                            {tabs.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`px-3 py-1.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                                        tab === t
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {tab === 'resumo' && <ResumoTab d={data} />}
                        {tab === 'leads' && (
                            <ListTab
                                items={data.leads}
                                emptyText="Nenhum lead criado no período."
                                columns={[
                                    { key: 'nome', label: 'Nome' },
                                    { key: 'telefone', label: 'Telefone' },
                                    { key: 'status', label: 'Status' },
                                    { key: 'data_criacao', label: 'Criado em', render: fmtDate },
                                ]}
                            />
                        )}
                        {tab === 'consultorias' && (
                            <ListTab
                                items={data.consultorias}
                                emptyText="Nenhuma consultoria no período."
                                columns={[
                                    { key: 'cliente_nome', label: 'Cliente' },
                                    {
                                        key: 'data_agendamento',
                                        label: 'Data',
                                        render: fmtDate,
                                    },
                                    { key: 'status', label: 'Status' },
                                    { key: 'valor', label: 'Valor', render: (v) => fmtBRL(v) },
                                ]}
                            />
                        )}
                        {tab === 'assessorias' && data.funcionario.nivel === 'C2' && (
                            <ListTab
                                items={data.assessorias}
                                emptyText="Nenhuma assessoria no período."
                                columns={[
                                    { key: 'cliente_nome', label: 'Cliente' },
                                    { key: 'valor', label: 'Valor', render: (v) => fmtBRL(v) },
                                    { key: 'status', label: 'Status' },
                                    { key: 'data_inicio', label: 'Início', render: fmtDate },
                                    {
                                        key: 'data_fechamento',
                                        label: 'Fechamento',
                                        render: fmtDate,
                                    },
                                ]}
                            />
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
