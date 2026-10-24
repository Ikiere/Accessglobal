import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { RepositoryService } from '../services/repository.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.')
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.')
});

export class AuthController {
  private static auth = AuthService.getInstance();
  private static repo = RepositoryService.getInstance();

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await AuthController.auth.login(email, password);
      res.json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(401).json({ error: err.message || 'Authentication failed.' });
    }
  }

  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = registerSchema.parse(req.body);
      const result = await AuthController.auth.register(name, email, password);
      res.status(201).json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }
      const user = await AuthController.repo.getUserByEmail(req.user.email);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch user profile.' });
    }
  }
}
