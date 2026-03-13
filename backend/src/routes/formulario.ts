import { Router } from 'express'
import multer, { FileFilterCallback } from 'multer'
import FormularioController from '../controllers/FormularioController'

const formulario = Router()

// Configuração do multer para upload de comprovante em memória
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG, WebP ou PDF.'))
        }
    }
})

// POST /formulario/consultoria — Formulário público de consultoria
formulario.post('/consultoria', FormularioController.submitConsultoria.bind(FormularioController))

// GET /formulario/consultoria/:agendamento_id/status — Status público do agendamento (sem auth)
formulario.get('/consultoria/:agendamento_id/status', FormularioController.getAgendamentoStatus.bind(FormularioController))

// POST /formulario/comprovante — Upload de comprovante PIX
formulario.post('/comprovante', upload.single('comprovante'), FormularioController.uploadComprovante.bind(FormularioController))

export default formulario
