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
    async createDocument(
        documentName: string,
        fileUrl: string,
        signerName: string,
        signerEmail: string,
        positions?: { x: number; y: number; z: number }[]
    ) {
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
                        action: "SIGN",
                        positions: positions || [
                            {
                                x: 25,
                                y: 30,
                                z: 0 // Placeholder: 0 will be replaced by total pages in a more robust way, or handled as "last page" by some APIs
                            }
                        ]
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
     * @param documentName Nome do documento.
     * @param fileUrl URL publica do PDF gerado.
     * @param signerName Nome do cliente signatario.
     * @param signerEmail E-mail do cliente signatario.
     * @param signaturesData Opcional: Dados de posicionamento para cliente e empresa.
     * @returns ID e informacoes do documento criado na Autentique.
     */
    async createDocumentWithCompanySignature(
        documentName: string,
        fileUrl: string,
        signerName: string,
        signerEmail: string,
        signaturesData?: {
            cliente: { x: number, y: number, z: number },
            empresa: { x: number, y: number, z: number }
        }
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

        // Se nao vier signaturesData, vamos usar um padrao conservador.
        // O ideal e que o frontend envie esses dados apos carregar o PDF.
        const clientePos = signaturesData?.cliente || { x: 25, y: 30, z: 1 };
        const empresaPos = signaturesData?.empresa || { x: 75, y: 30, z: 1 };

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
                        action: "SIGN",
                        positions: [
                            {
                                x: empresaPos.x.toString(),
                                y: empresaPos.y.toString(),
                                z: empresaPos.z
                            }
                        ]
                    },
                    {
                        email: signerEmail,
                        action: "SIGN",
                        positions: [
                            {
                                x: clientePos.x.toString(),
                                y: clientePos.y.toString(),
                                z: clientePos.z
                            }
                        ]
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

        // Apos a empresa assinar, buscar a URL do PDF com a assinatura da empresa
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const docWithFiles = await this.getDocument(autentiqueDoc.id);
            if (docWithFiles?.files?.signed) {
                autentiqueDoc.signed_file_url = docWithFiles.files.signed;
                console.log(`[AutentiqueService] URL do documento com assinatura da empresa obtida com sucesso.`);
            } else {
                console.warn('[AutentiqueService] files.signed nao disponivel apos assinatura da empresa.');
            }
        } catch (fetchErr) {
            console.warn('[AutentiqueService] Nao foi possivel obter URL assinada apos assinatura da empresa:', fetchErr);
        }

        return autentiqueDoc;
    }
    /**
     * Busca um documento na Autentique pelo ID, retornando as URLs dos arquivos (original e assinado).
     * Usado como fallback quando o webhook nao inclui files.signed no payload.
     */
    async getDocument(documentId: string) {
        if (!this.token) {
            throw new Error('AUTENTIQUE_TOKEN nao configurado no .env');
        }

        const body = JSON.stringify({
            query: `
                query {
                    document(id: "${documentId}") {
                        id
                        name
                        files {
                            original
                            signed
                        }
                        signatures {
                            public_id
                            name
                            email
                            signed {
                                created_at
                            }
                        }
                    }
                }
            `
        });

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
            throw new Error(`Erro ao buscar documento Autentique: ${result.errors[0].message}`);
        }

        return result.data?.document || null;
    }
}

export default new AutentiqueService();
