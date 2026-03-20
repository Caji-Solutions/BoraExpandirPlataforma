const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Buscando servico "Assessoria Nômade Digital"...');
  
  // 1. Procurar o servico
  const { data: servico, error: errServico } = await supabase
    .from('catalogo_servicos')
    .select('id, nome')
    .ilike('nome', '%Nômade%')
    .single();
    
  if (errServico || !servico) {
    console.error('Servico nao encontrado!', errServico);
    
    // Tentar listar para ver o que tem:
    const { data: todos } = await supabase.from('catalogo_servicos').select('id, nome');
    console.log('Servicos disponiveis no banco:', todos?.map(t => t.nome));
    return;
  }
  
  console.log('Encontrado:', servico.nome, '-', servico.id);
  
  // 2. Verificar o que tem em servico_requisitos para ver a "etapa" comum
  const { data: reqs } = await supabase.from('servico_requisitos').select('etapa').limit(5);
  console.log('Etapas comuns no banco:', [...new Set(reqs?.map(r => r.etapa))]);
  
}

run();
