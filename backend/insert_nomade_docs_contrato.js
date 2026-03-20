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
    .insert([{ nome: 'NÔMADE DIGITAL POR CONTRATO', servico_id: servicoId }])
    .select()
    .single();
    
  if (errSub) {
    console.error('Erro ao criar subservico', errSub);
    return;
  }
  
  console.log('Subservico criado:', sub.id);
  
  const documents = [
    { nome: "Contrato de Trabalho", obrigatorio: true },
    { nome: "Certificado Oficial de Registro da Empresa que trabalha (Cartão CNPJ)", obrigatorio: true },
    { nome: "Carta da Empresa", obrigatorio: true },
    { nome: "Última Declaração do Imposto de Renda Pessoa Física", obrigatorio: true },
    { nome: "Notas Fiscais", obrigatorio: true },
    { nome: "Antecedentes Criminais", obrigatorio: true },
    { nome: "Diploma de Ensino Superior OU Comprovação de 3 anos de experiência na área", obrigatorio: true },
    { nome: "Registro Oficial de de trabalhador autônomo no país de origem", obrigatorio: true },
    { nome: "Extrato Bancário", obrigatorio: true },
    { nome: "Curriculum Vitae", obrigatorio: true },
    { nome: "Passaporte", obrigatorio: true },
    { nome: "Comprovante de pagamento da taxa", obrigatorio: true },
    { nome: "Formulário de Solicitude assinado", obrigatorio: true },
    { nome: "Designação de representante", obrigatorio: true },
    { nome: "Compromisso de alta na seguridad social espanhola (registro como autónomo aqui)", obrigatorio: true },
    { nome: "Declaração de que não possui antecedentes penais nos países que residiu nos últimos 5 anos", obrigatorio: true },
    { nome: "Declaração de entrada na Espanha (apenas para quem vem com voo de conexão na Europa)", obrigatorio: false },
    { nome: "Cartão de Residência (apenas quem morava em outro país da europa)", obrigatorio: false },
    { nome: "Homologação do título OU Declaração responsável perante notário espanhol", obrigatorio: false }
  ];
  
  const payload = documents.map(d => ({
    servico_id: servicoId,
    subservico_id: sub.id,
    nome: d.nome,
    etapa: 'analise', // mantendo o padrão do anterior
    obrigatorio: d.obrigatorio
  }));
  
  const { error: errDocs } = await supabase.from('servico_requisitos').insert(payload);
  
  if (errDocs) {
    console.error('Erro ao salvar documentos:', errDocs);
  } else {
    console.log(`Sucesso: ${documents.length} documentos criados no subservico NÔMADE DIGITAL POR CONTRATO.`);
  }
}

run();
