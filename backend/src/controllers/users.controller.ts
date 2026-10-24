import { Request, Response } from 'express';
import { RepositoryService } from '../services/repository.service.js';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(['admin', 'manager', 'user']).default('user'),
  status: z.enum(['active', 'suspended', 'pending']).default('active'),
  avatar: z.string().optional()
});

export class UsersController {
  private static repo = RepositoryService.getInstance();

  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await UsersController.repo.getUsers();
      res.json({ users, count: users.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch users.' });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createUserSchema.parse(req.body);
      const user = await UsersController.repo.createUser(parsed);
      const { passwordHash: _, ...safeUser } = user;
      res.status(201).json({ user: safeUser });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(500).json({ error: err.message || 'Failed to create user.' });
    }
  }
}
