import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggers() {
    // We can't query pg_trigger directly via postgrest easily usually, but let's try a rpc if it exists or something else
    // Actually, let's try to query the schema if we have permissions
    const { data, error } = await supabase.from('pg_trigger').select('*'); // This won't work usually
    if (error) {
        console.error('Error fetching triggers:', error);
    } else {
        console.log('Triggers:', data);
    }
}

checkTriggers();
