import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/modules/shared/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Users, TrendingUp, Euro, DollarSign, RefreshCw, Target, LogIn } from 'lucide-react'
import { Button } from '@/modules/shared/components/ui/button'

interface Delegado {
  id: string
  full_name: string
  email: string
  nivel?: string | null
  cargo?: string | null
  horario_trabalho?: string | null
}

interface ComissaoEquipe {
  nivel: string
  totalSubordinados: number
  subordinados: { id: string; nome: string; cargo: string }[]
  totalVendasEquipe: number
  totalFaturadoEur: number
  metaVendasAtingida: number
  comissaoVendasEur: number
  comissaoFaturamentoEur: number
  totalComissaoEur: number
  totalComissaoBrl: number
  taxaCambio: number
}

export default function SupervisorComercialPage() {
  const { activeProfile, setImpersonatedProfile } = useAuth()
  const navigate = useNavigate()
  const [delegados, setDelegados] = useState<Delegado[]>([])
  const [comissao, setComissao] = useState<ComissaoEquipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  const mesAtual = new Date().getMonth() + 1
  const anoAtual = new Date().getFullYear()

  useEffect(() => {
    if (activeProfile?.id) fetchData()
  }, [activeProfile?.id])

  async function fetchData() {
    setLoading(true)
    try {
      const [delegadosRes, comissaoRes] = await Promise.all([
        apiClient.get<Delegado[]>(`/auth/team/delegados/${activeProfile!.id}`),
        apiClient.get<{ data: ComissaoEquipe }>(`/comercial/comissao/calcular?mes=${mesAtual}&ano=${anoAtual}`)
          .catch(() => ({ data: null }))
      ])
      setDelegados(delegadosRes)
      setComissao(comissaoRes.data)
    } catch (err) {
      console.error('Erro ao buscar dados do supervisor:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleEntrarComoDelegado(d: Delegado) {
    setImpersonatedProfile({
      id: d.id,
      full_name: d.full_name,
      email: d.email,
      role: 'comercial',
      nivel: (d.nivel as 'C1' | 'C2') || 'C1',
      cargo: (d.cargo as 'C1' | 'C2' | 'HEAD') || 'C1',
      is_supervisor: false,
    })
    navigate('/comercial')
  }

  async function recalcularComissao() {
    setCalculating(true)
    try {
      const res = await apiClient.get<{ data: ComissaoEquipe }>(`/comercial/comissao/calcular?mes=${mesAtual}&ano=${anoAtual}`)
      setComissao(res.data)
    } catch (err) {
      console.error('Erro ao recalcular:', err)
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minha Equipe</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seus delegados e acompanhe o desempenho da equipe
          </p>
        </div>
        <Button
          variant="outline"
          onClick={recalcularComissao}
          disabled={calculating}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${calculating ? 'animate-spin' : ''}`} />
          {calculating ? 'Calculando...' : 'Recalcular'}
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delegados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{delegados.length}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vendas da Equipe</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{comissao?.totalVendasEquipe || 0}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comissão (EUR)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {comissao?.totalComissaoEur?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                <Euro className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comissão (BRL)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {comissao?.totalComissaoBrl?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meta Atingida */}
      {comissao && comissao.metaVendasAtingida > 0 && (
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-gray-600 dark:text-gray-400">Meta atingida:</span>
              <Badge variant="success">Meta {comissao.metaVendasAtingida}</Badge>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                ({comissao.totalVendasEquipe} vendas da equipe | Faturamento: EUR {comissao.totalFaturadoEur.toFixed(2)})
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Delegados */}
      <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Delegados ({delegados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {delegados.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum delegado atribuido a voce.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-neutral-700">
              {delegados.map((d) => (
                <div key={d.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm">
                      {d.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{d.full_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{d.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={d.nivel === 'C2' ? 'default' : 'secondary'}>
                      {d.nivel || 'C1'}
                    </Badge>
                    {d.horario_trabalho && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{d.horario_trabalho}</span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => handleEntrarComoDelegado(d)}
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Entrar na Área
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
