import fs from 'fs';
import path from 'path';
import ContratosTemplateRepository from '../repositories/ContratosTemplateRepository';

async function run() {
    console.log('Iniciando migração do contrato HTML para o banco de dados...');
    
    try {
        const filePath = path.resolve(__dirname, '../../assets/contrato-assessoria.html');
        if (!fs.existsSync(filePath)) {
            console.error('Arquivo nao encontrado: ', filePath);
            process.exit(1);
        }

        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Extrair apenas o que tá dentro das paginas <div class="page-content">
        const regex = /<div class="page-content">([\s\S]*?)<\/div>\s*<div class="page-number">/g;
        let match;
        let conteudoLimpo = '';

        while ((match = regex.exec(html)) !== null) {
            conteudoLimpo += match[1] + '\n';
        }

        if (!conteudoLimpo) {
            console.warn('Nenhum conteudo page-content extraido. Usando fallback grosseiro.');
            conteudoLimpo = html.substring(html.indexOf('<body>') + 6, html.indexOf('</body>'));
        }

        // Fazer limpezas de classes supérfluas que não fazem sentido no editor
        // Mantemos <strong> e <h2> em vez de spans
        let finalHtml = conteudoLimpo
            .replace(/<span class="clause-label([^"]*)">([^<]*)<\/span>/g, '<strong>$2</strong>')
            .replace(/<span class="bold([^"]*)">([^<]*)<\/span>/g, '<strong>$2</strong>')
            .replace(/<span class="highlight-bold([^"]*)">([^<]*)<\/span>/g, '<strong>$2</strong>')
            .replace(/<span class="highlight([^"]*)">([^<]*)<\/span>/g, '$2')
            .replace(/<span style="font-weight:700;">([^<]*)<\/span>/g, '<strong>$1</strong>')
            .replace(/<span class="underline">([^<]*)<\/span>/g, '<u>$1</u>')
            .replace(/class="[^"]*"/g, '') // remove all classes
            .replace(/<h2[^>]*>(.*?)<\/h2>/g, '<h2>$1</h2>')
            .replace(/<h3[^>]*>(.*?)<\/h3>/g, '<h3>$1</h3>')
            .replace(/<h1[^>]*>(.*?)<\/h1>/g, '<h1>$1</h1>');

        // Remover o bloco de assinaturas antigo (porque o master-template cuidará disso)
        finalHtml = finalHtml.replace(/<h2[^>]*>DO FORO<\/h2>[\s\S]*?(?=<\/div>|<div class="page-number|$)/g, '<h2>DO FORO</h2><p>Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da comarca de Ribeirão Preto-SP.</p><p>Por estarem assim justos e contratados, firmam digitalmente o presente instrumento.</p>');

        console.log('Conteudo extraído e limpo com sucesso! Salvando no BD...');

        const novo = await ContratosTemplateRepository.create({
            nome: 'Contrato de Assessoria (Migrado)',
            conteudo_html: finalHtml.trim()
        });

        console.log(`✅ Contrato migrado com sucesso! ID: ${novo?.id}`);
        process.exit(0);

    } catch (e) {
        console.error('Falha ao migrar:', e);
        process.exit(1);
    }
}

run();
