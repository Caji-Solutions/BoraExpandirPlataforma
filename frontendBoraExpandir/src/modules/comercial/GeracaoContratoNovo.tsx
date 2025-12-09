import { useState } from 'react'
import { X, Loader, Check, ArrowRight, Copy, Mail } from 'lucide-react'
import { CONTRATOS_PDF_MOCK } from './lib/mockPdfContratos'
import type { Cliente, ContratoFormData } from '../../types/comercial'
import Toast, { useToast, ToastContainer } from '../../components/ui/Toast'

interface GeracaoContratoNovoProps {
  onClose: () => void
  onSave?: (contratoData: ContratoFormData) => Promise<void>
  clientes?: Cliente[]
}

type Etapa = 'selecao' | 'pagamento' | 'review'

interface ContratoState {
  clienteId: string
  templateId: string
  valor: string
  formaPagamento: 'stripe' | 'mercado_pago' | ''
  conteudo: string
  linkPagamento: string
}

// Lista de clientes mocados para teste
const CLIENTES_MOCK: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@example.com',
    telefone: '(11) 98765-4321',
    whatsapp: '(11) 98765-4321',
    documento: '123.456.789-00',
    endereco: 'Rua das Flores, 123 - São Paulo/SP',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@example.com',
    telefone: '(21) 99876-5432',
    whatsapp: '(21) 99876-5432',
    documento: '987.654.321-00',
    endereco: 'Av. Paulista, 1000 - São Paulo/SP',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@example.com',
    telefone: '(31) 97654-3210',
    whatsapp: '(31) 97654-3210',
    documento: '456.789.123-00',
    endereco: 'Rua do Comércio, 456 - Belo Horizonte/MG',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    nome: 'Ana Costa',
    email: 'ana.costa@example.com',
    telefone: '(41) 96543-2109',
    whatsapp: '(41) 96543-2109',
    documento: '789.123.456-00',
    endereco: 'Rua XV de Novembro, 789 - Curitiba/PR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    nome: 'Pedro Almeida',
    email: 'pedro.almeida@example.com',
    telefone: '(51) 95432-1098',
    whatsapp: '(51) 95432-1098',
    documento: '321.654.987-00',
    endereco: 'Av. Independência, 321 - Porto Alegre/RS',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function GeracaoContratoNovo({ onClose, onSave, clientes }: GeracaoContratoNovoProps) {
  const [etapa, setEtapa] = useState<Etapa>('selecao')
  const [loading, setLoading] = useState(false)
  const [contrato, setContrato] = useState<ContratoState>({
    clienteId: '',
    templateId: '',
    valor: '',
    formaPagamento: '',
    conteudo: '',
    linkPagamento: '',
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const toast = useToast()

  const clientesDisponiveis = clientes || CLIENTES_MOCK
  const clienteSelecionado = clientesDisponiveis.find(c => c.id === contrato.clienteId)
  const templateSelecionado = CONTRATOS_PDF_MOCK.find(t => t.id === contrato.templateId)

  console.log('Clientes recebidos:', clientes);
  console.log('Cliente selecionado:', clienteSelecionado);
  console.log('Template selecionado:', templateSelecionado);
  console.log('Estado do contrato:', contrato);
  console.log('Etapa atual:', etapa);


  const handleGerarContrato = async () => {
    console.log('handleGerarContrato chamado');
    console.log('contrato.clienteId:', contrato.clienteId);
    console.log('contrato.templateId:', contrato.templateId);
    console.log('contrato.valor:', contrato.valor);
    
    if (!contrato.clienteId || !contrato.templateId || !contrato.valor) {
      console.log('Campos vazios detectados - exibindo aviso');
      console.log('toast object:', toast);
      toast.warning('⚠️ Preencha todos os campos')
      console.log('Toast chamado com warning');
      return
    }

    setLoading(true)
    console.log('Iniciando a geração do contrato...');
    console.log('Dados do contrato antes da geração:', contrato);
    console.log('Etapa atual antes da geração:', etapa);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (!templateSelecionado || !clienteSelecionado) {
        throw new Error('Template ou cliente inválido')
      }

      const conteudo = templateSelecionado.gerar(
        {
          nome: clienteSelecionado.nome,
          email: clienteSelecionado.email,
          telefone: clienteSelecionado.telefone,
          endereco: clienteSelecionado.endereco,
          cidade: '',
          estado: '',
        },
        {
          valorTotal: contrato.valor,
          formaPagamento: 'A definir',
        }
      )

      setContrato(prev => ({ ...prev, conteudo }))
      setEtapa('pagamento')
      toast.success('✅ Contrato gerado com sucesso!')
      console.log('✅ Contrato gerado com sucesso!')
    } catch (err) {
      console.error('❌ Erro:', err)
      toast.error('❌ Erro ao gerar contrato')
      console.log('Erro ao gerar contrato:');
    } finally {
      setLoading(false)
      console.log('Geração do contrato concluída.');
    }
  }

  const handleConfirmarPagamento = () => {
    if (!contrato.formaPagamento) {
      toast.warning('⚠️ Selecione uma plataforma de pagamento')
      return
    }

    const linkFake = `https://${contrato.formaPagamento}.com/pay/${Math.random().toString(36).substring(7)}`
    setContrato(prev => ({ ...prev, linkPagamento: linkFake }))
    setEtapa('review')
  }

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('📋 Copiado para a área de transferência!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleEnviarCliente = async () => {
    if (!onSave) return

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const contratoData: ContratoFormData = {
        cliente_id: contrato.clienteId,
        titulo: `Contrato - ${templateSelecionado?.nome}`,
        descricao: `Contrato ${templateSelecionado?.nome} com valor de R$ ${contrato.valor}`,
        valor: parseFloat(contrato.valor),
        template_tipo: (templateSelecionado?.id as any) || 'servico',
        conteudo_html: contrato.conteudo,
      }

      await onSave(contratoData)
      toast.success('✅ Contrato enviado ao cliente com sucesso!')
      onClose()
    } catch (err) {
      console.error('❌ Erro:', err)
      toast.error('❌ Erro ao enviar contrato')
    } finally {
      setLoading(false)
    }
  }
  const handleClientChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = event.target.value;
    const cliente = clientes?.find(c => c.id === clienteId);
    console.log('Cliente selecionado no dropdown:', clienteId, cliente);
    setContrato(prev => ({ ...prev, clienteId }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header com Etapas */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Gerar Contrato</h2>
              <button onClick={onClose} className="hover:bg-white/20 p-2 rounded transition text-white">
                <X size={24} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between text-white text-sm">
              <div className={`flex items-center gap-2 ${etapa === 'selecao' ? 'font-bold' : 'opacity-70'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${etapa === 'selecao' ? 'bg-white text-emerald-600' : 'bg-white/30'}`}>1</div>
                <span className="hidden sm:inline">Cliente & Contrato</span>
                <span className="sm:hidden">Cliente</span>
              </div>
              <ArrowRight size={16} className={etapa !== 'selecao' ? '' : 'opacity-30'} />
              <div className={`flex items-center gap-2 ${etapa === 'pagamento' ? 'font-bold' : 'opacity-70'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${['pagamento', 'review'].includes(etapa) ? 'bg-white text-emerald-600' : 'bg-white/30'}`}>2</div>
                <span className="hidden sm:inline">Pagamento</span>
                <span className="sm:hidden">Pag.</span>
              </div>
              <ArrowRight size={16} className={etapa === 'review' ? '' : 'opacity-30'} />
              <div className={`flex items-center gap-2 ${etapa === 'review' ? 'font-bold' : 'opacity-70'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${etapa === 'review' ? 'bg-white text-emerald-600' : 'bg-white/30'}`}>3</div>
                <span className="hidden sm:inline">Review</span>
                <span className="sm:hidden">Fim</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* ETAPA 1: SELEÇÃO */}
            {etapa === 'selecao' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cliente */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cliente *
                    </label>
                    <select
                      value={contrato.clienteId}
                      onChange={handleClientChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {clientes?.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Valor */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor (R$) *
                    </label>
                    <input
                      type="number"
                      value={contrato.valor}
                      onChange={(e) => setContrato(prev => ({ ...prev, valor: e.target.value }))}
                      placeholder="0,00"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Template */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Contrato *
                    </label>
                    <select
                      value={contrato.templateId}
                      onChange={(e) => setContrato(prev => ({ ...prev, templateId: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {CONTRATOS_PDF_MOCK.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Informações do Cliente */}
                {clienteSelecionado && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Dados do Cliente</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">Nome:</p>
                        <p className="text-blue-900 break-words">{clienteSelecionado.nome}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Email:</p>
                        <p className="text-blue-900 break-all">{clienteSelecionado.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Telefone:</p>
                        <p className="text-blue-900">{clienteSelecionado.telefone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Endereço:</p>
                        <p className="text-blue-900 break-words">{clienteSelecionado.endereco}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão Próximo */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGerarContrato}
                    disabled={loading || !contrato.clienteId || !contrato.templateId || !contrato.valor}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <ArrowRight size={20} />
                        Próximo
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: PAGAMENTO */}
            {etapa === 'pagamento' && (
              <div className="space-y-6">
                {/* Resumo do Contrato */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-900 mb-3">Resumo do Contrato</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p><strong>Cliente:</strong> {clienteSelecionado?.nome}</p>
                    <p><strong>Template:</strong> {templateSelecionado?.nome}</p>
                    <p><strong>Valor:</strong> R$ {parseFloat(contrato.valor).toFixed(2)}</p>
                    <p><strong>Status:</strong> Aguardando Pagamento</p>
                  </div>
                </div>

                {/* Seleção de Plataforma de Pagamento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Selecione a Plataforma de Pagamento *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Stripe */}
                    <button
                      onClick={() => setContrato(prev => ({ ...prev, formaPagamento: 'stripe' }))}
                      className={`p-6 border-2 rounded-lg transition flex items-center gap-4 ${
                        contrato.formaPagamento === 'stripe'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${contrato.formaPagamento === 'stripe' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        💳
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Stripe</p>
                        <p className="text-sm text-gray-600">Cartão de crédito/débito</p>
                      </div>
                      {contrato.formaPagamento === 'stripe' && (
                        <Check size={20} className="ml-auto text-emerald-600" />
                      )}
                    </button>

                    {/* Mercado Pago */}
                    <button
                      onClick={() => setContrato(prev => ({ ...prev, formaPagamento: 'mercado_pago' }))}
                      className={`p-6 border-2 rounded-lg transition flex items-center gap-4 ${
                        contrato.formaPagamento === 'mercado_pago'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${contrato.formaPagamento === 'mercado_pago' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        💰
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Mercado Pago</p>
                        <p className="text-sm text-gray-600">Múltiplas formas de pagamento</p>
                      </div>
                      {contrato.formaPagamento === 'mercado_pago' && (
                        <Check size={20} className="ml-auto text-emerald-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Botões de Navegação */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEtapa('selecao')}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={handleConfirmarPagamento}
                    disabled={!contrato.formaPagamento}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={20} />
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: REVIEW */}
            {etapa === 'review' && (
              <div className="space-y-6">
                {/* Resumo Final */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dados do Contrato */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Detalhes do Contrato</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p><strong>Cliente:</strong> {clienteSelecionado?.nome}</p>
                      <p><strong>Email:</strong> {clienteSelecionado?.email}</p>
                      <p><strong>Template:</strong> {templateSelecionado?.nome}</p>
                      <p><strong>Valor:</strong> R$ {parseFloat(contrato.valor).toFixed(2)}</p>
                      <p><strong>Plataforma:</strong> {contrato.formaPagamento === 'stripe' ? 'Stripe' : 'Mercado Pago'}</p>
                    </div>
                  </div>

                  {/* Link de Pagamento */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">Link de Pagamento</h3>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={contrato.linkPagamento}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm font-mono text-green-800"
                        />
                        <button
                          onClick={() => handleCopyToClipboard(contrato.linkPagamento, 'link')}
                          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                      {copiedField === 'link' && (
                        <p className="text-xs text-green-700 font-semibold">✅ Copiado!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview do Contrato */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Prévia do Contrato</h3>
                  </div>
                  <div className="bg-white p-6 h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700 leading-relaxed">
                      {contrato.conteudo}
                    </pre>
                  </div>
                </div>

                {/* Template de Email para Cliente */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail size={20} className="text-orange-600" />
                    <h3 className="font-semibold text-orange-900">Email para Enviar ao Cliente</h3>
                  </div>
                  <div className="bg-white border border-orange-200 rounded p-4 space-y-2 text-sm">
                    <p><strong>Assunto:</strong> Contrato - {templateSelecionado?.nome}</p>
                    <p><strong>Corpo:</strong></p>
                    <p className="text-gray-700 whitespace-pre-wrap">
{`Olá ${clienteSelecionado?.nome},

Segue em anexo o contrato para sua análise e assinatura.

💳 Link para Pagamento:
${contrato.linkPagamento}

Plataforma: ${contrato.formaPagamento === 'stripe' ? 'Stripe' : 'Mercado Pago'}
Valor: R$ ${parseFloat(contrato.valor).toFixed(2)}

Qualquer dúvida, estou à disposição!

Atenciosamente`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const emailText = `${clienteSelecionado?.nome},\n\nLink: ${contrato.linkPagamento}\nValor: R$ ${parseFloat(contrato.valor).toFixed(2)}`
                      handleCopyToClipboard(emailText, 'email')
                    }}
                    className="mt-3 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Copiar Email {copiedField === 'email' && '✅'}
                  </button>
                </div>

                {/* Botões Finais */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEtapa('pagamento')}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={handleEnviarCliente}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail size={20} />
                        Enviar ao Cliente
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  )
}
