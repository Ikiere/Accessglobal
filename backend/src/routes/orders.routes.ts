import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller.js';

const router = Router();

router.get('/', OrdersController.getAll);
router.post('/', OrdersController.create);
router.put('/:id/status', OrdersController.updateStatus);

export default router;
