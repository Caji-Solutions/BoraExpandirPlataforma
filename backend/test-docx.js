const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

try {
    const content = fs.readFileSync('./assets/contrato-mock.docx', 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' },
    });
    console.log('Parsed successfully!');
} catch (e) {
    if (e.properties && e.properties.errors) {
        console.error('Docxtemplater Errors:');
        e.properties.errors.forEach(err => {
            console.error(`- ${err.message}. Context near: "${err.properties.context}" (Offset: ${err.properties.offset})`);
        });
    } else {
        console.error('Other error:', e);
    }
}
