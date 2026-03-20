class AutentiqueService {
    private get token() {
        return process.env.AUTENTIQUE_TOKEN;
    }

    private get apiUrl() {
        return 'https://api.autentique.com.br/v2/graphql';
    }

    private get companyEmail() {
        return process.env.AUTENTIQUE_COMPANY_EMAIL || '';
    }

    /**
     * Executa a mutation signDocument na Autentique para assinar automaticamente
     * com a conta vinculada ao token da API (empresa).
     */
    private async signDocument(documentId: string): Promise<boolean> {
        if (!this.token) {
            throw new Error('AUTENTIQUE_TOKEN nao configurado no .env');
        }

        const body = JSON.stringify({
            query: `mutation { signDocument(id: "${documentId}") }`
        });

        console.log(`[AutentiqueService] Assinando documento ${documentId} como empresa...`);

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body
        });

        const result = await response.json();

        if (result.errors && result.errors.length > 0) {
            console.error('[AutentiqueService] Erro ao assinar documento como empresa:', result.errors);
            throw new Error(`Erro ao assinar como empresa: ${result.errors[0].message}`);
        }

        console.log(`[AutentiqueService] Documento ${documentId} assinado com sucesso pela empresa.`);
        return true;
    }

    /**
     * Cria um documento na Autentique para assinatura.
     * Faz download do PDF da URL fornecida e envia via GraphQL multipart request.
     *
     * @param documentName Nome do documento que aparecera para o signatario.
     * @param fileUrl URL publica do PDF gerado.
     * @param signerName Nome do cliente signatario.
     * @param signerEmail E-mail do cliente signatario.
     * @returns ID e informacoes do documento criado.
     */
    async createDocument(documentName: string, fileUrl: string, signerName: string, signerEmail: string) {
        if (!this.token) {
            throw new Error('AUTENTIQUE_TOKEN nao configurado no .env');
        }

        console.log(`[AutentiqueService] Baixando PDF da URL: ${fileUrl}...`);
        const pdfResponse = await fetch(fileUrl);
        if (!pdfResponse.ok) {
            throw new Error(`Falha ao baixar PDF gerado: ${pdfResponse.statusText}`);
        }

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
                    }
                ],
                file: null
            }
        };

        const formData = new FormData();
        formData.append('operations', JSON.stringify(operations));
        formData.append('map', JSON.stringify({ "0": ["variables.file"] }));
        formData.append('0', fileBlob, 'contrato_assessoria.pdf');

        console.log(`[AutentiqueService] Enviando requisicao para Autentique...`);

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
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

    /**
     * Cria um documento na Autentique com 2 signatarios: empresa + cliente.
     * Apos a criacao, assina automaticamente como empresa usando a conta do token.
     *
     * REQUISITO: o email da empresa (AUTENTIQUE_COMPANY_EMAIL) deve estar cadastrado
     * na conta Autentique vinculada ao token, caso contrario a assinatura automatica
     * retornara 'signature_not_found'.
     *
     * @param documentName Nome do documento.
     * @param fileUrl URL publica do PDF gerado.
     * @param signerName Nome do cliente signatario.
     * @param signerEmail E-mail do cliente signatario.
     * @returns ID e informacoes do documento criado na Autentique.
     */
    async createDocumentWithCompanySignature(
        documentName: string,
        fileUrl: string,
        signerName: string,
        signerEmail: string
    ) {
        if (!this.token) {
            throw new Error('AUTENTIQUE_TOKEN nao configurado no .env');
        }
        if (!this.companyEmail) {
            throw new Error('AUTENTIQUE_COMPANY_EMAIL nao configurado no .env');
        }

        console.log(`[AutentiqueService] Baixando PDF da URL: ${fileUrl}...`);
        const pdfResponse = await fetch(fileUrl);
        if (!pdfResponse.ok) {
            throw new Error(`Falha ao baixar PDF gerado: ${pdfResponse.statusText}`);
        }

        const fileBlob = await pdfResponse.blob();

        // Criamos o documento com 2 signatarios: empresa (primeiro) + cliente
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
                        email: this.companyEmail,
                        action: "SIGN"
                    },
                    {
                        email: signerEmail,
                        action: "SIGN"
                    }
                ],
                file: null
            }
        };

        const formData = new FormData();
        formData.append('operations', JSON.stringify(operations));
        formData.append('map', JSON.stringify({ "0": ["variables.file"] }));
        formData.append('0', fileBlob, 'contrato.pdf');

        console.log(`[AutentiqueService] Criando documento na Autentique com 2 signatarios...`);

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData
        });

        const result = await response.json();

        if (result.errors && result.errors.length > 0) {
            console.error('[AutentiqueService] GraphQL Errors ao criar documento:', result.errors);
            throw new Error(`Erro ao criar documento na Autentique: ${result.errors[0].message}`);
        }

        const autentiqueDoc = result.data?.createDocument;
        if (!autentiqueDoc?.id) {
            throw new Error('Autentique nao retornou ID do documento criado');
        }

        console.log('[AutentiqueService] Documento criado:', autentiqueDoc.id);

        // Assinar automaticamente como empresa
        try {
            await this.signDocument(autentiqueDoc.id);
            console.log(`[AutentiqueService] Empresa assinou o documento ${autentiqueDoc.id} com sucesso.`);
        } catch (signErr) {
            // Nao bloqueia o fluxo se a assinatura automatica falhar
            console.error('[AutentiqueService] Falha ao assinar automaticamente como empresa:', signErr);
        }

        return autentiqueDoc;
    }
}

export default new AutentiqueService();
