export interface ContratoTemplate {
  id: string
  nome: string
  tipo: 'servico' | 'consultoria' | 'assessoria' | 'outro'
  descricao: string
  conteudoHtml: string
  campos: TemplateCampo[]
}

export interface TemplateCampo {
  id: string
  nome: string
  placeholder: string
  tipo: 'text' | 'textarea' | 'numero'
}

export interface FormasPagamento {
  id: string
  tipo: 'dinheiro' | 'cartao' | 'boleto' | 'pix' | 'transferencia'
  nome: string
  icone: string
}

export interface ParcelaPagamento {
  numero: number
  valor: number
  dataPagamento?: string
  forma: 'dinheiro' | 'cartao' | 'boleto' | 'pix' | 'transferencia'
  descricao?: string
}

export const CONTRATOS_TEMPLATES: ContratoTemplate[] = [
  {
    id: 'servico-1',
    nome: 'Prestação de Serviços - Padrão',
    tipo: 'servico',
    descricao: 'Contrato para prestação de serviços gerais',
    conteudoHtml: `
      <h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
      <p><strong>CONTRATANTE:</strong> [CLIENTE_NOME]</p>
      <p><strong>CONTRATADA:</strong> Bora Expandir Ltda</p>
      <p><strong>CNPJ:</strong> 00.000.000/0000-00</p>
      <br/>
      <h3>CLÁUSULA 1ª - DO OBJETO</h3>
      <p>O presente contrato tem por objeto a prestação de serviços de [SERVICO_DESCRICAO].</p>
      <br/>
      <h3>CLÁUSULA 2ª - DO VALOR</h3>
      <p>O valor total dos serviços é de R$ [VALOR_TOTAL], conforme condições de pagamento estabelecidas.</p>
      <br/>
      <h3>CLÁUSULA 3ª - DO PRAZO</h3>
      <p>O prazo de execução dos serviços é de [PRAZO_DIAS] dias a partir da assinatura deste contrato.</p>
      <br/>
      <h3>CLÁUSULA 4ª - DAS CONDIÇÕES DE PAGAMENTO</h3>
      <p>[CONDICOES_PAGAMENTO]</p>
      <br/>
      <h3>CLÁUSULA 5ª - DISPOSIÇÕES GERAIS</h3>
      <p>Este contrato é válido e vinculante entre as partes.</p>
    `,
    campos: [
      { id: 'cliente_nome', nome: 'Nome do Cliente', placeholder: 'Empresa ou Pessoa', tipo: 'text' },
      { id: 'servico_descricao', nome: 'Descrição do Serviço', placeholder: 'Detalhe o serviço', tipo: 'textarea' },
      { id: 'valor_total', nome: 'Valor Total (R$)', placeholder: '10000.00', tipo: 'numero' },
      { id: 'prazo_dias', nome: 'Prazo em Dias', placeholder: '30', tipo: 'numero' },
    ]
  },
  {
    id: 'consultoria-1',
    nome: 'Consultoria - Padrão',
    tipo: 'consultoria',
    descricao: 'Contrato para serviços de consultoria',
    conteudoHtml: `
      <h2>CONTRATO DE CONSULTORIA</h2>
      <p><strong>CLIENTE:</strong> [CLIENTE_NOME]</p>
      <p><strong>CONSULTORA:</strong> Bora Expandir Ltda</p>
      <br/>
      <h3>OBJETO</h3>
      <p>Prestação de serviços de consultoria em [AREA_CONSULTORIA].</p>
      <br/>
      <h3>VALOR</h3>
      <p>Investimento total de R$ [VALOR_TOTAL].</p>
      <br/>
      <h3>DURAÇÃO</h3>
      <p>O projeto terá duração de [DURACAO_MESES] meses.</p>
    `,
    campos: [
      { id: 'cliente_nome', nome: 'Nome do Cliente', placeholder: 'Empresa ou Pessoa', tipo: 'text' },
      { id: 'area_consultoria', nome: 'Área de Consultoria', placeholder: 'Ex: Marketing Digital', tipo: 'text' },
      { id: 'valor_total', nome: 'Valor Total (R$)', placeholder: '10000.00', tipo: 'numero' },
      { id: 'duracao_meses', nome: 'Duração (meses)', placeholder: '3', tipo: 'numero' },
    ]
  },
  {
    id: 'assessoria-1',
    nome: 'Assessoria - Padrão',
    tipo: 'assessoria',
    descricao: 'Contrato para serviços de assessoria',
    conteudoHtml: `
      <h2>CONTRATO DE ASSESSORIA</h2>
      <p><strong>CLIENTE:</strong> [CLIENTE_NOME]</p>
      <p><strong>ASSESSORA:</strong> Bora Expandir Ltda</p>
      <br/>
      <p><strong>DESCRIÇÃO DOS SERVIÇOS:</strong> [DESCRICAO_ASSESSORIA]</p>
      <p><strong>VALOR:</strong> R$ [VALOR_TOTAL]</p>
    `,
    campos: [
      { id: 'cliente_nome', nome: 'Nome do Cliente', placeholder: 'Empresa ou Pessoa', tipo: 'text' },
      { id: 'descricao_assessoria', nome: 'Descrição', placeholder: 'Detalhe os serviços', tipo: 'textarea' },
      { id: 'valor_total', nome: 'Valor Total (R$)', placeholder: '10000.00', tipo: 'numero' },
    ]
  },
]

export const FORMAS_PAGAMENTO: FormasPagamento[] = [
  { id: 'dinheiro', tipo: 'dinheiro', nome: 'Dinheiro / Transferência', icone: '💵' },
  { id: 'cartao', tipo: 'cartao', nome: 'Cartão de Crédito', icone: '💳' },
  { id: 'boleto', tipo: 'boleto', nome: 'Boleto Bancário', icone: '🏦' },
  { id: 'pix', tipo: 'pix', nome: 'PIX', icone: '⚡' },
  { id: 'transferencia', tipo: 'transferencia', nome: 'Transferência Bancária', icone: '🏧' },
]
