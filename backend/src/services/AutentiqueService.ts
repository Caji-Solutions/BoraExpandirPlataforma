import fs from 'fs';
import path from 'path';

class AutentiqueService {
    private get token() {
        return process.env.AUTENTIQUE_TOKEN;
    }

    private get apiUrl() {
        return 'https://api.autentique.com.br/v2/graphql';
    }

    /**
     * Cria um documento na Autentique para assinatura.
     * Faz download do PDF da URL fornecida e envia via GraphQL multipart request.
     * 
     * @param documentName Nome do documento que aparecerá para o signatário.
     * @param fileUrl URL pública do PDF gerado.
     * @param signerName Nome do cliente signatário.
     * @param signerEmail E-mail do cliente signatário.
     * @returns ID e informações do documento criado.
     */
    async createDocument(documentName: string, fileUrl: string, signerName: string, signerEmail: string) {
        if (!this.token) {
            throw new Error('AUTENTIQUE_TOKEN não configurado no .env');
        }

        console.log(`[AutentiqueService] Baixando PDF da URL: ${fileUrl}...`);
        const pdfResponse = await fetch(fileUrl);
        if (!pdfResponse.ok) {
            throw new Error(`Falha ao baixar PDF gerado: ${pdfResponse.statusText}`);
        }
        
        // Em Node.js >= 18, o retorno de blob() pode ser passado diretamente para o FormData nativo
        const fileBlob = await pdfResponse.blob();

        const operations = {
            query: `
                mutation CreateDocumentMutation(
                    $document: DocumentInput!,
                    $signers: [SignerInput!]!,
                    $file: Upload!
                ) {
                    createDocument(
                        document: $document,
                        signers: $signers,
                        file: $file
                    ) {
                        id
                        name
                        created_at
                        signatures {
                            public_id
                            name
                            email
                            action {
                                name
                            }
                            link {
                                short_link
                            }
                        }
                    }
                }
            `,
            variables: {
                document: {
                    name: documentName
                },
                signers: [
                    {
                        email: signerEmail,
                        action: "SIGN"
                        // Não passamos 'name' no signerInput da Autentique nativamente se não precisar (ou podemos passar).
                        // Se precisarmos, o Autentique não tem o campo 'name' no SignerInput, só na response, 
                        // ou ele pega do cadastro se o email já existir.
                        // Mas de qualquer forma, a API só pede o email e action.
                    }
                ],
                file: null
            }
        };

        const formData = new FormData();
        formData.append('operations', JSON.stringify(operations));
        formData.append('map', JSON.stringify({ "0": ["variables.file"] }));
        formData.append('0', fileBlob, 'contrato_assessoria.pdf');

        console.log(`[AutentiqueService] Enviando requisição para Autentique...`);
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                // NÃO defina o Content-Type para multipart/form-data manualmente no fetch,
                // pois o fetch calcula automaticamente o boundary e define o Content-Type.
            },
            body: formData
        });

        const result = await response.json();

        if (result.errors && result.errors.length > 0) {
            console.error('[AutentiqueService] GraphQL Errors:', result.errors);
            throw new Error(`Erro Autentique: ${result.errors[0].message}`);
        }

        console.log('[AutentiqueService] Documento Autentique criado com sucesso:', result.data?.createDocument?.id);
        return result.data?.createDocument;
    }
}

export default new AutentiqueService();
