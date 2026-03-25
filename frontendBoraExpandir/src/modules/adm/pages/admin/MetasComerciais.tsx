import { useState, useEffect } from 'react'
import { apiClient } from '@/modules/shared/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'

interface MetaComercial {
  id?: string
  nivel: 'C1' | 'C2' | 'HEAD'
  meta_num: number
  min_vendas: number
  max_vendas: number | null
  valor_comissao_eur: number
  min_faturamento_eur: number
  max_faturamento_eur: number | null
  pct_comissao_faturamento: number
}

const NIVEIS = ['C1', 'C2', 'HEAD'] as const
const META_NUMS = [1, 2, 3, 4] as const

function MetaRow({ meta, onChange }: { meta: MetaComercial; onChange: (field: string, value: any) => void }) {
  return (
    <tr className="border-b border-gray-200 dark:border-neutral-700">
      <td className="px-3 py-2 text-center font-medium text-gray-900 dark:text-white">
        Meta {meta.meta_num}
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={meta.min_vendas}
          onChange={(e) => onChange('min_vendas', parseInt(e.target.value) || 0)}
          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500/50"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={meta.max_vendas ?? ''}
          onChange={(e) => onChange('max_vendas', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="Ilimitado"
          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500/50 placeholder-gray-400"
        />
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">EUR</span>
          <input
            type="number"
            step="0.01"
            value={meta.valor_comissao_eur}
            onChange={(e) => onChange('valor_comissao_eur', parseFloat(e.target.value) || 0)}
            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500/50"
          />
        </div>
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">EUR</span>
          <input
            type="number"
            step="0.01"
            value={meta.min_faturamento_eur}
            onChange={(e) => onChange('min_faturamento_eur', parseFloat(e.target.value) || 0)}
            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500/50"
          />
        </div>
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">EUR</span>
          <input
            type="number"
            step="0.01"
            value={meta.max_faturamento_eur ?? ''}
            onChange={(e) => onChange('max_faturamento_eur', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Ilimitado"
            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500/50 placeholder-gray-400"
          />
        </div>
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.01"
            value={meta.pct_comissao_faturamento}
            onChange={(e) => onChange('pct_comissao_faturamento', parseFloat(e.target.value) || 0)}
            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500/50"
          />
          <span className="text-xs text-gray-500">%</span>
        </div>
      </td>
    </tr>
  )
}

export default function MetasComerciais() {
  const [metas, setMetas] = useState<Record<string, MetaComercial[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    fetchMetas()
  }, [])

  async function fetchMetas() {
    try {
      const response = await apiClient.get<{ data: MetaComercial[] }>('/configuracoes/metas/all')
      const grouped: Record<string, MetaComercial[]> = {}

      for (const nivel of NIVEIS) {
        grouped[nivel] = META_NUMS.map(num => {
          const existing = response.data.find(m => m.nivel === nivel && m.meta_num === num)
          return existing || {
            nivel,
            meta_num: num,
            min_vendas: 0,
            max_vendas: null,
            valor_comissao_eur: 0,
            min_faturamento_eur: 0,
            max_faturamento_eur: null,
            pct_comissao_faturamento: 0
          }
        })
      }

      setMetas(grouped)
    } catch (err) {
      console.error('Erro ao buscar metas:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleMetaChange(nivel: string, metaNum: number, field: string, value: any) {
    setMetas(prev => ({
      ...prev,
      [nivel]: prev[nivel].map(m =>
        m.meta_num === metaNum ? { ...m, [field]: value } : m
      )
    }))
    setSaveStatus('idle')
  }

  async function handleSave() {
    setSaving(true)
    try {
      const allMetas = Object.values(metas).flat()
      await apiClient.put('/configuracoes/metas/batch', { metas: allMetas })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      console.error('Erro ao salvar metas:', err)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-1/3" />
          <div className="h-64 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Metas Comerciais</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure as faixas de metas e comissoes para cada nivel hierarquico
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
            <RefreshIcon />
          ) : saveStatus === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : saveStatus === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Salvando...' : saveStatus === 'success' ? 'Salvo!' : saveStatus === 'error' ? 'Erro ao salvar' : 'Salvar Todas'}
        </button>
      </div>

      {NIVEIS.map(nivel => (
        <Card key={nivel} className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Nivel {nivel}
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                {nivel === 'C1' ? '(Consultor Junior)' : nivel === 'C2' ? '(Consultor Senior + Assessoria)' : '(Supervisor de Equipe)'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Meta</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Min Vendas</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Max Vendas</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Comissao/Venda</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Min Faturamento</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Max Faturamento</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">% Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {metas[nivel]?.map(meta => (
                    <MetaRow
                      key={`${nivel}-${meta.meta_num}`}
                      meta={meta}
                      onChange={(field, value) => handleMetaChange(nivel, meta.meta_num, field, value)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RefreshIcon() {
  return <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
}
