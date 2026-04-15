import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listRPC() {
    const { data, error } = await supabase.rpc('get_functions'); // Standard Supabase list functions if available, usually not.
    if (error) {
        console.error('Error fetching functions:', error);
        // Try to run a raw query via a known RPC if it exists
        const { data: data2, error: error2 } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
        if (error2) {
            console.error('exec_sql rpc also failed:', error2);
        } else {
            console.log('exec_sql exists! We can use it.');
        }
    } else {
        console.log('Functions:', data);
    }
}

listRPC();
