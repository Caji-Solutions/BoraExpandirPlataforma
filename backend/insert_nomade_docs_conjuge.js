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
    .insert([{ nome: 'NOMADE DIGITAL CONJUGE', servico_id: servicoId }])
    .select()
    .single();
    
  if (errSub) {
    console.error('Erro ao criar subservico', errSub);
    return;
  }
  
  console.log('Subservico criado:', sub.id);
  
  const documents = [
    { nome: "Documento que comprove o vínculo com Titular (Certidão de Casamento ou União Estável)", obrigatorio: true },
    { nome: "Antecedentes Criminais", obrigatorio: true },
    { nome: "Passaporte (Cópia de TODAS as páginas com carimbo)", obrigatorio: true },
    { nome: "Formulário de Solicitude assinado", obrigatorio: true },
    { nome: "Designação de representante", obrigatorio: true },
    { nome: "Declaração de que não possui antecedentes penais nos últimos 5 anos", obrigatorio: true },
    { nome: "Comprovante de pagamento da taxa (73,26 euros)", obrigatorio: true },
    { nome: "Declaração de entrada na Espanha (para voo de conexão na Europa)", obrigatorio: false },
    { nome: "Cartão de Residência (apenas quem morava em outro país da europa)", obrigatorio: false }
  ];
  
  const payload = documents.map(d => ({
    servico_id: servicoId,
    subservico_id: sub.id,
    nome: d.nome,
    etapa: 'analise', // mantendo o padrão
    obrigatorio: d.obrigatorio
  }));
  
  const { error: errDocs } = await supabase.from('servico_requisitos').insert(payload);
  
  if (errDocs) {
    console.error('Erro ao salvar documentos:', errDocs);
  } else {
    console.log(`Sucesso: ${documents.length} documentos criados no subservico NOMADE DIGITAL CONJUGE.`);
  }
}

run();
