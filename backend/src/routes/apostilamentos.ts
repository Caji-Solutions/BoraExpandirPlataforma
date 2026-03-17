import { Router } from 'express';
import multer from 'multer';
import ApostilamentoController from '../controllers/ApostilamentoController';

const router = Router();

// Configuração do multer para upload de comprovante de apostila
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /apostilamentos/solicitar - Solicitar apostilamento
router.post('/solicitar', ApostilamentoController.solicitar);

// PATCH /apostilamentos/:id/status - Atualizar status
router.patch('/:id/status', ApostilamentoController.updateStatus);

// GET /apostilamentos - Listar todos
router.get('/', ApostilamentoController.getAll);

// POST /apostilamentos/:id/submit-comprovante - Enviar comprovante
router.post('/:id/submit-comprovante', upload.single('comprovante'), ApostilamentoController.submitComprovante);

export default router;
