import { supabase } from './src/config/SupabaseClient';

async function check() {
    console.log('--- Notificações Table Info ---');
    const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching from notificacoes:', error);
    } else {
        console.log('Columns in notificacoes:', data && data.length > 0 ? Object.keys(data[0]) : 'No data to infer columns');
    }

    console.log('--- Profiles Table Info ---');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (pError) {
        console.error('Error fetching from profiles:', pError);
    } else {
        console.log('Columns in profiles:', profiles && profiles.length > 0 ? Object.keys(profiles[0]) : 'No data to infer columns');
    }
    
    console.log('--- Clientes Table Info ---');
    const { data: clientes, error: cError } = await supabase
        .from('clientes')
        .select('*')
        .limit(3);

    if (cError) {
        console.error('Error fetching from clientes:', cError);
    } else {
        console.log('Sample Clientes:', clientes?.map(c => ({ id: c.id, nome: c.nome, client_id: c.client_id })));
        const withClientId = clientes?.filter(c => c.client_id !== null);
        console.log('Clients with client_id:', withClientId?.length);
    }
}

check();
