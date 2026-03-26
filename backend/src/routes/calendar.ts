import { Router } from 'express';
import CalendarController from '../controllers/calendar/CalendarController';

const router = Router();

// Rotas de conexão
router.get('/connect', CalendarController.getConnectionUrl);
router.get('/status', CalendarController.getConnectionStatus);
router.get('/callback', CalendarController.handleCallback);
router.delete('/disconnect', CalendarController.disconnect);

// Rotas de eventos
router.post('/events', CalendarController.createEvent);
router.put('/events/:eventId', CalendarController.updateEvent);
router.delete('/events/:eventId', CalendarController.deleteEvent);

export default router;
