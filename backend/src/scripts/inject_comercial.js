const fs = require('fs');
const path = require('path');

const targetFile = 'C:/Users/natha/Documents/Caji/BoraExpandirPlataforma/backend/src/controllers/ComercialController.ts';
let content = fs.readFileSync(targetFile, 'utf8');

const targetString = `            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                etapa_fluxo: etapaNumerica,
                draft_dados: mergedDraft,
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({ data: updatedData })`;

const replacementString = `            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                etapa_fluxo: etapaNumerica,
                draft_dados: mergedDraft,
                atualizado_em: new Date().toISOString()
            })

            if (contrato.cliente_id) {
                await DNAService.mergeDNA(contrato.cliente_id, mergedDraft, 'MEDIUM')
            }

            return res.status(200).json({ data: updatedData })`;

if (content.includes(targetString)) {
    content = content.replace(targetString, replacementString);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log("Successfully replaced the draft_dados block in ComercialController.ts");
} else {
    // try to find it with flexible whitespace
    const regex = /const updatedData = await ContratoServicoRepository\.updateContrato\(id, \{\s*etapa_fluxo: etapaNumerica,\s*draft_dados: mergedDraft,\s*atualizado_em: new Date\(\)\.toISOString\(\)\s*\}\)\s*return res\.status\(200\)\.json\(\{ data: updatedData \}\)/g;
    if (regex.test(content)) {
        content = content.replace(regex, replacementString);
        fs.writeFileSync(targetFile, content, 'utf8');
        console.log("Successfully replaced the draft_dados block in ComercialController.ts using RegExp");
    } else {
        console.error("Target string not found. Please review the file content.");
    }
}
