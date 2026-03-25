import { useState, useEffect } from 'react'
import { apiClient } from '@/modules/shared/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/shared/components/ui/table'
import { Download, FileText, Calendar } from 'lucide-react'
import { CurrencyWidget } from '@/modules/shared/components/CurrencyWidget'

interface ComissaoRelatorio {
  id: string
  usuario_id: string
  mes: number
  ano: number
  tipo: string
  total_vendas: number
  total_faturado_eur: number
  meta_atingida: number
  valor_comissao_eur: number
  valor_comissao_brl: number
  taxa_cambio: number
  status: string
  usuario?: {
    id: string
    full_name: string
    email: string
    cargo: string
  }
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function RelatorioFechamento() {
  const [relatorio, setRelatorio] = useState<ComissaoRelatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1)
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchRelatorio()
  }, [mesSelecionado, anoSelecionado])

  async function fetchRelatorio() {
    setLoading(true)
    try {
      const response = await apiClient.get<{ data: ComissaoRelatorio[] }>(
        `/comercial/comissao/relatorio?mes=${mesSelecionado}&ano=${anoSelecionado}`
      )
      setRelatorio(response.data)
    } catch (err) {
      console.error('Erro ao buscar relatorio:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalEur = relatorio.reduce((acc, r) => acc + (r.valor_comissao_eur || 0), 0)
  const totalBrl = relatorio.reduce((acc, r) => acc + (r.valor_comissao_brl || 0), 0)

  // Agrupar por usuario
  const porUsuario: Record<string, ComissaoRelatorio[]> = {}
  for (const item of relatorio) {
    const key = item.usuario_id
    if (!porUsuario[key]) porUsuario[key] = []
    porUsuario[key].push(item)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatorio de Fechamento</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Extrato de pagamento de comissoes - Referencia: dia 15 do mes anterior
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencyWidget />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
            className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
          >
            {MESES.map((mes, i) => (
              <option key={i} value={i + 1}>{mes}</option>
            ))}
          </select>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
            className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
          >
            {[2024, 2025, 2026, 2027].map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Colaboradores</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{Object.keys(porUsuario).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <p className="text-sm text-green-700 dark:text-green-400">Total Comissoes (EUR)</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              EUR {totalEur.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700 dark:text-blue-400">Total Comissoes (BRL)</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              R$ {totalBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Detalhamento por Colaborador
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-neutral-700 rounded" />
              ))}
            </div>
          ) : relatorio.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma comissao encontrada para {MESES[mesSelecionado - 1]} {anoSelecionado}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">Faturado (EUR)</TableHead>
                  <TableHead className="text-center">Meta</TableHead>
                  <TableHead className="text-right">Comissao (EUR)</TableHead>
                  <TableHead className="text-right">Comissao (BRL)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorio.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.usuario?.full_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.usuario?.cargo || '-'}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{item.tipo}</TableCell>
                    <TableCell className="text-right">{item.total_vendas}</TableCell>
                    <TableCell className="text-right">
                      {item.total_faturado_eur?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{item.meta_atingida || '-'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {item.valor_comissao_eur?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      R$ {item.valor_comissao_brl?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={item.status === 'pago' ? 'default' : item.status === 'fechado' ? 'secondary' : 'outline'}
                      >
                        {item.status === 'pago' ? 'Pago' : item.status === 'fechado' ? 'Fechado' : 'Estimado'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
