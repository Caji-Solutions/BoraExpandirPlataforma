
const { createClient } = require('@supabase/supabase-client');
const supabase = createClient('https://rtuxziaxeegbaaihpjni.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dXh6aWF4ZWVnYmFhaWhwam5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDYxMzYxMywiZXhwIjoyMDgwMTg5NjEzfQ.uWeF9ihRMIRFYhID4Il1sFIsykACs9TTEfmpA7sGPFA');

async function check() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'clientes' });
    if (error) {
        // Fallback: try raw query via another RPC if exists or just standard select
        console.log('RPC get_table_columns failed, trying standard select limit 0');
        const { data: d2, error: e2 } = await supabase.from('clientes').select('*').limit(1);
        if (d2 && d2.length > 0) {
            console.log('Columns:', Object.keys(d2[0]));
        } else {
            console.log('No data to infer columns');
        }
    } else {
        console.log('Columns:', data);
    }
}
check();
