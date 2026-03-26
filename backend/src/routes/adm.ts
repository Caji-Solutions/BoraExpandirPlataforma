import { Router } from 'express';
import AdmController from '../controllers/adm/AdmController';

const router = Router();

// Rotas do Catalogo de Servicos
router.get('/catalog', AdmController.getCatalog);
router.post('/catalog', AdmController.createService);
router.patch('/catalog/:id', AdmController.updateService);
router.delete('/catalog/:id', AdmController.deleteService);

// Rotas de Subservicos
router.get('/subservices', AdmController.getSubservices);
router.post('/subservices', AdmController.createSubservice);
router.patch('/subservices/:id', AdmController.updateSubservice);
router.delete('/subservices/:id', AdmController.deleteSubservice);

export default router;
