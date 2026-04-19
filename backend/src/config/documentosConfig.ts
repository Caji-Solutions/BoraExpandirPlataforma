// Configuração de documentos requeridos por tipo de serviço
// Esta configuração define quais documentos são necessários para cada tipo de processo

export interface DocumentoRequeridoConfig {
    type: string;           // Identificador único do tipo de documento
    name: string;           // Nome para exibição
    description: string;    // Descrição do documento
    required: boolean;      // Se é obrigatório ou opcional
    examples?: string[];    // Exemplos aceitos
    tipoDocumento?: 'titular' | 'dependente'; // A quem o requisito se aplica
}

export interface TipoServicoConfig {
    tipoServico: string;
    documentosRequeridos: DocumentoRequeridoConfig[];
}

// Mapeamento de documentos por tipo de serviço
export const DOCUMENTOS_POR_SERVICO: Record<string, DocumentoRequeridoConfig[]> = {
    // ==========================================
    // CIDADANIA PORTUGUESA
    // ==========================================
    'Cidadania Portuguesa': [
        {
            type: 'certidao_nascimento',
            name: 'Certidão de Nascimento',
            description: 'Certidão de nascimento em inteiro teor',
            required: true,
            examples: ['Certidão de nascimento atualizada', 'Inteiro teor']
        },
        {
            type: 'certidao_casamento',
            name: 'Certidão de Casamento',
            description: 'Certidão de casamento (se aplicável)',
            required: false,
            examples: ['Certidão de casamento atualizada']
        },
        {
            type: 'passaporte',
            name: 'Passaporte',
            description: 'Cópia de todas as páginas do passaporte',
            required: true,
            examples: ['Todas as páginas', 'Foto nítida']
        },
        {
            type: 'arvore_genealogica',
            name: 'Árvore Genealógica',
            description: 'Documentos que comprovem descendência portuguesa',
            required: true,
            examples: ['Certidões de ascendentes', 'Documentos históricos']
        },
        {
            type: 'certidao_nascimento_ascendente',
            name: 'Certidão de Nascimento do Ascendente Português',
            description: 'Certidão do familiar português na linha de descendência',
            required: true,
            examples: ['Certidão portuguesa', 'Transcrição consular']
        },
        {
            type: 'comprovante_residencia',
            name: 'Comprovante de Residência',
            description: 'Documento que comprove endereço atual',
            required: true,
            examples: ['Conta de luz', 'Conta de água', 'Contrato de aluguel']
        }
    ],

    // ==========================================
    // VISTO D7 (Aposentados e Titulares de Rendimentos)
    // ==========================================
    'Visto D7': [
        {
            type: 'passaporte',
            name: 'Passaporte',
            description: 'Passaporte válido com pelo menos 6 meses de validade',
            required: true,
            examples: ['Todas as páginas', 'Validade mínima de 6 meses']
        },
        {
            type: 'comprovante_renda',
            name: 'Comprovante de Renda',
            description: 'Comprovante de renda passiva ou aposentadoria',
            required: true,
            examples: ['Extrato bancário', 'Comprovante de aposentadoria', 'Rendimentos de investimentos']
        },
        {
            type: 'seguro_saude',
            name: 'Seguro Saúde',
            description: 'Seguro saúde internacional com cobertura em Portugal',
            required: true,
            examples: ['Apólice de seguro', 'Carta de cobertura']
        },
        {
            type: 'antecedentes_criminais',
            name: 'Antecedentes Criminais',
            description: 'Certidão negativa de antecedentes criminais',
            required: true,
            examples: ['Certidão da Polícia Federal', 'Apostilada']
        },
        {
            type: 'comprovante_alojamento',
            name: 'Comprovante de Alojamento',
            description: 'Prova de alojamento em Portugal',
            required: true,
            examples: ['Contrato de arrendamento', 'Reserva de hotel', 'Carta convite']
        },
        {
            type: 'foto_3x4',
            name: 'Fotos 3x4',
            description: 'Fotos recentes no padrão passaporte',
            required: true,
            examples: ['2 fotos 3x4', 'Fundo branco']
        }
    ],

    // ==========================================
    // VISTO D2 (Empreendedor)
    // ==========================================
    'Visto D2 - Empreendedor': [
        {
            type: 'passaporte',
            name: 'Passaporte',
            description: 'Passaporte válido com pelo menos 6 meses de validade',
            required: true,
            examples: ['Todas as páginas', 'Validade mínima de 6 meses']
        },
        {
            type: 'plano_negocios',
            name: 'Plano de Negócios',
            description: 'Plano de negócios detalhado para Portugal',
            required: true,
            examples: ['Business plan', 'Projeções financeiras', 'Análise de mercado']
        },
        {
            type: 'comprovante_investimento',
            name: 'Comprovante de Investimento',
            description: 'Prova de capital disponível para investir',
            required: true,
            examples: ['Extrato bancário', 'Carta do banco']
        },
        {
            type: 'antecedentes_criminais',
            name: 'Antecedentes Criminais',
            description: 'Certidão negativa de antecedentes criminais',
            required: true,
            examples: ['Certidão da Polícia Federal', 'Apostilada']
        },
        {
            type: 'seguro_saude',
            name: 'Seguro Saúde',
            description: 'Seguro saúde internacional com cobertura em Portugal',
            required: true,
            examples: ['Apólice de seguro', 'Carta de cobertura']
        },
        {
            type: 'curriculum_vitae',
            name: 'Curriculum Vitae',
            description: 'CV atualizado com experiência profissional',
            required: true,
            examples: ['CV em português', 'Experiência empresarial']
        }
    ],

    // ==========================================
    // AUTORIZAÇÃO DE RESIDÊNCIA
    // ==========================================
    'Autorização de Residência': [
        {
            type: 'passaporte',
            name: 'Passaporte',
            description: 'Passaporte válido',
            required: true,
            examples: ['Todas as páginas']
        },
        {
            type: 'visto_entrada',
            name: 'Visto de Entrada',
            description: 'Visto que permitiu a entrada em Portugal',
            required: true,
            examples: ['Cópia do visto', 'Carimbo de entrada']
        },
        {
            type: 'comprovante_meios_subsistencia',
            name: 'Comprovante de Meios de Subsistência',
            description: 'Prova de recursos financeiros',
            required: true,
            examples: ['Extrato bancário', 'Contrato de trabalho']
        },
        {
            type: 'comprovante_alojamento',
            name: 'Comprovante de Alojamento',
            description: 'Prova de alojamento em Portugal',
            required: true,
            examples: ['Contrato de arrendamento', 'Escritura']
        },
        {
            type: 'seguro_saude',
            name: 'Seguro Saúde',
            description: 'Seguro saúde ou inscrição no SNS',
            required: true,
            examples: ['Apólice de seguro', 'Cartão SNS']
        },
        {
            type: 'nif',
            name: 'NIF',
            description: 'Número de Identificação Fiscal português',
            required: true,
            examples: ['Cartão NIF', 'Comprovante de atribuição']
        }
    ],

    // ==========================================
    // RENOVAÇÃO DE VISTO
    // ==========================================
    'Renovação de Visto': [
        {
            type: 'passaporte',
            name: 'Passaporte',
            description: 'Passaporte válido atual',
            required: true,
            examples: ['Todas as páginas']
        },
        {
            type: 'titulo_residencia_anterior',
            name: 'Título de Residência Anterior',
            description: 'Cópia do título de residência a renovar',
            required: true,
            examples: ['Frente e verso', 'Ainda válido ou recém expirado']
        },
        {
            type: 'comprovante_meios_subsistencia',
            name: 'Comprovante de Meios de Subsistência',
            description: 'Prova de recursos financeiros atualizados',
            required: true,
            examples: ['Extrato bancário', 'Contrato de trabalho', 'IRS']
        },
        {
            type: 'comprovante_alojamento',
            name: 'Comprovante de Alojamento',
            description: 'Prova de alojamento atual em Portugal',
            required: true,
            examples: ['Contrato de arrendamento', 'Escritura']
        },
        {
            type: 'seguro_saude',
            name: 'Seguro Saúde',
            description: 'Seguro saúde atualizado',
            required: true,
            examples: ['Apólice de seguro', 'Cartão SNS']
        },
        {
            type: 'comprovante_pagamento_taxas',
            name: 'Comprovante de Pagamento de Taxas',
            description: 'Pagamento das taxas de renovação',
            required: true,
            examples: ['Comprovante SEF', 'Guia de pagamento']
        }
    ]
};

// Função helper para obter documentos de um tipo de serviço
export function getDocumentosPorTipoServico(tipoServico: string): DocumentoRequeridoConfig[] {
    return DOCUMENTOS_POR_SERVICO[tipoServico] || [];
}

// Função para obter todos os tipos de serviço disponíveis
export function getTiposServicoDisponiveis(): string[] {
    return Object.keys(DOCUMENTOS_POR_SERVICO);
}
