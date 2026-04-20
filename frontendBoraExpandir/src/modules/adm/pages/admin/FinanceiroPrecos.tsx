import React, { useEffect, useState, useMemo } from 'react'
import { Card } from '@/modules/shared/components/ui/card'
import { Button } from '@/modules/shared/components/ui/button'
import { Input } from '@/modules/shared/components/ui/input'
import { Badge } from '@/modules/shared/components/ui/badge'
import { 
  HandCoins, 
  FileText, 
  Search, 
  CheckCircle2, 
  Percent, 
  TrendingUp,
  AlertCircle,
  Loader2,
  Settings,
  Calculator,
  Save,
  DollarSign,
  Briefcase,
  ArrowUpRight,
  Filter,
  BarChart3,
  Layers
} from 'lucide-react'
import { traducoesService } from '../../../tradutora/services/traducoesService'
import { configService } from '../../../../services/configService'
import { admService } from '../../services/admService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/modules/shared/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/shared/components/ui/table'
import { cn } from '../../../../lib/utils'
import { toast } from 'sonner'
import { EurBrlPrice } from '@/modules/shared/components/EurBrlPrice'
import { formatEur } from '@/modules/shared/hooks/useCotacaoEurBrl'

export default function FinanceiroPrecos() {
  const [loading, setLoading] = useState(true)
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [servicePerformance, setServicePerformance] = useState<any[]>([])
  const [filter, setFilter] = useState('')
  const [activeTab, setActiveTab] = useState('traducoes')
  const [apostilaPrice, setApostilaPrice] = useState(180)
  const [markupPadrao, setMarkupPadrao] = useState(20)
  const [isSaving, setIsSaving] = useState(false)
  
  // Estados locais para edição de markup
  const [editingMarkups, setEditingMarkups] = useState<Record<string, number>>({})

  useEffect(() => {
    loadConfig();
    loadTraducoes();
    loadServicePerformance();
  }, []);

  const loadServicePerformance = async () => {
    try {
      const data = await admService.getServicePerformance();
      setServicePerformance(data);
    } catch (error) {
      console.error('Erro ao carregar performance:', error);
    }
  };

  const loadConfig = async () => {
    const m = await configService.get('markup_padrao')
    if (m !== null) setMarkupPadrao(Number(m))
    
    const a = await configService.get('valor_apostila')
    if (a !== null) setApostilaPrice(Number(a))
  }

  const loadTraducoes = async () => {
    try {
      setLoading(true)
      const data = await traducoesService.getOrcamentosPendentes()
      setOrcamentos(data)
      
      const initialMarkups: Record<string, number> = {}
      data.forEach((o: any) => {
        if (o.orcamento) {
          initialMarkups[o.id] = o.orcamento.porcentagem || markupPadrao
        }
      })
      setEditingMarkups(initialMarkups)
    } catch (error) {
      console.error('Erro ao buscar orcamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      await Promise.all([
        configService.set('markup_padrao', markupPadrao),
        configService.set('valor_apostila', apostilaPrice)
      ])
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configuração.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleMarkupChange = (docId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setEditingMarkups(prev => ({ ...prev, [docId]: numValue }))
  }

  const handleApprove = async (doc: any) => {
    const markup = editingMarkups[doc.id] || markupPadrao
    const finalPrice = calculateFinalPrice(doc.orcamento.valor_orcamento, markup)
    
    try {
      await traducoesService.aprovarOrcamentoAdm(doc.orcamento.id, {
        documentoId: doc.id,
        porcentagemMarkup: markup,
        valorFinal: finalPrice
      })
      toast.success('Orçamento liberado!')
      loadTraducoes()
    } catch (error) {
      console.error('Erro ao aprovar orcamento:', error)
      toast.error('Erro ao aprovar.')
    }
  }

  const calculateFinalPrice = (basePrice: number, markupPercent: number) => {
    return basePrice * (1 + markupPercent / 100)
  }

  const filteredDocs = useMemo(() => {
    return orcamentos.filter(doc => 
      doc.clientes?.nome?.toLowerCase().includes(filter.toLowerCase()) || 
      doc.nome_original?.toLowerCase().includes(filter.toLowerCase())
    )
  }, [orcamentos, filter])

  const totals = useMemo(() => {
    let totalCusto = 0
    let totalReceita = 0
    
    filteredDocs.forEach(doc => {
        if (doc.orcamento) {
            const markup = editingMarkups[doc.id] || markupPadrao
            const custo = doc.orcamento.valor_orcamento || 0
            const receita = doc.orcamento.preco_atualizado || calculateFinalPrice(custo, markup)
            totalCusto += custo
            totalReceita += receita
        }
    })
    
    return {
        custo: totalCusto,
        receita: totalReceita,
        lucro: totalReceita - totalCusto
    }
  }, [filteredDocs, editingMarkups, markupPadrao])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-gray-50/50 min-h-screen">
      {/* Header & Configs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                <HandCoins className="h-6 w-6 text-white" />
             </div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Finanças & Precificação</h1>
          </div>
          <p className="text-gray-500 font-medium">Controle de margens, custos e lucratividade operacional.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-3xl shadow-sm border border-gray-100">
            <div className="px-4 py-2 border-r border-gray-100 flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Settings className="h-3 w-3" /> Preço Apostila
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-gray-400">€</span>
                <input 
                   type="number"
                   value={apostilaPrice}
                   onChange={(e) => setApostilaPrice(Number(e.target.value))}
                   className="w-16 bg-transparent border-none p-0 focus:ring-0 font-black text-gray-900"
                 />
               </div>
             </div>

            <div className="px-4 py-2 border-r border-gray-100 flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Percent className="h-3 w-3" /> Markup Padrão
              </span>
              <div className="flex items-center gap-2 mt-1">
                 <input 
                  type="number"
                  value={markupPadrao}
                  onChange={(e) => setMarkupPadrao(Number(e.target.value))}
                  className="w-12 bg-transparent border-none p-0 focus:ring-0 font-black text-gray-900 text-right"
                />
                <span className="text-sm font-bold text-gray-400">%</span>
              </div>
            </div>

            <Button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="rounded-2xl bg-gray-900 hover:bg-black text-white px-6 h-11 flex gap-2 font-bold shadow-xl shadow-gray-200"
            >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
            </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-gray-100 p-1 rounded-2xl h-14 w-full lg:w-fit">
          <TabsTrigger value="traducoes" className="rounded-xl h-12 px-8 flex gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-bold">
            <FileText className="h-4 w-4" />
            Traduções & Apostilas
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-xl h-12 px-8 flex gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-bold">
            <BarChart3 className="h-4 w-4" />
            Catálogo & Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traducoes" className="space-y-8 focus-visible:outline-none">
          {/* Dashboard Cards (Traduções) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-none shadow-2xl bg-white rounded-3xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <DollarSign className="h-24 w-24 text-blue-600" />
              </div>
              <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                      <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      Receita Prevista
                  </div>
                  <div>
                    <EurBrlPrice
                      valorEur={totals.receita}
                      size="xl"
                      className="text-gray-900"
                    />
                    <p className="text-xs text-gray-400 font-medium mt-1">Soma de todos os valores finais</p>
                  </div>
              </div>
            </Card>

            <Card className="p-6 border-none shadow-sm bg-white overflow-hidden relative group">
              <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Briefcase className="h-24 w-24 text-gray-600" />
              </div>
              <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      Custo Operacional
                  </div>
                  <div>
                    <EurBrlPrice
                      valorEur={totals.custo}
                      size="xl"
                      className="text-gray-900"
                    />
                    <p className="text-xs text-gray-400 font-medium mt-1">Pagamentos devidos a tradutores</p>
                  </div>
              </div>
            </Card>

            <Card className="p-6 border-none shadow-md bg-emerald-600 text-white overflow-hidden relative group">
              <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="h-24 w-24 text-white" />
              </div>
              <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-100 font-black text-[10px] uppercase tracking-widest">
                      <ArrowUpRight className="h-3 w-3" />
                      Lucro Bruto (Markup)
                  </div>
                  <div>
                    <EurBrlPrice
                      valorEur={totals.lucro}
                      size="xl"
                      brlClassName="text-emerald-100/70"
                    />
                    <p className="text-xs text-emerald-100/70 font-medium mt-1">Margem de lucro sobre custo base</p>
                  </div>
              </div>
            </Card>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Detalhamento de Vendas
                </h2>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-tight">Listando documentos traduzidos e em precificação</p>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <Input 
                  placeholder="Pesquisar por cliente ou arquivo..." 
                  className="pl-12 h-12 bg-gray-50/50 border-none shadow-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl font-medium"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-[40%]">Ativo / Cliente</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Custo Tradutor</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Margem (%)</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Preço Final</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Status Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-blue-50 rounded-full">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                            </div>
                            <p className="text-gray-400 font-bold animate-pulse">Sincronizando dados...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                        <div className="max-w-xs mx-auto space-y-2 opacity-30">
                            <Calculator className="h-12 w-12 mx-auto" />
                            <p className="font-black text-gray-900">Nenhuma operação financeira encontrada</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDocs.map((doc) => {
                    const hasOrcamento = !!doc.orcamento
                    const isWaitingAdm = doc.orcamento?.status === 'em_analise' 
                    const isFinalized = doc.orcamento?.status === 'disponivel' || doc.orcamento?.status === 'aprovado'
                    
                    const basePrice = doc.orcamento?.valor_orcamento || 0
                    const markup = editingMarkups[doc.id] || markupPadrao
                    const finalPrice = doc.orcamento?.preco_atualizado || calculateFinalPrice(basePrice, markup)

                    return (
                      <tr key={doc.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:border-blue-200 transition-colors">
                               <FileText className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 leading-tight block mb-0.5">{doc.nome_original}</span>
                              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{doc.clientes?.nome || 'External Client'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-black text-gray-500">
                          {hasOrcamento ? <EurBrlPrice valorEur={basePrice} size="sm" /> : <span className="text-gray-200">A DEFINIR</span>}
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center justify-center gap-1.5">
                              <input 
                                type="number" 
                                disabled={isFinalized || !hasOrcamento}
                                value={markup}
                                onChange={(e) => handleMarkupChange(doc.id, e.target.value)}
                                className="h-9 w-12 font-black text-center bg-gray-50 border-none rounded-lg focus:ring-0 text-blue-600 p-0"
                              />
                              <span className="text-[10px] font-black text-gray-300">%</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           {hasOrcamento ? (
                             <div className="flex flex-col">
                                <EurBrlPrice valorEur={finalPrice} size="lg" className="text-gray-900" />
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-[9px] text-emerald-600 font-black uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded">
                                        LUCRO: {formatEur(finalPrice - basePrice)}
                                    </span>
                                </div>
                             </div>
                           ) : (
                             <span className="text-gray-300 font-medium italic text-xs animate-pulse">Aguardando custos...</span>
                           )}
                        </td>
                        <td className="px-8 py-6 text-right">
                           {isWaitingAdm ? (
                             <Button 
                               onClick={() => handleApprove(doc)}
                               className="bg-amber-500 hover:bg-amber-600 text-white font-black h-10 px-6 rounded-xl gap-2 shadow-lg shadow-amber-500/20 text-xs tracking-widest uppercase transition-transform active:scale-95"
                             >
                                <CheckCircle2 className="h-4 w-4" />
                                LIBERAR
                             </Button>
                           ) : isFinalized ? (
                             <Badge className="bg-emerald-50 text-emerald-600 border-none font-black uppercase text-[10px] px-4 py-2 rounded-full tracking-widest">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2 animate-pulse" />
                                Finalizado
                             </Badge>
                           ) : (
                             <Badge variant="outline" className="text-gray-400 border-gray-100 font-black uppercase text-[9px] px-4 py-2 rounded-full tracking-widest">
                                Pendente
                             </Badge>
                           )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8 border-none shadow-2xl bg-white rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-xl">
                      <Layers className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Performance por Serviço</h2>
                  </div>
                  <Badge className="bg-gray-100 text-gray-600 border-none font-bold rounded-lg">{servicePerformance.length} Serviços</Badge>
                </div>

                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 hover:bg-transparent">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Serviço</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Vendas</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Faturamento Bruto</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Repassado (Est.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {servicePerformance.map((svc) => (
                        <TableRow key={svc.id} className="border-gray-50 group hover:bg-gray-50/50 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-base">{svc.nome}</span>
                              <Badge className="w-fit scale-75 -ml-1.5 uppercase font-bold tracking-widest bg-gray-50 text-gray-400 border-none">
                                {svc.tipo}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 font-black text-gray-900 text-lg">
                              {svc.total_vendido}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono font-bold text-emerald-600">
                              {formatCurrency(svc.faturamento_bruto)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono font-bold text-orange-600">
                              {formatCurrency(svc.faturamento_bruto - (svc.faturamento_liquido))}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-8 border-none shadow-2xl bg-gray-900 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10">
                  <Calculator className="h-64 w-64" />
                </div>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  Insight Operacional
                </h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Os serviços de Assessoria representam atualmente 80% do ticket médio. 
                  Considere aumentar o markup de traduções técnicas em períodos de alta demanda.
                </p>
                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-widest">Mark-up Médio</span>
                    <span className="font-black text-xl">{markupPadrao}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${markupPadrao}%` }}></div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Info (Shared) */}
      <div className="p-8 bg-white rounded-[2rem] border border-gray-100 flex items-start gap-4">
        <div className="p-4 bg-amber-50 rounded-2xl">
            <AlertCircle className="h-6 w-6 text-amber-500" />
        </div>
        <div className="space-y-1">
            <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Informação de Checkout</h4>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Os valores exibidos aqui são os que o cliente verá em seu painel. A precificação padrão de apostilamento atual é de <b>{formatEur(apostilaPrice)}</b> por documento selecionado.
            </p>
        </div>
      </div>
    </div>
  )
}
