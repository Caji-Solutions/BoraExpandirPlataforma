import { Router } from 'express';
import ApostilamentoController from '../controllers/ApostilamentoController';

const router = Router();

// POST /apostilamentos/solicitar - Solicitar apostilamento
router.post('/solicitar', ApostilamentoController.solicitar);

// PATCH /apostilamentos/:id/status - Atualizar status
router.patch('/:id/status', ApostilamentoController.updateStatus);

// GET /apostilamentos - Listar todos
router.get('/', ApostilamentoController.getAll);

export default router;
