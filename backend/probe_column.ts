import { supabase } from './src/config/SupabaseClient';

async function check() {
    console.log('--- Checking for cliente_id column in notificacoes ---');
    // We try to insert a record with cliente_id and see the error
    const { error: errorWithClienteId } = await supabase
        .from('notificacoes')
        .insert([{
            cliente_id: 'bdf5b1b9-3071-4b9c-aa3d-d0a75337a292',
            titulo: 'Test',
            mensagem: 'Test',
            usuario_id: null // Let's see if this is allowed
        }]);
    
    if (errorWithClienteId) {
        if (errorWithClienteId.code === '42703') { // undefined_column
            console.log('Column "cliente_id" DOES NOT exist in "notificacoes"');
        } else {
            console.log('Error with cliente_id (might exist but have other error):', errorWithClienteId);
        }
    } else {
        console.log('Successfully inserted into "cliente_id" column! It exists.');
    }
}

check();
