import { Router } from 'express';
import { SetupController } from '../controllers/setup.controller.js';

const router = Router();

router.get('/status', SetupController.getStatus);
router.post('/connect-supabase', SetupController.connectSupabase);
router.get('/verify-tables', SetupController.verifyTables);
router.post('/execute-sql', SetupController.executeSql);
router.post('/create-admin', SetupController.createAdmin);
router.post('/complete', SetupController.completeSetup);

export default router;
