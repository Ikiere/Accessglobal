import { Router } from 'express';
import { ReviewsController } from '../controllers/reviews.controller.js';

const router = Router();

router.get('/', ReviewsController.getAll);
router.post('/', ReviewsController.create);

export default router;
