const fs = require('fs');
const path = require('path');

const replacements = {
    'Ã¡': 'á', 'Ã ': 'à', 'Ã¢': 'â', 'Ã£': 'ã',
    'Ã©': 'é', 'Ã¨': 'è', 'Ãª': 'ê',
    'Ã­': 'í', 'Ã¬': 'ì', 'Ã®': 'î',
    'Ã³': 'ó', 'Ã²': 'ò', 'Ã´': 'ô', 'Ãµ': 'õ',
    'Ãº': 'ú', 'Ã¹': 'ù', 'Ã»': 'û',
    'Ã§': 'ç', 'Ã‡': 'Ç',
    'Ã‘': 'Ñ', 'Ã±': 'ñ',
    'Ã\\xa0': 'à' // sometimes seen
};

function fixEncodingForLogs(str) {
    if (!str) return str;
    return str
        .replace(/[áàâã]/g, 'a')
        .replace(/[éèê]/g, 'e')
        .replace(/[íìî]/g, 'i')
        .replace(/[óòôõ]/g, 'o')
        .replace(/[úùû]/g, 'u')
        .replace(/ç/g, 'c')
        .replace(/[ÁÀÂÃ]/g, 'A')
        .replace(/[ÉÈÊ]/g, 'E')
        .replace(/[ÍÌÎ]/g, 'I')
        .replace(/[ÓÒÔÕ]/g, 'O')
        .replace(/[ÚÙÛ]/g, 'U')
        .replace(/Ç/g, 'C');
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    // 1. Relpace bad encoding tokens with actual utf-8 characters first
    for (const [bad, good] of Object.entries(replacements)) {
        content = content.replace(new RegExp(bad, 'g'), good);
    }
    
    // also explicit fixes for the known issues:
    content = content.replace(/NÃ£o Ã©/g, 'Não é');
    content = content.replace(/ServiÃ§o nÃ£o Ã©/g, 'Serviço não é');
    content = content.replace(/Ã /g, 'à'); // another variant of à
    
    // 2. Fix console.log / console.error strings to not have special chars
    // This regex looks for console.log/error/warn/info( ... ) and strips accents inside strings
    content = content.replace(
        /console\.(log|error|warn|info)\(([\s\S]*?)\)/g,
        (match) => {
             // inside the console.log call, we want to replace accents in string literals
             // It's a bit tricky to parse perfectly, but we'll try replacing all accents inside it
             return fixEncodingForLogs(match);
        }
    );
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
    } else {
        console.log(`No fixes needed for: ${filePath}`);
    }
}

const files = [
    'backend/src/controllers/ComercialController.ts',
    'backend/src/controllers/ClienteController.ts',
    'backend/src/controllers/FinanceiroController.ts',
    'backend/src/routes/cliente.ts',
    'backend/src/routes/comercial.ts',
    'frontendBoraExpandir/src/modules/comercial/Comercial1.tsx',
    'frontendBoraExpandir/src/modules/comercial/services/comercialService.ts'
];

files.forEach(f => {
    const fullPath = path.join('c:/Users/natha/Documents/Caji/BoraExpandirPlataforma', f);
    if (fs.existsSync(fullPath)) {
        processFile(fullPath);
    } else {
        console.error(`File not found: ${fullPath}`);
    }
});
