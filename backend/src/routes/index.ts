import { Router } from 'express';
import authRoutes from './auth.routes.js';
import supabaseRoutes from './supabase.routes.js';
import productsRoutes from './products.routes.js';
import categoriesRoutes from './categories.routes.js';
import ordersRoutes from './orders.routes.js';
import usersRoutes from './users.routes.js';
import reviewsRoutes from './reviews.routes.js';
import statsRoutes from './stats.routes.js';
import { SupabaseService } from '../services/supabase.service.js';

const router = Router();

router.get('/health', async (req, res) => {
  const supabaseStatus = await SupabaseService.getInstance().getStatus();
  res.json({
    status: 'ok',
    service: 'accessglobal-backend',
    timestamp: new Date().toISOString(),
    supabase: {
      connected: supabaseStatus.connected,
      source: supabaseStatus.source,
      projectUrl: supabaseStatus.projectUrl
    }
  });
});

router.use('/auth', authRoutes);
router.use('/supabase', supabaseRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/orders', ordersRoutes);
router.use('/users', usersRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/stats', statsRoutes);

export default router;
