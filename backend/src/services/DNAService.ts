import { supabase } from '../config/SupabaseClient'

// Metadata format: { [field]: 'HIGH' | 'MEDIUM' }
export interface UnifiedDNA {
    data: Record<string, any>;
    metadata: Record<string, 'HIGH' | 'MEDIUM'>;
}

const ROOT_COLUMNS_SYNC = [
    'nome',
    'email',
    'whatsapp',
    'data_nascimento',
    'nacionalidade',
    'estado_civil'
];

/**
 * Mapeamento das colunas físicas que existem na tabela `clientes`.
 * Isso garante o update direto do registro.
 */
const VALID_CLIENT_COLUMNS = [
    'nome',
    'email',
    'whatsapp',
    'foto_perfil'
    // 'cpf' nao existe como coluna na tabela clientes, informacoes de documento ficam no perfil_unificado
];

export class DNAService {

    /**
     * Mescla o payload com o DNA atual do cliente, obedecendo regras de prioridade.
     * Além de salvar no perfil_unificado, atualiza colunas físicas chave mapeadas na tabela clientes.
     */
    static async mergeDNA(clienteId: string, payload: Record<string, any>, priority: 'HIGH' | 'MEDIUM') {
        if (!clienteId || !payload || Object.keys(payload).length === 0) return null;

        console.log(`[DNAService] Processando DNA Merge para cliente ${clienteId} com prioridade ${priority}`);

        try {
            // 1. Busca DNA atual e colunas essenciais
            const { data: cliente, error: fetchError } = await supabase
                .from('clientes')
                .select('*') // Pega tudo para caso precise analisar colunas raízes
                .eq('id', clienteId)
                .single();

            if (fetchError || !cliente) {
                console.warn(`[DNAService] Erro ao buscar cliente ${clienteId} para merge DNA:`, fetchError);
                return null;
            }

            let dna: UnifiedDNA = cliente.perfil_unificado || { data: {}, metadata: {} };
            if (!dna.data) dna.data = {};
            if (!dna.metadata) dna.metadata = {};

            // Sincroniza status e id reais da tabela raiz para dentro do DNA Unificado
            dna.data.status = cliente.status;
            dna.data.cliente_id = cliente.id;

            let dnaUpdated = false;
            let rootUpdatePayload: Record<string, any> = {};

            // 2. Itera o Payload para aplicar regras de sobreposição
            for (const [key, newValue] of Object.entries(payload)) {
                // Ignore strings vazias, nulls ou undefined do payload entrante para não sobrescrever acidentalmente com lixo
                if (newValue === null || newValue === undefined || newValue === '') {
                    continue;
                }

                // Ignore propriedades internas (ex: __erroGeracao)
                if (key.startsWith('__')) {
                    continue;
                }

                const currentPriority = dna.metadata[key];
                const currentValue = dna.data[key];

                const isEmptyCurrently = currentValue === null || currentValue === undefined || currentValue === '';
                
                // Mapeia se `newValue` possui autarquia maior ou igual que a última
                let shouldUpdate = false;

                if (isEmptyCurrently) {
                    // Sem discussão, se está vazio, preenche com o incoming (qualquer prioridade).
                    shouldUpdate = true;
                } else if (priority === 'HIGH') {
                    // HIGH sempre sobrescreve tudo
                    shouldUpdate = true;
                } else if (priority === 'MEDIUM' && currentPriority !== 'HIGH') {
                    // MEDIUM só sobrescreve se a prioridade existente não for HIGH
                    shouldUpdate = true;
                }

                if (shouldUpdate) {
                    dna.data[key] = newValue;
                    dna.metadata[key] = priority;
                    dnaUpdated = true;

                    // 3. Se essa key corresponder Ã  uma coluna raiz, agenda atualização para root.
                    // Adaptando keys que diferem: nome_completo -> nome, cpf/documento -> cpf etc.
                    let rootKey = key;
                    if (key === 'nome_completo') rootKey = 'nome';
                    if (key === 'documento') rootKey = 'cpf';
                    if (key === 'telefone') rootKey = 'whatsapp';

                    if (VALID_CLIENT_COLUMNS.includes(rootKey)) {
                        rootUpdatePayload[rootKey] = newValue;
                    }
                }
            }

            // 4. Executa a atualização no banco (DNA e/ou Root Params)
            if (dnaUpdated) {
                const updatePayload = {
                    ...rootUpdatePayload,
                    perfil_unificado: dna,
                    atualizado_em: new Date().toISOString()
                };

                const { error: updateError } = await supabase
                    .from('clientes')
                    .update(updatePayload)
                    .eq('id', clienteId);

                if (updateError) {
                    console.error('[DNAService] Erro ao salvar DNA no banco:', updateError);
                } else {
                    console.log(`[DNAService] DNA do Cliente ${clienteId} mergeado e atualizado (Chaves sincronizadas na raiz: ${Object.keys(rootUpdatePayload).join(', ') || 'Nenhuma'})`);
                }
            } else {
                console.log(`[DNAService] DNA do Cliente ${clienteId} sem alteracoes detectadas pelas regras de prioridade.`);
            }

            return dna;

        } catch (err) {
            console.error('[DNAService] Falha catastrofica em DNAService:', err);
            return null;
        }
    }
}

export default DNAService;
