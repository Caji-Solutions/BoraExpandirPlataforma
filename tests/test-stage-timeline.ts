/**
 * Script de teste: Fluxo de Atualização de Stages do Cliente
 *
 * Testa o ciclo completo:
 * 1. Cliente tem stage inicial
 * 2. Cria assessoria → stage muda
 * 3. Marca em andamento → stage muda
 * 4. Marca realizada → stage muda para assessoria_finalizada
 *
 * Uso:
 * JWT_TOKEN="token" CLIENTE_ID="id" RESPONSAVEL_ID="id" npx ts-node tests/test-stage-timeline.ts
 */

import axios, { AxiosError } from 'axios';

// ============================================================================
// CONFIG
// ============================================================================

interface StageTimeline {
  inicial: string;
  aposAssessoria: string;
  aposEmAndamento: string;
  aposFinalizado: string;
}

interface TestResult {
  stage: string;
  timestamp: string;
  cliente_id: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const TOKEN = process.env.JWT_TOKEN || '';
const CLIENTE_ID = process.env.CLIENTE_ID || '';
const RESPONSAVEL_ID = process.env.RESPONSAVEL_ID || '';
const AGENDAMENTO_ID = process.env.AGENDAMENTO_ID || '';
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
      if (error.response?.data) {
        console.error(JSON.stringify(error.response.data, null, 2));
      } else {
        console.error(error.message);
      }
    }
  }

  static section(title: string) {
    console.log('\n' + '═'.repeat(70));
    console.log(`  ${title}`);
    console.log('═'.repeat(70));
  }

  static timeline(title: string, data: any) {
    console.log(`\n📊 ${title}`);
    console.log('─'.repeat(70));
    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        console.log(`  ${key.padEnd(25)} → ${value}`);
      });
    }
    console.log('─'.repeat(70));
  }

  static stageChange(before: string, after: string, action: string) {
    console.log(`  [${action}] Stage: "${before}" ➜ "${after}"`);
  }
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
// TESTE 1: OBTER STAGE INICIAL DO CLIENTE
// ============================================================================

async function obterStageInicial(): Promise<string | null> {
  Logger.section('ETAPA 1: Obter Stage Inicial do Cliente');

  try {
    if (!CLIENTE_ID) {
      throw new Error('CLIENTE_ID não foi fornecido');
    }

    const response = await apiClient.get(`/cliente/${CLIENTE_ID}`);
    const stage = response.data.data?.stage || response.data.stage;

    Logger.log(`Stage atual do cliente: "${stage}"`);
    Logger.log(`Cliente: ${response.data.data?.nome || 'N/A'}`);

    return stage;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao obter stage inicial', err);
    return null;
  }
}

// ============================================================================
// TESTE 2: CRIAR ASSESSORIA E VERIFICAR STAGE
// ============================================================================

async function criarAssesoriaEVerificarStage(): Promise<string | null> {
  Logger.section('ETAPA 2: Criar Assessoria Jurídica');

  try {
    const payload = {
      clienteId: CLIENTE_ID,
      respostas: {
        servico_contratado: 'Viagem para Espanha - Teste Timeline',
        titular_nome: 'Teste Automatizado',
        dependentes_info: 'Teste',
        pedido_para: 'titular_somente' as const,
        pedido_para_detalhe: 'Teste',
        local_solicitacao: 'espanha' as const,
        consulado_cidade: 'Madri',
        cidade_protocolo: 'Madri',
        cidade_chegada: 'Barcelona',
        data_chegada: '2026-06-15',
        resumo_executivo: 'Teste automatizado do fluxo de stages',
        docs_titular: 'Teste',
        docs_dependentes: 'N/A',
        orientacoes_praticas: 'Teste',
        duvidas_cliente: 'Teste?',
        respostas_dadas: 'Teste',
        pontos_fracos: 'Nenhum',
        prazos_delicados: 'Nenhum',
        proximos_cliente: 'Teste',
        proximos_equipe: 'Teste',
        resumo_1_linha: 'Teste de timeline de stages'
      },
      responsavelId: RESPONSAVEL_ID,
      observacoes: 'Teste automatizado'
    };

    Logger.log('Criando assessoria...');
    const response = await apiClient.post('/juridico/assessoria', payload);

    Logger.log('Assessoria criada com sucesso');
    Logger.log(`ID da Assessoria: ${response.data.data.id}`);

    // Aguardar um pouco para sincronização
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Obter stage atual
    Logger.log('Obtendo novo stage do cliente...');
    const clienteResponse = await apiClient.get(`/cliente/${CLIENTE_ID}`);
    const novoStage = clienteResponse.data.data?.stage || clienteResponse.data.stage;

    Logger.log(`Stage após criar assessoria: "${novoStage}"`);

    return novoStage;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao criar assessoria', err);
    return null;
  }
}

// ============================================================================
// TESTE 3: MARCAR COMO EM ANDAMENTO E VERIFICAR STAGE
// ============================================================================

async function marcarEmAndamentoEVerificarStage(): Promise<string | null> {
  Logger.section('ETAPA 3: Marcar Assessoria como Em Andamento');

  try {
    if (!AGENDAMENTO_ID) {
      Logger.log('⚠️  AGENDAMENTO_ID não fornecido, tentando encontrar...');

      // Tentar buscar agendamento do cliente
      const agendamentosResponse = await apiClient.get(`/juridico/agendamentos/por-responsavel/${RESPONSAVEL_ID}`);
      const agendamentos = agendamentosResponse.data.data || [];

      if (agendamentos.length === 0) {
        Logger.log('⚠️  Nenhum agendamento encontrado para este responsável');
        return null;
      }

      const agendamentoDoCliente = agendamentos.find((a: any) => a.cliente_id === CLIENTE_ID);
      if (!agendamentoDoCliente) {
        Logger.log('⚠️  Nenhum agendamento encontrado para este cliente');
        return null;
      }

      Logger.log(`Agendamento encontrado: ${agendamentoDoCliente.id}`);

      // Marcar como em andamento
      await apiClient.post(`/juridico/agendamentos/${agendamentoDoCliente.id}/assessoria-em-andamento`, {});
    } else {
      Logger.log(`Marcando agendamento ${AGENDAMENTO_ID} como em andamento...`);
      await apiClient.post(`/juridico/agendamentos/${AGENDAMENTO_ID}/assessoria-em-andamento`, {});
    }

    Logger.log('Agendamento marcado como em andamento');

    // Aguardar sincronização
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Obter stage atual
    const clienteResponse = await apiClient.get(`/cliente/${CLIENTE_ID}`);
    const novoStage = clienteResponse.data.data?.stage || clienteResponse.data.stage;

    Logger.log(`Stage após marcar em andamento: "${novoStage}"`);

    return novoStage;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao marcar em andamento', err);
    return null;
  }
}

// ============================================================================
// TESTE 4: FINALIZAR ASSESSORIA E VERIFICAR STAGE
// ============================================================================

async function finalizarAssessoriaEVerificarStage(): Promise<string | null> {
  Logger.section('ETAPA 4: Finalizar Assessoria');

  try {
    Logger.log('Finalizando assessoria do cliente...');

    const response = await apiClient.post(`/juridico/cliente/${CLIENTE_ID}/finalizar-assessoria`, {});

    Logger.log('Assessoria finalizada com sucesso');
    Logger.log(`Resposta: ${response.data.message}`);

    // Aguardar sincronização
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Obter stage final
    const clienteResponse = await apiClient.get(`/cliente/${CLIENTE_ID}`);
    const stageF = clienteResponse.data.data?.stage || clienteResponse.data.stage;
    const status = clienteResponse.data.data?.status || clienteResponse.data.status;

    Logger.log(`Stage após finalizar: "${stageF}"`);
    Logger.log(`Status: "${status}"`);

    return stageF;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao finalizar assessoria', err);
    return null;
  }
}

// ============================================================================
// TESTE 5: VERIFICAR TIMELINE DO CLIENTE
// ============================================================================

async function verificarTimeline(): Promise<void> {
  Logger.section('ETAPA 5: Verificar Timeline do Cliente');

  try {
    const response = await apiClient.get(`/cliente/${CLIENTE_ID}`);
    const cliente = response.data.data || response.data;

    const timelineData = {
      'Stage Atual': cliente.stage || 'N/A',
      'Status': cliente.status || 'N/A',
      'Atualizado Em': cliente.atualizado_em || 'N/A',
      'Criado Em': cliente.criado_em || 'N/A'
    };

    Logger.timeline('Timeline do Cliente', timelineData);
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao verificar timeline', err);
  }
}

// ============================================================================
// TESTE 6: OBTER PROCESSO E VERIFICAR STATUS
// ============================================================================

async function verificarProcessoSincronizado(): Promise<void> {
  Logger.section('ETAPA 6: Verificar Processo Sincronizado');

  try {
    const response = await apiClient.get(`/juridico/processo-cliente/${CLIENTE_ID}`);
    const processo = response.data.data;

    if (!processo) {
      Logger.log('⚠️  Nenhum processo encontrado para este cliente');
      return;
    }

    const processData = {
      'ID': processo.id,
      'Status': processo.status || 'N/A',
      'Etapa Atual': processo.etapa_atual || 'N/A',
      'Tipo de Serviço': processo.tipo_servico || 'N/A',
      'Assessoria ID': processo.assessoria_id || 'N/A',
      'Documentos': (processo.documentos?.length || 0) + ' itens',
      'Atualizado Em': processo.atualizado_em || 'N/A'
    };

    Logger.timeline('Dados do Processo', processData);

    if (processo.documentos && processo.documentos.length > 0) {
      Logger.log('\nDocumentos do Processo:');
      processo.documentos.slice(0, 5).forEach((doc: any) => {
        console.log(`  • ${doc.nome} → ${doc.status}`);
      });
      if (processo.documentos.length > 5) {
        console.log(`  ... e mais ${processo.documentos.length - 5} documentos`);
      }
    }
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao verificar processo', err);
  }
}

// ============================================================================
// TESTE 7: OBTER ASSESSORIA CRIADA
// ============================================================================

async function verificarAssessoriaCriada(): Promise<void> {
  Logger.section('ETAPA 7: Verificar Assessoria Criada');

  try {
    const response = await apiClient.get(`/juridico/assessoria/${CLIENTE_ID}`);
    const assessoria = response.data.data;

    if (!assessoria) {
      Logger.log('⚠️  Nenhuma assessoria encontrada para este cliente');
      return;
    }

    const assessoriaData = {
      'ID': assessoria.id,
      'Cliente ID': assessoria.cliente_id,
      'Responsável ID': assessoria.responsavel_id || 'N/A',
      'Serviço ID': assessoria.servico_id || 'N/A',
      'Criado Em': assessoria.criado_em || 'N/A',
      'Atualizado Em': assessoria.atualizado_em || 'N/A'
    };

    Logger.timeline('Dados da Assessoria', assessoriaData);

    if (assessoria.respostas) {
      Logger.log('\nRespostas Principais:');
      const respostasChave = ['resumo_1_linha', 'servico_contratado', 'local_solicitacao'];
      respostasChave.forEach(chave => {
        if (assessoria.respostas[chave]) {
          console.log(`  • ${chave}: ${assessoria.respostas[chave].substring(0, 60)}...`);
        }
      });
    }
  } catch (error) {
    const err = error as AxiosError;
    Logger.error('Erro ao verificar assessoria', err);
  }
}

// ============================================================================
// RELATÓRIO FINAL
// ============================================================================

interface RelatorioStages {
  inicial: string | null;
  aposCriarAssessoria: string | null;
  aposMarcarEmAndamento: string | null;
  aposFinalizar: string | null;
}

function gerarRelatorio(stages: RelatorioStages): void {
  Logger.section('RELATÓRIO FINAL: TIMELINE DE STAGES');

  console.log('\n📌 Evolução do Stage do Cliente:\n');

  const transicoes = [
    { de: stages.inicial, para: stages.aposCriarAssessoria, acao: 'Criar Assessoria' },
    { de: stages.aposCriarAssessoria, para: stages.aposMarcarEmAndamento, acao: 'Marcar Em Andamento' },
    { de: stages.aposMarcarEmAndamento, para: stages.aposFinalizar, acao: 'Finalizar' }
  ];

  transicoes.forEach((t, idx) => {
    const numero = idx + 1;
    const mudou = t.de !== t.para ? '✓ SIM' : '✗ NÃO';
    console.log(`  ${numero}. ${t.acao}`);
    console.log(`     De: "${t.de}" → Para: "${t.para}"`);
    console.log(`     Stage foi atualizado? ${mudou}\n`);
  });

  // Verificar se tudo funcionou
  const stagesEsperados = {
    inicial: ['pendente_agendamento', 'consultoria_pendente', 'novo'],
    aposCriarAssessoria: ['consultoria_pendente', 'assessoria_pendente', 'em_consultoria'],
    aposMarcarEmAndamento: ['assessoria_andamento', 'em_consultoria', 'consultoria_andamento'],
    aposFinalizar: ['assessoria_finalizada', 'concluido']
  };

  console.log('✓ VALIDAÇÃO DE STAGES ESPERADOS:\n');

  const validacoes = [
    {
      nome: 'Stage inicial',
      valor: stages.inicial,
      esperados: stagesEsperados.inicial
    },
    {
      nome: 'Após criar assessoria',
      valor: stages.aposCriarAssessoria,
      esperados: stagesEsperados.aposCriarAssessoria
    },
    {
      nome: 'Após marcar em andamento',
      valor: stages.aposMarcarEmAndamento,
      esperados: stagesEsperados.aposMarcarEmAndamento
    },
    {
      nome: 'Após finalizar',
      valor: stages.aposFinalizar,
      esperados: stagesEsperados.aposFinalizar
    }
  ];

  validacoes.forEach(v => {
    const ehValido = v.esperados.includes(v.valor || '');
    const status = ehValido ? '✓' : '⚠️ ';
    console.log(`  ${status} ${v.nome}: "${v.valor}"`);
    if (!ehValido && v.valor) {
      console.log(`    Esperado: ${v.esperados.join(' ou ')}`);
    }
  });

  console.log('\n' + '─'.repeat(70));
  console.log('Teste concluído! Verifique a timeline acima.');
  console.log('─'.repeat(70) + '\n');
}

// ============================================================================
// MAIN
// ============================================================================

async function executarTesteCompleto(): Promise<void> {
  console.log('\n' + '█'.repeat(70));
  console.log('  TESTE COMPLETO: TIMELINE DE STAGES DO CLIENTE');
  console.log('█'.repeat(70));

  console.log(`\nConfiguração:`);
  console.log(`  Cliente ID: ${CLIENTE_ID}`);
  console.log(`  Responsável ID: ${RESPONSAVEL_ID}`);
  console.log(`  Agendamento ID: ${AGENDAMENTO_ID || '(será buscado automaticamente)'}`);
  console.log(`  API Base: ${API_BASE}`);
  console.log(`  Verbose: ${VERBOSE}`);

  if (!TOKEN || !CLIENTE_ID || !RESPONSAVEL_ID) {
    console.error(
      '\n❌ Variáveis de ambiente obrigatórias faltando:'
    );
    if (!TOKEN) console.error('  - JWT_TOKEN');
    if (!CLIENTE_ID) console.error('  - CLIENTE_ID');
    if (!RESPONSAVEL_ID) console.error('  - RESPONSAVEL_ID');
    process.exit(1);
  }

  try {
    // Executar testes em sequência
    const stageInicial = await obterStageInicial();
    const stageAposAssessoria = await criarAssesoriaEVerificarStage();
    const stageAposEmAndamento = await marcarEmAndamentoEVerificarStage();
    const stageAposFinalizar = await finalizarAssessoriaEVerificarStage();

    // Verificações adicionais
    await verificarTimeline();
    await verificarProcessoSincronizado();
    await verificarAssessoriaCriada();

    // Gerar relatório
    gerarRelatorio({
      inicial: stageInicial,
      aposCriarAssessoria: stageAposAssessoria,
      aposMarcarEmAndamento: stageAposEmAndamento,
      aposFinalizar: stageAposFinalizar
    });
  } catch (error) {
    Logger.error('Erro crítico durante os testes', error);
    process.exit(1);
  }
}

// Executar
executarTesteCompleto().catch(error => {
  console.error('Erro na execução:', error);
  process.exit(1);
});
