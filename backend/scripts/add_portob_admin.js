const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rtuxziaxeegbaaihpjni.supabase.co';
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dXh6aWF4ZWVnYmFhaWhwam5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDYxMzYxMywiZXhwIjoyMDgwMTg5NjEzfQ.uWeF9ihRMIRFYhID4Il1sFIsykACs9TTEfmpA7sGPFA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  const EMAIL = 'portob162@gmail.com';
  const PASSWORD = 'portob162@gmail.com123321';
  
  console.log(`\n=== Configurando super_admin ===`);
  console.log(`Email: ${EMAIL}`);

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(PASSWORD, salt);

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', EMAIL)
    .maybeSingle();
    
  if (profile) {
    console.log(`\nPerfil encontrado. ID: ${profile.id}. Atualizando role e senha...`);
    const { error: updateError } = await supabase.from('profiles').update({
      password_hash: password_hash,
      role: 'super_admin'
    }).eq('id', profile.id);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError.message);
      process.exit(1);
    }
    console.log('✅ Perfil atualizado com sucesso para super_admin.');
  } else {
    console.log('\nPerfil não encontrado. Criando novo...');
    const newId = crypto.randomUUID();
    const { error: insertError } = await supabase.from('profiles').insert({
      id: newId,
      full_name: 'Bruno Porto (Super Admin)',
      email: EMAIL,
      role: 'super_admin',
      password_hash: password_hash,
      registration_complete: true
    });
    
    if (insertError) {
      console.error('❌ Erro ao criar perfil:', insertError.message);
      process.exit(1);
    }
    console.log('✅ Novo perfil super_admin criado com sucesso.');
  }
}

main().catch(console.error);
