import { Router, Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import TraducoesController from '../controllers/TraducoesController'

const router = Router()

// Multer config for file uploads (translated documents)
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png'
        ]
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Tipo de arquivo não permitido.'))
        }
    }
})

// GET /api/traducoes/orcamentos/pendentes
router.get('/orcamentos/pendentes', TraducoesController.getOrcamentos)

// POST /api/traducoes/orcamentos
router.post('/orcamentos', TraducoesController.responderOrcamento)

// GET /api/traducoes/orcamentos/documento/:documentoId
router.get('/orcamentos/documento/:documentoId', TraducoesController.getOrcamentoByDocumento)

// POST /api/traducoes/orcamentos/:id/aprovar
router.post('/orcamentos/:id/aprovar', TraducoesController.aprovarOrcamento)

// POST /api/traducoes/orcamentos/:id/aprovar-adm
router.post('/orcamentos/:id/aprovar-adm', TraducoesController.aprovarOrcamentoAdm)

// POST /api/traducoes/checkout/stripe
router.post('/checkout/stripe', TraducoesController.createCheckoutSession)

// GET /api/traducoes/fila - Translation work queue
router.get('/fila', TraducoesController.getFilaDeTrabalho)

// GET /api/traducoes/entregues - Delivered translations
router.get('/entregues', TraducoesController.getEntregues)

// POST /api/traducoes/submit - Submit translated document
router.post('/submit', upload.single('file'), TraducoesController.submitTraducao)

export default router
