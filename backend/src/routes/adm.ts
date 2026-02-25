import { Router } from 'express';
import AdmController from '../controllers/AdmController';

const router = Router();

// Rotas do Catálogo de Serviços
router.get('/catalog', AdmController.getCatalog);
router.post('/catalog', AdmController.createService);
router.patch('/catalog/:id', AdmController.updateService);
router.delete('/catalog/:id', AdmController.deleteService);

export default router;
