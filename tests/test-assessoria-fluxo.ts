/**
 * Script de teste do fluxo de criação de assessoria jurídica
 *
 * Uso:
 * npx ts-node tests/test-assessoria-fluxo.ts
 *
 * Ou com NODE_ENV:
 * NODE_ENV=test npx ts-node tests/test-assessoria-fluxo.ts --cliente-id UUID --token JWT
 */

import axios, { AxiosError } from 'axios';

// ============================================================================
// CONFIG
// ============================================================================

interface TestConfig {
  baseUrl: string;
  token: string;
  clienteId: string;
  responsavelId: string;
  servicoId?: string;
  agendamentoId?: string;
  verbose: boolean;
}

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

const config: TestConfig = {
  baseUrl: API_BASE,
  token: process.env.JWT_TOKEN || '',
  clienteId: process.env.CLIENTE_ID || '',
  responsavelId: process.env.RESPONSAVEL_ID || '',
  servicoId: process.env.SERVICO_ID,
  agendamentoId: process.env.AGENDAMENTO_ID,
  verbose: process.env.VERBOSE === 'true'
};

// ============================================================================
// TIPOS
// ============================================================================

interface RespostasAssessoria {
  servico_contratado: string;
  titular_nome: string;
  dependentes_info: string;
  pedido_para: 'titular_somente' | 'titular_dependentes';
  pedido_para_detalhe: string;
  local_solicitacao: 'consulado' | 'espanha';
  consulado_cidade: string;
  cidade_protocolo: string;
  cidade_chegada: string;
  data_chegada: string;
  resumo_executivo: string;
  docs_titular: string;
  docs_dependentes: string;
  orientacoes_praticas: string;
  duvidas_cliente: string;
  respostas_dadas: string;
  pontos_fracos: string;
  prazos_delicados: string;
  proximos_cliente: string;
  proximos_equipe: string;
  resumo_1_linha: string;
}

interface CreateAssessoriaPayload {
  clienteId: string;
  respostas: RespostasAssessoria;
  observacoes?: string;
  responsavelId?: string;
  servicoId?: string;
}

// ============================================================================
// UTILIDADES
// ============================================================================

class Logger {
  static info(msg: string, data?: any) {
    console.log(`✓ ${msg}`);
    if (data && config.verbose) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  static error(msg: string, error?: any) {
    console.error(`✗ ${msg}`);
    if (error && config.verbose) {
      if (error.response?.data) {
        console.error(JSON.stringify(error.response.data, null, 2));
      } else {
        console.error(error.message);
      }
    }
  }

  static section(title: string) {
    console.log('\n' + '='.repeat(70));
    console.log(`  ${title}`);
    console.log('='.repeat(70) + '\n');
  }

  static debug(msg: string, data?: any) {
    if (config.verbose) {
      console.log(`[DEBUG] ${msg}`);
      if (data) console.log(JSON.stringify(data, null, 2));
    }
  }
}

// ============================================================================
// API CLIENT
// ============================================================================

const apiClient = axios.create({
  baseURL: config.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.token}`
  }
});

// ============================================================================
// DADOS DE TESTE
// ============================================================================

function gerarRespostasAssessoria(): RespostasAssessoria {
  const now = new Date();
  const dataChegada = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 dias no futuro

  return {
    servico_contratado: 'Viagem para Espanha - Visto de Longa Duração',
    titular_nome: 'João Pedro Silva',
    dependentes_info: 'Esposa: Maria Silva, Filhos: Pedro (8 anos), Ana (5 anos)',
    pedido_para: 'titular_dependentes',
    pedido_para_detalhe: 'Visto de residência para toda a família',
    local_solicitacao: 'espanha',
    consulado_cidade: 'Madri',
    cidade_protocolo: 'Madri',
    cidade_chegada: 'Barcelona',
    data_chegada: dataChegada.toISOString().split('T')[0],
    resumo_executivo:
      'Família com perfil baixo risco. Documentação completa e organizada. ' +
      'Renda comprovada através de contrato de trabalho. Aprovação prevista em 30-45 dias.',
    docs_titular:
      'Passaporte válido (vencimento 2028), Extrato bancário 3 últimos meses, ' +
      'Contrato de trabalho com assinatura de empresa, Certificado de antecedentes',
    docs_dependentes:
      'Passaportes válidos, Certidão de nascimento com tradução apostilada, ' +
      'Comprovante de vacinação',
    orientacoes_praticas:
      'Comparecer pessoalmente ao consulado. Trazer originais + 2 cópias simples. ' +
      'Agendamento online com 15 dias de antecedência mínima.',
    duvidas_cliente:
      'Qual é o prazo exato? Qual o custo total? Precisa de seguro de viagem?',
    respostas_dadas:
      'Prazo: 30-45 dias após entrevista. Custo: €500 por pessoa + €100 por dependente menor. ' +
      'Seguro recomendado mas não obrigatório.',
    pontos_fracos:
      'Documentação de renda poderia incluir extratos de investimentos. ' +
      'Histórico de trabalho poderia ser mais consolidado (15 meses no atual emprego).',
    prazos_delicados:
      'Passaporte da esposa vence em 10 meses (deve ser renovado antes se planejam ficar). ' +
      'Decisão do visto deve sair 60 dias antes da viagem planejada.',
    proximos_cliente:
      'Preparar documentação traduzida até 10/04. Confirmar datas de viagem com companhia aérea. ' +
      'Agendar entrevista consular.',
    proximos_equipe:
      'Revisar documentação traduzida. Preparar carta de apoio. ' +
      'Acompanhar status da solicitação no portal do consulado.',
    resumo_1_linha:
      'Viagem familiar para Barcelona com aprovação de visto esperada em 45 dias, ' +
      'documentação completa, sem impedimentos aparentes'
  };
}

// ============================================================================
// TESTES
// ============================================================================

async function testCreateAssessoria(): Promise<{ assessoriaId: string } | null> {
  Logger.section('TESTE 1: Criar Assessoria Jurídica');

  try {
    const payload: CreateAssessoriaPayload = {
      clienteId: config.clienteId,
      respostas: gerarRespostasAssessoria(),
      observacoes: 'Teste automatizado - Cliente com perfil baixo risco',
      responsavelId: config.responsavelId,
      servicoId: config.servicoId
    };

    Logger.debug('Payload enviado:', payload);

    const response = await apiClient.post('/juridico/assessoria', payload);

    Logger.info('Assessoria criada com sucesso');
    Logger.debug('Resposta:', response.data);

    return {
      assessoriaId: response.data.data.id
    };
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao criar assessoria', err);
    return null;
  }
}

async function testGetLatestAssessoria(): Promise<boolean> {
  Logger.section('TESTE 2: Obter Última Assessoria');

  try {
    const response = await apiClient.get(`/juridico/assessoria/${config.clienteId}`);

    Logger.info('Assessoria recuperada com sucesso');
    Logger.debug('Dados:', {
      id: response.data.data.id,
      cliente_id: response.data.data.cliente_id,
      responsavel_id: response.data.data.responsavel_id,
      criado_em: response.data.data.criado_em
    });

    return true;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao obter assessoria', err);
    return false;
  }
}

async function testGetProcessoSincronizado(): Promise<boolean> {
  Logger.section('TESTE 3: Obter Processo Sincronizado');

  try {
    const response = await apiClient.get(`/juridico/processo-cliente/${config.clienteId}`);

    Logger.info('Processo recuperado com sucesso');
    Logger.debug('Dados do processo:', {
      id: response.data.data.id,
      cliente_id: response.data.data.cliente_id,
      tipo_servico: response.data.data.tipo_servico,
      status: response.data.data.status,
      etapa_atual: response.data.data.etapa_atual,
      documentos_count: response.data.data.documentos?.length || 0
    });

    if (response.data.data.documentos) {
      Logger.debug(
        'Documentos mapeados:',
        response.data.data.documentos.map((d: any) => ({
          nome: d.nome,
          status: d.status,
          obrigatorio: d.obrigatorio
        }))
      );
    }

    return true;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao obter processo', err);
    return false;
  }
}

async function testMarcarAssessoriaEmAndamento(): Promise<boolean> {
  Logger.section('TESTE 4: Marcar Assessoria como Em Andamento');

  if (!config.agendamentoId) {
    console.warn('⚠️  AGENDAMENTO_ID não fornecido, pulando teste 4');
    return false;
  }

  try {
    const response = await apiClient.post(
      `/juridico/agendamentos/${config.agendamentoId}/assessoria-em-andamento`,
      {}
    );

    Logger.info('Assessoria marcada como em andamento');
    Logger.debug('Resposta:', response.data);

    return true;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao marcar em andamento', err);
    return false;
  }
}

async function testValidationError(): Promise<boolean> {
  Logger.section('TESTE 5: Validação - Campos Obrigatórios Faltando');

  try {
    const payload = {
      clienteId: config.clienteId
      // Faltando: respostas
    };

    Logger.debug('Enviando payload incompleto:', payload);

    await apiClient.post('/juridico/assessoria', payload);

    Logger.error('Deveria ter falhado mas não falhou!');
    return false;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 400 || err.response?.status === 500) {
      Logger.info('Validação funcionando corretamente');
      Logger.debug('Erro esperado:', err.response?.data);
      return true;
    }
    Logger.error('Erro inesperado', err);
    return false;
  }
}

// ============================================================================
// RELATÓRIO
// ============================================================================

interface TestResult {
  nome: string;
  passou: boolean;
  tempo?: number;
}

async function executarTodosOsTestes(): Promise<TestResult[]> {
  const resultados: TestResult[] = [];

  // Validar config
  if (!config.token) {
    console.error('❌ JWT_TOKEN não fornecido');
    process.exit(1);
  }

  if (!config.clienteId) {
    console.error('❌ CLIENTE_ID não fornecido');
    process.exit(1);
  }

  if (!config.responsavelId) {
    console.error('❌ RESPONSAVEL_ID não fornecido');
    process.exit(1);
  }

  console.log('\n' + '█'.repeat(70));
  console.log('  TESTE DE FLUXO: ASSESSORIA JURÍDICA');
  console.log('█'.repeat(70));
  console.log(`\nConfigurações:`);
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  Cliente ID: ${config.clienteId}`);
  console.log(`  Responsável ID: ${config.responsavelId}`);
  console.log(`  Serviço ID: ${config.servicoId || 'Não informado'}`);
  console.log(`  Agendamento ID: ${config.agendamentoId || 'Não informado'}`);
  console.log(`  Verbose: ${config.verbose}`);

  // Teste 1
  let tempo = Date.now();
  const result1 = await testCreateAssessoria();
  resultados.push({
    nome: 'Criar Assessoria',
    passou: !!result1,
    tempo: Date.now() - tempo
  });

  // Teste 2
  tempo = Date.now();
  const result2 = await testGetLatestAssessoria();
  resultados.push({
    nome: 'Obter Última Assessoria',
    passou: result2,
    tempo: Date.now() - tempo
  });

  // Teste 3
  tempo = Date.now();
  const result3 = await testGetProcessoSincronizado();
  resultados.push({
    nome: 'Obter Processo Sincronizado',
    passou: result3,
    tempo: Date.now() - tempo
  });

  // Teste 4
  if (config.agendamentoId) {
    tempo = Date.now();
    const result4 = await testMarcarAssessoriaEmAndamento();
    resultados.push({
      nome: 'Marcar Em Andamento',
      passou: result4,
      tempo: Date.now() - tempo
    });
  }

  // Teste 5
  tempo = Date.now();
  const result5 = await testValidationError();
  resultados.push({
    nome: 'Validação de Campos',
    passou: result5,
    tempo: Date.now() - tempo
  });

  return resultados;
}

function gerarRelatorio(resultados: TestResult[]): void {
  Logger.section('RELATÓRIO FINAL');

  console.log('Resultados:');
  resultados.forEach((r) => {
    const status = r.passou ? '✅ PASSOU' : '❌ FALHOU';
    const tempo = r.tempo ? ` (${r.tempo}ms)` : '';
    console.log(`  ${status} - ${r.nome}${tempo}`);
  });

  const totalPassou = resultados.filter((r) => r.passou).length;
  const totalTestes = resultados.length;
  const percentual = Math.round((totalPassou / totalTestes) * 100);

  console.log('\n' + '─'.repeat(70));
  console.log(
    `Resumo: ${totalPassou}/${totalTestes} testes passaram (${percentual}%)`
  );
  console.log('─'.repeat(70) + '\n');

  if (totalPassou === totalTestes) {
    console.log('🎉 Todos os testes passaram!');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os logs acima.');
    process.exit(1);
  }
}

// ============================================================================
// MAIN
// ============================================================================

(async () => {
  try {
    const resultados = await executarTodosOsTestes();
    gerarRelatorio(resultados);
  } catch (error) {
    console.error('Erro crítico:', error);
    process.exit(1);
  }
})();
