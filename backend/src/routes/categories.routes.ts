import { Router } from 'express';
import { CategoriesController } from '../controllers/categories.controller.js';

const router = Router();

router.get('/', CategoriesController.getAll);
router.post('/', CategoriesController.create);
router.delete('/:id', CategoriesController.delete);

export default router;
