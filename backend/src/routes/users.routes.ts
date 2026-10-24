import { Router } from 'express';
import { UsersController } from '../controllers/users.controller.js';

const router = Router();

router.get('/', UsersController.getAll);
router.post('/', UsersController.create);

export default router;
