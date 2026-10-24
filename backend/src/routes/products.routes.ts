import { Router } from 'express';
import { ProductsController } from '../controllers/products.controller.js';

const router = Router();

router.get('/', ProductsController.getAll);
router.get('/:id', ProductsController.getById);
router.post('/', ProductsController.create);
router.put('/:id', ProductsController.update);
router.delete('/:id', ProductsController.delete);

export default router;
