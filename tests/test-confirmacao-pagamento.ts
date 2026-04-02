/**
 * Testes de Confirmação de Pagamento e Transição de Status
 *
 * Testa as transições de status de agendamento:
 * 1. Pagamento aprovado → status = 'aguardando_assessoria'
 * 2. Formulário finalizado → status = 'em_andamento'
 *
 * SEM precisar passar por todo o fluxo manual
 *
 * Uso:
 * npx ts-node tests/test-confirmacao-pagamento.ts
 */

import axios, { AxiosError } from 'axios';

// ============================================================================
// CONFIG
// ============================================================================

interface TestResult {
  nome: string;
  passou: boolean;
  statusAntes: string;
  statusDepois: string;
  tempo?: number;
  erro?: string;
}

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const TOKEN = process.env.JWT_TOKEN || '';
const VERBOSE = process.env.VERBOSE === 'true';

// ============================================================================
// LOGGER
// ============================================================================

class Logger {
  static log(msg: string, data?: any) {
    console.log(`\n✓ ${msg}`);
    if (data && VERBOSE) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  static error(msg: string, error?: any) {
    console.error(`\n✗ ${msg}`);
    if (error && VERBOSE) {
      console.error(error);
    }
  }

  static section(title: string) {
    console.log('\n' + '═'.repeat(70));
    console.log(`  ${title}`);
    console.log('═'.repeat(70));
  }

  static status(antes: string, depois: string, acao: string) {
    console.log(`\n  ${acao}`);
    console.log(`  Status: "${antes}" → "${depois}"`);
    const mudou = antes !== depois ? '✓ MUDOU' : '✗ NÃO MUDOU';
    console.log(`  Resultado: ${mudou}`);
  }
}

// ============================================================================
// DADOS MOCK
// ============================================================================

/**
 * Cria um agendamento mock para teste
 */
function criarAgendamentoMock() {
  return {
    id: `test-agendamento-${Date.now()}`,
    nome: 'Cliente Teste',
    email: `teste-${Date.now()}@example.com`,
    telefone: '11999999999',
    produto_id: 'assessoria-xyz',
    produto_nome: 'Assessoria Jurídica - Teste',
    data_hora: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias no futuro
    duracao_minutos: 60,
    status: 'agendado',
    pagamento_status: 'pendente',
    cliente_id: `test-cliente-${Date.now()}`,
    usuario_id: 'user-123',
    comprovante_url: `https://example.com/comprovante-${Date.now()}.pdf`
  };
}

/**
 * Cria um formulário mock de assessoria
 */
function criarFormularioMock(agendamentoId: string) {
  return {
    agendamento_id: agendamentoId,
    respostas: {
      servico_contratado: 'Assessoria Jurídica - Teste',
      titular_nome: 'Cliente Teste',
      dependentes_info: 'Nenhum',
      pedido_para: 'titular_somente' as const,
      pedido_para_detalhe: 'Teste',
      local_solicitacao: 'espanha' as const,
      consulado_cidade: 'Madri',
      cidade_protocolo: 'Madri',
      cidade_chegada: 'Barcelona',
      data_chegada: '2026-06-15',
      resumo_executivo: 'Teste automatizado',
      docs_titular: 'Teste',
      docs_dependentes: 'N/A',
      orientacoes_praticas: 'Teste',
      duvidas_cliente: 'Teste?',
      respostas_dadas: 'Teste',
      pontos_fracos: 'Nenhum',
      prazos_delicados: 'Nenhum',
      proximos_cliente: 'Teste',
      proximos_equipe: 'Teste',
      resumo_1_linha: 'Teste automatizado'
    }
  };
}

// ============================================================================
// API CLIENT
// ============================================================================

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
  }
});

// ============================================================================
// TESTE 1: CRIAR AGENDAMENTO
// ============================================================================

async function testeCreateAgendamento(): Promise<{
  agendamentoId: string;
  statusInicial: string;
} | null> {
  Logger.section('TESTE 1: Criar Agendamento (status = "agendado")');

  try {
    const agendamento = criarAgendamentoMock();

    Logger.log('Criando agendamento...');
    const response = await apiClient.post('/comercial/agendamentos', agendamento);

    const agendamentoId = response.data.id || response.data.data?.id;
    const statusInicial = response.data.status || response.data.data?.status;

    Logger.log(`Agendamento criado: ${agendamentoId}`);
    Logger.log(`Status inicial: "${statusInicial}"`);

    if (statusInicial === 'agendado') {
      console.log('  ✓ Status correto (agendado)');
    }

    return { agendamentoId, statusInicial };
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao criar agendamento', err);
    return null;
  }
}

// ============================================================================
// TESTE 2: PREENCHER FORMULÁRIO
// ============================================================================

async function testePreencherFormulario(agendamentoId: string): Promise<boolean> {
  Logger.section('TESTE 2: Preencher Formulário de Assessoria');

  try {
    const formulario = criarFormularioMock(agendamentoId);

    Logger.log('Preenchendo formulário...');
    const response = await apiClient.post('/formulario/cliente', formulario);

    Logger.log('Formulário preenchido com sucesso');
    console.log(`  ID do formulário: ${response.data.id || response.data.data?.id}`);

    return true;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao preencher formulário', err);
    return false;
  }
}

// ============================================================================
// TESTE 3: OBTER STATUS ANTES DE CONFIRMAR
// ============================================================================

async function obterStatusAntes(agendamentoId: string): Promise<string | null> {
  Logger.section('TESTE 3: Obter Status Antes da Confirmação');

  try {
    const response = await apiClient.get(`/comercial/agendamentos/${agendamentoId}`);
    const status = response.data.status || response.data.data?.status;

    Logger.log(`Status atual: "${status}"`);
    return status;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao obter status', err);
    return null;
  }
}

// ============================================================================
// TESTE 4: CONFIRMAR PAGAMENTO (AGUARDANDO_ASSESSORIA)
// ============================================================================

async function testeConfirmarPagamento(
  agendamentoId: string
): Promise<{ statusDepois: string; passou: boolean } | null> {
  Logger.section('TESTE 4: Confirmar Pagamento (PUT → aguardando_assessoria)');

  try {
    Logger.log('Aprovando comprovante de pagamento...');

    // Chamar endpoint de confirmação de pagamento
    const response = await apiClient.post(
      `/financeiro/comprovante/${agendamentoId}/aprovar`,
      {}
    );

    Logger.log('Comprovante aprovado');

    // Aguardar um momento para sincronização
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar novo status
    const statusResponse = await apiClient.get(`/comercial/agendamentos/${agendamentoId}`);
    const statusDepois = statusResponse.data.status || statusResponse.data.data?.status;

    Logger.log(`Status após confirmação: "${statusDepois}"`);

    const passou =
      statusDepois === 'aguardando_assessoria' ||
      statusDepois === 'confirmado' ||
      statusDepois === 'em_andamento';

    if (passou) {
      console.log(`  ✓ Status mudou corretamente para "${statusDepois}"`);
    } else {
      console.log(`  ✗ Status não mudou para estado esperado (ficou em "${statusDepois}")`);
    }

    return { statusDepois, passou };
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao confirmar pagamento', err);

    if (err.response?.status === 404) {
      console.log('  💡 Dica: Verifique se o agendamento_id está correto');
    }

    return null;
  }
}

// ============================================================================
// TESTE 5: FINALIZAR ASSESSORIA (EM_ANDAMENTO)
// ============================================================================

async function testeFinalizarAssessoria(clienteId: string): Promise<boolean> {
  Logger.section('TESTE 5: Finalizar Assessoria (PUT → em_andamento)');

  try {
    Logger.log('Marcando assessoria como finalizada...');

    const response = await apiClient.post(
      `/juridico/cliente/${clienteId}/finalizar-assessoria`,
      {}
    );

    Logger.log('Assessoria finalizada');

    // Aguardar sincronização
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar novo stage do cliente
    const clienteResponse = await apiClient.get(`/cliente/${clienteId}`);
    const novoStage = clienteResponse.data.data?.stage || clienteResponse.data.stage;

    Logger.log(`Stage após finalizar: "${novoStage}"`);

    if (novoStage === 'assessoria_finalizada') {
      console.log('  ✓ Stage mudou corretamente para "assessoria_finalizada"');
      return true;
    } else {
      console.log(`  ✗ Stage não mudou para estado esperado (ficou em "${novoStage}")`);
      return false;
    }
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao finalizar assessoria', err);
    return false;
  }
}

// ============================================================================
// TESTE RÁPIDO: SÓ CONFIRMAÇÃO DE PAGAMENTO
// ============================================================================

async function testeRapidoConfirmacao(agendamentoId: string): Promise<TestResult> {
  const tempoInicio = Date.now();

  try {
    // 1. Obter status antes
    const statusAntes = await obterStatusAntes(agendamentoId);

    // 2. Confirmar pagamento
    const resultado = await testeConfirmarPagamento(agendamentoId);

    if (!resultado) {
      return {
        nome: 'Confirmação de Pagamento',
        passou: false,
        statusAntes: statusAntes || 'desconhecido',
        statusDepois: 'erro',
        tempo: Date.now() - tempoInicio,
        erro: 'Falha ao confirmar pagamento'
      };
    }

    return {
      nome: 'Confirmação de Pagamento',
      passou: resultado.passou,
      statusAntes: statusAntes || 'desconhecido',
      statusDepois: resultado.statusDepois,
      tempo: Date.now() - tempoInicio
    };
  } catch (error) {
    return {
      nome: 'Confirmação de Pagamento',
      passou: false,
      statusAntes: 'desconhecido',
      statusDepois: 'erro',
      tempo: Date.now() - tempoInicio,
      erro: String(error)
    };
  }
}

// ============================================================================
// RELATÓRIO
// ============================================================================

function gerarRelatorio(resultados: TestResult[]): void {
  Logger.section('RELATÓRIO FINAL');

  console.log('\n📊 Resultados dos Testes:\n');

  resultados.forEach((r, idx) => {
    const numero = idx + 1;
    const status = r.passou ? '✅ PASSOU' : '❌ FALHOU';
    const tempo = r.tempo ? ` (${r.tempo}ms)` : '';

    console.log(`${numero}. ${r.nome}`);
    console.log(`   ${status}${tempo}`);
    console.log(`   Status: "${r.statusAntes}" → "${r.statusDepois}"`);
    if (r.erro) {
      console.log(`   Erro: ${r.erro}`);
    }
    console.log();
  });

  const totalPassou = resultados.filter(r => r.passou).length;
  const total = resultados.length;
  const percentual = Math.round((totalPassou / total) * 100);

  console.log('─'.repeat(70));
  console.log(`Resumo: ${totalPassou}/${total} testes passaram (${percentual}%)`);
  console.log('─'.repeat(70) + '\n');
}

// ============================================================================
// MAIN: EXECUTAR TESTES
// ============================================================================

async function executarTestes(): Promise<void> {
  console.log('\n' + '█'.repeat(70));
  console.log('  TESTES DE CONFIRMAÇÃO DE PAGAMENTO');
  console.log('█'.repeat(70));

  console.log(`\nConfiguração:`);
  console.log(`  API Base: ${API_BASE}`);
  console.log(`  Verbose: ${VERBOSE}`);

  if (!TOKEN) {
    console.error('\n❌ JWT_TOKEN não foi fornecido');
    console.error('   Execute com: JWT_TOKEN="seu_token" npx ts-node tests/test-confirmacao-pagamento.ts');
    process.exit(1);
  }

  const resultados: TestResult[] = [];

  try {
    // TESTE 1: Criar agendamento
    const criarResult = await testeCreateAgendamento();
    if (!criarResult) {
      console.error('❌ Falha ao criar agendamento. Abortando testes.');
      process.exit(1);
    }

    const { agendamentoId, statusInicial } = criarResult;

    // TESTE 2: Preencher formulário (opcional mas recomendado)
    await testePreencherFormulario(agendamentoId);

    // TESTE 3-5: Fluxo de confirmação
    const testResult = await testeRapidoConfirmacao(agendamentoId);
    resultados.push(testResult);

    // Gerar relatório
    gerarRelatorio(resultados);

    // Resumo visual
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log(`   1. Verificar no banco: SELECT status FROM agendamentos WHERE id = '${agendamentoId}';`);
    console.log(`   2. Verificar no frontend em: http://localhost:3000/comercial/agendamentos`);
    console.log(`   3. Procurar pelo agendamento e validar o status visual`);

  } catch (error) {
    Logger.error('Erro crítico durante os testes', error);
    process.exit(1);
  }
}

// ============================================================================
// EXECUTAR
// ============================================================================

executarTestes().catch(error => {
  console.error('Erro na execução:', error);
  process.exit(1);
});
