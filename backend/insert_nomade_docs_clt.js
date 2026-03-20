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
    .insert([{ nome: 'NOMADE DIGITAL CLT', servico_id: servicoId }])
    .select()
    .single();
    
  if (errSub) {
    console.error('Erro ao criar subservico', errSub);
    return;
  }
  
  console.log('Subservico criado:', sub.id);
  
  const documents = [
    { nome: "Extrato da Carteira de Trabalho Digital e/ou Contrato de Trabalho", obrigatorio: true },
    { nome: "Certificado Oficial de Registro da Empresa que trabalha (Cartão CNPJ)", obrigatorio: true },
    { nome: "Carta da Empresa", obrigatorio: true },
    { nome: "Última Declaração do Imposto de Renda Pessoa Física", obrigatorio: true },
    { nome: "Holerites (dos 3 últimos meses)", obrigatorio: true },
    { nome: "Antecedentes Criminais", obrigatorio: true },
    { nome: "Diploma de Ensino Superior OU Comprovação de 3 anos de experiência na área", obrigatorio: true },
    { nome: "Compromisso de alta na seguridad social espanhola (registro como autónomo aqui)", obrigatorio: true },
    { nome: "Certificado médico internacional para o Titular e para os dependentes (se tiver)", obrigatorio: true },
    { nome: "Documentação relativa ao cumprimento da normativa em matéria de Seguridade Social", obrigatorio: true },
    { nome: "Extrato Bancário Modelo Consolidado", obrigatorio: true },
    { nome: "Curriculum Vitae", obrigatorio: true },
    { nome: "Passaporte (todas as páginas)", obrigatorio: true },
    { nome: "Comprovante de pagamento da taxa (73,26 euros)", obrigatorio: true },
    { nome: "Formulário de Solicitude assinado", obrigatorio: true },
    { nome: "Designação de representante", obrigatorio: true },
    { nome: "Declaração de que não possui antecedentes penais nos últimos 5 anos", obrigatorio: true },
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
    console.log(`Sucesso: ${documents.length} documentos criados no subservico NOMADE DIGITAL CLT.`);
  }
}

run();
