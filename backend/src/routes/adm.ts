import { Router } from 'express';
import AdmController from '../controllers/adm/AdmController';
import ContratosTemplateController from '../controllers/adm/ContratosTemplateController';

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

// Rotas de Contratos
router.get('/contratos', ContratosTemplateController.list);
router.get('/contratos/:id', ContratosTemplateController.getById);
router.post('/contratos', ContratosTemplateController.create);
router.put('/contratos/:id', ContratosTemplateController.update);
router.delete('/contratos/:id', ContratosTemplateController.delete);

export default router;
