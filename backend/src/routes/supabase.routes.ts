import { Router } from 'express';
import { SupabaseController } from '../controllers/supabase.controller.js';

const router = Router();

router.get('/status', SupabaseController.getStatus);
router.post('/test', SupabaseController.testConnection);
router.post('/connect', SupabaseController.connect);
router.post('/disconnect', SupabaseController.disconnect);
router.get('/schema', SupabaseController.getSchema);

export default router;
