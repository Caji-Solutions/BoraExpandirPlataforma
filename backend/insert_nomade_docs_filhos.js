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
    .insert([{ nome: 'NÔMADE DIGITAL FILHOS E ENTEADOS', servico_id: servicoId }])
    .select()
    .single();
    
  if (errSub) {
    console.error('Erro ao criar subservico', errSub);
    return;
  }
  
  console.log('Subservico criado:', sub.id);
  
  const documents = [
    { nome: "Documento que prova o vinculo familiar - Certidão de Nascimento", obrigatorio: true },
    { nome: "Autorização Notarial (apenas para enteados ou pais/mães solteiros)", obrigatorio: false },
    { nome: "Sentença judicial (apenas para menores adotados)", obrigatorio: false },
    { nome: "Comprovantes para maiores de 18 e menores de 26 anos (Certificados negativos, Matrícula, Certidão de Solteiro)", obrigatorio: false },
    { nome: "Laudo médico de incapacidade (apenas para maiores de 26 anos)", obrigatorio: false },
    { nome: "Antecedentes Criminais (apenas acompanhantes maiores de idade)", obrigatorio: false },
    { nome: "Passaporte (todas as páginas com carimbo da imigração)", obrigatorio: true },
    { nome: "Declaração de entrada na Espanha (apenas para voo de conexão na Europa)", obrigatorio: false },
    { nome: "Cartão de Residência (apenas para residentes europeus)", obrigatorio: false }
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
    console.log(`Sucesso: ${documents.length} documentos criados no subservico NÔMADE DIGITAL FILHOS E ENTEADOS.`);
  }
}

run();
