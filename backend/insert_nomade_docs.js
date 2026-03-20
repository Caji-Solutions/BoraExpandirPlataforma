const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const servicoId = 'fc2fdd3d-b8de-4c1d-a5aa-5d64f12ec26f'; // Assessoria Nômade Digital
  
  console.log('Criando subservico...');
  const { data: sub, error: errSub } = await supabase
    .from('subservicos')
    .insert([{ nome: 'NÔMADE DIGITAL EMPRESA PRÓPRIA', servico_id: servicoId }])
    .select()
    .single();
    
  if (errSub) {
    console.error('Erro ao criar subservico', errSub);
    return;
  }
  
  console.log('Subservico criado:', sub.id);
  
  const documents = [
    { nome: "Contrato Social da Empresa", obrigatorio: true },
    { nome: "Cartão CNPJ da Empresa", obrigatorio: true },
    { nome: "Última Declaração do Imposto de Renda da Empresa", obrigatorio: true },
    { nome: "Relatório do INSS com histórico de empregados ou eSocial", obrigatorio: false },
    { nome: "Notas Fiscais (dos 3 últimos meses)", obrigatorio: true },
    { nome: "Balanço econômico dos 12 meses anteriores", obrigatorio: true },
    { nome: "Comprovante de investimento da empresa em meios produtivos", obrigatorio: false },
    { nome: "Diploma de Ensino Superior OU Comprovação de 3 anos de experiência", obrigatorio: true },
    { nome: "Antecedentes Criminais", obrigatorio: true },
    { nome: "Carta dos Sócios autorizando o trabalho remoto", obrigatorio: false },
    { nome: "Extrato Bancário Modelo Consolidado", obrigatorio: true },
    { nome: "Curriculum Vitae", obrigatorio: true },
    { nome: "Passaporte (todas as páginas)", obrigatorio: true },
    { nome: "Comprovante de pagamento da taxa", obrigatorio: true },
    { nome: "Formulário de Solicitude assinado", obrigatorio: true },
    { nome: "Designação de representante", obrigatorio: true },
    { nome: "Compromisso de alta na seguridad social espanhola", obrigatorio: true },
    { nome: "Declaração de sem antecedentes penais (5 anos)", obrigatorio: true },
    { nome: "Declaração de entrada na Espanha", obrigatorio: false },
    { nome: "Cartão de Residência (para residentes europeus)", obrigatorio: false },
    { nome: "Homologação de título OU Declaração profissional", obrigatorio: false }
  ];
  
  const payload = documents.map(d => ({
    servico_id: servicoId,
    subservico_id: sub.id,
    nome: d.nome,
    etapa: 'analise', // Conforme o prompt
    obrigatorio: d.obrigatorio
  }));
  
  const { error: errDocs } = await supabase.from('servico_requisitos').insert(payload);
  
  if (errDocs) {
    console.error('Erro ao salvar documentos:', errDocs);
  } else {
    console.log(`Sucesso: ${documents.length} documentos criados no subservico NÔMADE DIGITAL EMPRESA PRÓPRIA.`);
  }
}

run();
