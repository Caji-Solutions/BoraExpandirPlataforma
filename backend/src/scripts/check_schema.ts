import { supabase } from './config/SupabaseClient';

async function checkCols() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        console.error(error);
    } else {
        console.log('Colunas de profiles:', Object.keys(data[0] || {}));
    }
}
checkCols();
