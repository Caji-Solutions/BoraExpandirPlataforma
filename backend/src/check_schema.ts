import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Fetching tables...');
    
    // As we cannot easily query information_schema directly from supabase-js without an RPC or postgres connection, we can try to fetch 1 row from both tables to see if they exist and what fields they have.
    
    const { data: colsClientes, error: errClientes } = await supabase.from('formularios_clientes').select('*').limit(1);
    console.log('formularios_clientes:', errClientes ? errClientes.message : Object.keys(colsClientes?.[0] || { empty: true }));

    const { data: colsConsultoria, error: errConsultoria } = await supabase.from('formularios_consultoria').select('*').limit(1);
    console.log('formularios_consultoria:', errConsultoria ? errConsultoria.message : Object.keys(colsConsultoria?.[0] || { empty: true }));
}

check();
