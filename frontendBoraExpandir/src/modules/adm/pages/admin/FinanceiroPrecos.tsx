import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
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
  Calculator
} from 'lucide-react'
import { traducoesService } from '../../../tradurora/services/traducoesService'
import { cn } from '../../../../lib/utils'

export default function FinanceiroPrecos() {
  const [loading, setLoading] = useState(true)
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [filter, setFilter] = useState('')
  const [apostilaPrice, setApostilaPrice] = useState(180)
  
  // Estados locais para edição de markup
  const [editingMarkups, setEditingMarkups] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await traducoesService.getOrcamentosPendentes()
      // Filtrar apenas os que precisam de aprovação ADM ou já estão prontos
      setOrcamentos(data)
      
      // Inicializar markups com o que já tem no banco ou 20% default
      const initialMarkups: Record<string, number> = {}
      data.forEach((o: any) => {
        if (o.orcamento) {
          initialMarkups[o.id] = o.orcamento.porcentagem_markup || 20
        }
      })
      setEditingMarkups(initialMarkups)
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkupChange = (docId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setEditingMarkups(prev => ({ ...prev, [docId]: numValue }))
  }

  const calculateFinalPrice = (basePrice: number, markupPercent: number) => {
    return basePrice * (1 + markupPercent / 100)
  }

  const handleApprove = async (doc: any) => {
    const markup = editingMarkups[doc.id] || 0
    const finalPrice = calculateFinalPrice(doc.orcamento.valor_orcamento, markup)
    
    try {
      await traducoesService.aprovarOrcamentoAdm(doc.orcamento.id, {
        documentoId: doc.id,
        porcentagemMarkup: markup,
        valorFinal: finalPrice
      })
      alert('Orçamento aprovado e enviado para o cliente!')
      fetchData()
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error)
      alert('Erro ao aprovar orçamento.')
    }
  }

  const filteredDocs = orcamentos.filter(doc => 
    doc.clientes?.nome?.toLowerCase().includes(filter.toLowerCase()) || 
    doc.nome_original?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <HandCoins className="h-8 w-8 text-blue-600" />
            Gestão de Preços e Lucratividade
          </h1>
          <p className="text-gray-500 mt-1">Configure markups de tradução e valores de apostilamento.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Settings className="h-5 w-5 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Apostila (Padrão)</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white">R$</span>
              <input 
                type="number" 
                value={apostilaPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApostilaPrice(Number(e.target.value))}
                className="w-20 font-bold bg-transparent border-none focus:ring-0 p-0 text-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none shadow-lg">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-blue-100 text-sm font-medium">Traduções Pendentes</p>
                  <h3 className="text-3xl font-black mt-1">
                    {orcamentos.filter(o => o.orcamento?.status === 'em_analise').length}
                  </h3>
               </div>
               <div className="p-3 bg-white/20 rounded-xl">
                  <Calculator className="h-6 w-6" />
               </div>
            </div>
         </Card>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Revisão de Orçamentos de Tradutores
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar cliente ou doc..." 
              className="pl-10 h-10 border-gray-200"
              value={filter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Documento / Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Custo (Tradutor)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Markup (%)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Valor Final</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-2 text-gray-500">Carregando orçamentos...</p>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Nenhum orçamento pendente encontrado.
                  </td>
                </tr>
              ) : filteredDocs.map((doc) => {
                const isWaiting = doc.orcamento?.status === 'em_analise'
                const basePrice = doc.orcamento?.valor_orcamento || 0
                const markup = editingMarkups[doc.id] || 0
                const finalPrice = calculateFinalPrice(basePrice, markup)

                return (
                  <tr key={doc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                           <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{doc.nome_original}</p>
                          <p className="text-xs text-gray-500 uppercase font-medium">{doc.clientes?.nome || 'Desconhecido'}</p>
                          <Badge variant="outline" className={cn(
                            "mt-1 text-[10px]",
                            isWaiting ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-green-50 text-green-600 border-green-200"
                          )}>
                             {isWaiting ? 'Aguardando Aprovação ADM' : 'Liberado p/ Cliente'}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-600 dark:text-gray-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(basePrice)}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 max-w-[100px]">
                          <Input 
                            type="number" 
                            disabled={!isWaiting}
                            value={markup}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMarkupChange(doc.id, e.target.value)}
                            className="h-9 font-bold text-center border-gray-200"
                          />
                          <Percent className="h-4 w-4 text-gray-400 shrink-0" />
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-xl font-black text-blue-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice)}
                          </span>
                          <span className="text-[10px] text-green-600 font-bold">LUCRO: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice - basePrice)}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {isWaiting ? (
                         <Button 
                           onClick={() => handleApprove(doc)}
                           className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 rounded-xl"
                         >
                            <CheckCircle2 className="h-4 w-4" />
                            APROVAR
                         </Button>
                       ) : (
                         <Badge className="bg-green-100 text-green-700 border-none">FINALIZADO</Badge>
                       )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="p-6 border-dashed border-2 border-amber-200 bg-amber-50/30">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-amber-100 rounded-2xl">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
               </div>
               <div>
                  <h4 className="font-bold text-amber-900">Atenção ao Apostilamento</h4>
                  <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                    Atualmente as apostilagens são cobradas no valor fixo de R$ {apostilaPrice},00. 
                    Qualquer alteração neste valor refletirá imediatamente no checkout dos clientes que solicitarem apostila hoje.
                  </p>
               </div>
            </div>
         </Card>
      </div>
    </div>
  )
}
