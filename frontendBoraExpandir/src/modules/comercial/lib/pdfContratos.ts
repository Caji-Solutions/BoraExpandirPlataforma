// Mock de templates de contratos em PDF
// Cada template recebe dados do cliente dinamicamente

export interface ContratoPdfTemplate {
  id: string
  nome: string
  descricao: string
  tipo: 'servico' | 'consultoria' | 'parceria'
  gerar: (clienteData: ClienteDataPdf, dadosAdicionais: Record<string, string>) => string
}

export interface ClienteDataPdf {
  nome: string
  email: string
  telefone: string
  cpf?: string
  cnpj?: string
  endereco?: string
  cidade?: string
  estado?: string
}

// Função utilitária para formatar data
const formatarData = (data: Date = new Date()): string => {
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  return `${dia} de ${obterMesExtenso(data.getMonth())} de ${ano}`
}

const obterMesExtenso = (mes: number): string => {
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  return meses[mes]
}

// Template 1: Contrato de Serviço
const gerarContratoServico = (cliente: ClienteDataPdf, dados: Record<string, string>): string => {
  return `
CONTRATO DE PRESTAÇÃO DE SERVIÇO

PARTES:

PRESTADORA DE SERVIÇO: Bora Expandir Consultoria
CNPJ: XX.XXX.XXX/0001-XX
Endereço: São Paulo, SP

CONTRATANTE: ${cliente.nome}
${cliente.cpf ? `CPF: ${cliente.cpf}` : `CNPJ: ${cliente.cnpj || 'A PREENCHIDO'}`}
Email: ${cliente.email}
Telefone: ${cliente.telefone}
Endereço: ${cliente.endereco || 'A PREENCHIDO'}
${cliente.cidade ? `Cidade: ${cliente.cidade}, ${cliente.estado}` : ''}

---

1. DO OBJETO DO CONTRATO

A PRESTADORA se compromete a prestar serviço de ${dados.tipoServico || 'consultoria empresarial'} 
conforme descrito a seguir:

Descrição do Serviço: ${dados.descricaoServico || 'Consultoria especializada em crescimento empresarial'}
Data de Início: ${dados.dataInicio || 'A DEFINIR'}
Data de Término: ${dados.dataTermino || 'A DEFINIR'}
Duração: ${dados.duracao || '30 dias'}

---

2. DO VALOR E CONDIÇÕES DE PAGAMENTO

Valor Total: R$ ${dados.valorTotal || '0,00'}
Forma de Pagamento: ${dados.formaPagamento || 'Transferência bancária'}
Prazo de Pagamento: ${dados.prazoPagamento || 'À vista'}

---

3. DAS OBRIGAÇÕES

3.1 DA PRESTADORA:
- Executar os serviços com profissionalismo e dedicação
- Manter sigilo sobre informações confidenciais
- Cumprir prazos acordados

3.2 DO CONTRATANTE:
- Efetuar o pagamento conforme acordado
- Fornecer informações necessárias para execução dos serviços
- Comunicar alterações solicitadas com antecedência

---

4. DA RESCISÃO

Este contrato poderá ser rescindido por qualquer uma das partes com 15 dias de antecedência.

---

Assinado em ${formatarData()},

_______________________________
${cliente.nome}
Contratante

_______________________________
Representante da Bora Expandir
Prestadora
  `.trim()
}

// Template 2: Contrato de Consultoria
const gerarContratoConsultoria = (cliente: ClienteDataPdf, dados: Record<string, string>): string => {
  return `
CONTRATO DE CONSULTORIA EMPRESARIAL

IDENTIFICAÇÃO DAS PARTES:

CONSULTORIA: Bora Expandir
CNPJ: XX.XXX.XXX/0001-XX

CLIENTE: ${cliente.nome}
${cliente.cpf ? `CPF: ${cliente.cpf}` : `CNPJ: ${cliente.cnpj || 'A PREENCHIDO'}`}
Email: ${cliente.email}
Telefone: ${cliente.telefone}
Endereço: ${cliente.endereco || 'A PREENCHIDO'}

---

1. DO ESCOPO DA CONSULTORIA

Área de Consultoria: ${dados.areaConsultoria || 'Estratégia Empresarial'}
Objetivos: ${dados.objetivos || 'Diagnóstico e otimização de processos'}
Metodologia: ${dados.metodologia || 'Análise, diagnóstico e recomendações'}

---

2. DURAÇÃO E AGENDAMENTO

Período: ${dados.periodoConsultoria || '3 meses'}
Frequência: ${dados.frequencia || 'Semanal'}
Formato: ${dados.formato || 'Presencial/Online'}

---

3. INVESTIMENTO

Valor da Consultoria: R$ ${dados.valorConsultoria || '0,00'}
Forma de Pagamento: ${dados.formaPagamento || 'Mensal'}
Primeira Parcela: ${dados.primeiraParc || 'Data de assinatura'}

---

4. RESPONSABILIDADES

4.1 DA CONSULTORIA:
- Fornecedor expertise e conhecimento especializado
- Entregar relatórios e recomendações documentadas
- Manter confidencialidade das informações

4.2 DO CLIENTE:
- Fornecer acesso às informações necessárias
- Disponibilizar pessoas-chave para entrevistas
- Implementar as recomendações fornecidas

---

5. PROPRIEDADE INTELECTUAL

Todos os documentos e relatórios gerados são propriedade do cliente após o pagamento integral.

---

Assinado em ${formatarData()},

_______________________________
${cliente.nome}
Cliente

_______________________________
Representante da Bora Expandir
Consultoria
  `.trim()
}

// Template 3: Contrato de Parceria
const gerarContratoParceria = (cliente: ClienteDataPdf, dados: Record<string, string>): string => {
  return `
CONTRATO DE PARCERIA COMERCIAL

PARTES:

PARCEIRA 1: Bora Expandir
CNPJ: XX.XXX.XXX/0001-XX
Representante: A DEFINIR

PARCEIRA 2: ${cliente.nome}
${cliente.cpf ? `CPF: ${cliente.cpf}` : `CNPJ: ${cliente.cnpj || 'A PREENCHIDO'}`}
Email: ${cliente.email}
Telefone: ${cliente.telefone}
Endereço: ${cliente.endereco || 'A PREENCHIDO'}

---

1. DO OBJETO DA PARCERIA

Tipo de Parceria: ${dados.tipoParceria || 'Consultoria e Suporte'}
Descrição: ${dados.descricaoParceria || 'Colaboração mútua para crescimento de negócios'}
Escopo: ${dados.scopoParceria || 'Consultoria especializada e acompanhamento'}

---

2. DOS DIREITOS E DEVERES

2.1 BORA EXPANDIR:
- Fornecer serviços conforme acordado
- Manter comunicação regular
- Suporte técnico e consultivo

2.2 PARCEIRA:
- Cumprir prazos de pagamento
- Fornecer feedback e informações necessárias
- Participar de alinhamentos periódicos

---

3. FINANCEIRO

Valor da Parceria: R$ ${dados.valorParceria || '0,00'}
Prazo: ${dados.prazoParceria || '12 meses'}
Revisão de Preços: ${dados.revisaoPaco || 'Anual'}

---

4. CONFIDENCIALIDADE E NÃO-CONCORRÊNCIA

As partes se comprometem a:
- Manter sigilo de informações confidenciais
- Não divulgar dados da outra parte
- Não concorrer diretamente durante a vigência

---

5. VIGÊNCIA E ENCERRAMENTO

Início: ${dados.dataInicioParceria || 'Data de assinatura'}
Fim: ${dados.dataTerminoParceria || 'A definir'}
Renovação automática: ${dados.renovacao || 'Não'} 

---

Assinado em ${formatarData()},

_______________________________
${cliente.nome}
Parceira

_______________________________
Representante da Bora Expandir
Parceira
  `.trim()
}

// Array com todos os templates disponíveis
export const CONTRATOS_PDF_MOCK: ContratoPdfTemplate[] = [
  {
    id: 'contrato_servico',
    nome: 'Contrato de Serviço',
    descricao: 'Para prestação de serviços específicos',
    tipo: 'servico',
    gerar: gerarContratoServico
  },
  {
    id: 'contrato_consultoria',
    nome: 'Contrato de Consultoria',
    descricao: 'Para consultoria empresarial',
    tipo: 'consultoria',
    gerar: gerarContratoConsultoria
  },
  {
    id: 'contrato_parceria',
    nome: 'Contrato de Parceria',
    descricao: 'Para parcerias comerciais',
    tipo: 'parceria',
    gerar: gerarContratoParceria
  }
]

// Função para gerar PDF como string (simulação)
export const gerarContatoPdfString = (
  templateId: string,
  cliente: ClienteDataPdf,
  dadosAdicionais: Record<string, string> = {}
): string | null => {
  const template = CONTRATOS_PDF_MOCK.find(t => t.id === templateId)
  if (!template) return null
  
  return template.gerar(cliente, dadosAdicionais)
}

// Função para simular download de PDF
export const simularDownloadPdf = (conteudo: string, nomeArquivo: string) => {
  // Criar blob com o conteúdo
  const blob = new Blob([conteudo], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  
  // Criar link e fazer download
  const link = document.createElement('a')
  link.href = url
  link.download = `${nomeArquivo}.pdf`
  document.body.appendChild(link)
  link.click()
  
  // Limpar
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
