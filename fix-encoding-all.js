const fs = require('fs');
const path = require('path');

const replacements = {
    // Triple encoded (just in case)
    'ÃƒÆ’Ã‚Â¡': 'á', 'ÃƒÆ’Ã‚Â©': 'é', 'ÃƒÆ’Ã‚Â³': 'ó', 'ÃƒÆ’Ã‚Â§': 'ç', 'ÃƒÆ’Ã‚Â£': 'ã',

    // Double encoded
    'ÃƒÂ¡': 'á', 'ÃƒÂ ': 'à', 'ÃƒÂ¢': 'â', 'ÃƒÂ£': 'ã', 'ÃƒÂ¤': 'ä',
    'ÃƒÂ©': 'é', 'ÃƒÂ¨': 'è', 'ÃƒÂª': 'ê', 'ÃƒÂ«': 'ë',
    'ÃƒÂ\\xAD': 'í', 'ÃƒÂ¬': 'ì', 'ÃƒÂ®': 'î', 'ÃƒÂ¯': 'ï', // use hex for invisible char
    'ÃƒÂ³': 'ó', 'ÃƒÂ²': 'ò', 'ÃƒÂ´': 'ô', 'ÃƒÂµ': 'õ', 'ÃƒÂ¶': 'ö',
    'ÃƒÂº': 'ú', 'ÃƒÂ¹': 'ù', 'ÃƒÂ»': 'û', 'ÃƒÂ¼': 'ü',
    'ÃƒÂ§': 'ç', 'ÃƒÂ±': 'ñ', 'ÃƒÂ‡': 'Ç',

    // Single encoded
    'Ã¡': 'á', 'Ã ': 'à', 'Ã¢': 'â', 'Ã£': 'ã', 'Ã¤': 'ä',
    'Ã©': 'é', 'Ã¨': 'è', 'Ãª': 'ê', 'Ã«': 'ë',
    'Ã\xAD': 'í', 'Ã¬': 'ì', 'Ã®': 'î', 'Ã¯': 'ï',
    'Ã³': 'ó', 'Ã²': 'ò', 'Ã´': 'ô', 'Ãµ': 'õ', 'Ã¶': 'ö',
    'Ãº': 'ú', 'Ã¹': 'ù', 'Ã»': 'û', 'Ã¼': 'ü',
    'Ã§': 'ç', 'Ã‡': 'Ç',
    'Ã‘': 'Ñ', 'Ã±': 'ñ',
    'Ã\\xa0': 'à',
    
    // Some uppercase common single encodings
    'Ã\x81': 'Á', 'Ã\x89': 'É', 'Ã\x8D': 'Í', 'Ã\x93': 'Ó', 'Ã\x9A': 'Ú',
    'Ã\x83': 'Ã', 'Ã\x95': 'Õ', 'Ã\x82': 'Â', 'Ã\x8A': 'Ê', 'Ã\x94': 'Ô'
};

// Also 'AÃ§Ã£o' => Ação, 'AÃƒÂ§ÃƒÂ£o' => Ação... handled by above.
// For the Ã­ problem, Ã + xAD. Let's explicitly replace the visual characters we see in grep.

// Removing accents only for logs (backend logs/responses if they are just basic, but wait - the user rules say: "Logs e respostas em texto: sem emojis e sem caracteres especiais". So res.json responses? No, "respostas em texto", usually means prompts or generic logs.)
// Actually the user stated: "Logs e respostas em texto: sem emojis e sem caracteres especiais"
// I will apply the encoding fixes everywhere, and then strip accents from console.log/error/warn

function fixEncodingForLogs(str) {
    if (!str) return str;
    return str
        .replace(/[áàâãä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòôõö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/ç/g, 'c')
        .replace(/[ÁÀÂÃÄ]/g, 'A')
        .replace(/[ÉÈÊË]/g, 'E')
        .replace(/[ÍÌÎÏ]/g, 'I')
        .replace(/[ÓÒÔÕÖ]/g, 'O')
        .replace(/[ÚÙÛÜ]/g, 'U')
        .replace(/Ç/g, 'C');
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    // 1. Replace double-encoded and single-encoded
    for (const [bad, good] of Object.entries(replacements)) {
        // Special replacement for Ã­ since it might be parsed weirdly depending on how node reads the file.
        const regex = new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, good);
    }
    
    // Explicit manual overrides to be safe
    content = content.replace(/ÃƒÂ£/g, 'ã');
    content = content.replace(/ÃƒÂ©/g, 'é');
    content = content.replace(/ÃƒÂ³/g, 'ó');
    content = content.replace(/ÃƒÂ§/g, 'ç');
    content = content.replace(/ÃƒÂ¡/g, 'á');
    content = content.replace(/ÃƒÂ­/g, 'í');
    content = content.replace(/ÃƒÂµ/g, 'õ');
    
    content = content.replace(/Ã£/g, 'ã');
    content = content.replace(/Ã©/g, 'é');
    content = content.replace(/Ã³/g, 'ó');
    content = content.replace(/Ã§/g, 'ç');
    content = content.replace(/Ã¡/g, 'á');
    content = content.replace(/Ã­/g, 'í');
    content = content.replace(/Ãµ/g, 'õ');
    
    content = content.replace(/AÃ§Ã£o/g, 'Ação');
    content = content.replace(/NecessÃ¡ria/g, 'Necessária');

    // 2. Format logs without accents
    // Only matching string literals inside console.log|error|warn|info
    content = content.replace(
        /console\.(log|error|warn|info|debug)\(([\s\S]*?)\)/g,
        (match) => {
             return fixEncodingForLogs(match);
        }
    );
    
    // 3. Optional: backend responses shouldn't have special chars? The rule says "Logs e respostas em texto: sem emojis e sem caracteres especiais. Telas de frontend: caracteres especiais são permitidos". 
    // Backend responses inside res.json({ message: '...' }) might need to have no accents. 
    // But wait, the front-end will display these! The rule says "Logs e respostas em texto". Might refer to ChatGPT text responses or similar.
    // I will leave res.json alone except for the fix, but wait, the prompt asks to "fix these errors" which means making them accents again.
    // So fixing encoding is enough.

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed: ${filePath}`);
    }
}

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== 'dist' && f !== '.git' && f !== 'build') {
                walkDir(dirPath, callback);
            }
        } else {
            if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
                callback(dirPath);
            }
        }
    });
}

walkDir(path.join(__dirname, 'backend', 'src'), processFile);
walkDir(path.join(__dirname, 'frontendBoraExpandir', 'src'), processFile);

console.log('Encoding fix complete!');
