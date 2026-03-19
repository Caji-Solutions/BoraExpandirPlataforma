import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('C:/Users/natha/Documents/Caji/BoraExpandirPlataforma/.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('clientes').select('*').limit(1);
    if (error) {
        console.error(error);
    } else {
        if(data && data.length > 0) {
            console.log(Object.keys(data[0]).join(','));
        } else {
            console.log("No rows, cannot infer columns, let's insert a fake one and rollback or just use rpc");
        }
    }
}

check();
