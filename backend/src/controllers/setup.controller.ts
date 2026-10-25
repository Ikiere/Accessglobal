import { Request, Response } from 'express';
import { SetupService } from '../services/setup.service.js';
import { z } from 'zod';

const completeSetupSchema = z.object({
  supabase: z.object({
    url: z.string().url('Invalid Supabase Project URL. Must start with https://'),
    anonKey: z.string().min(10, 'Anon Key must be at least 10 characters.'),
    serviceRoleKey: z.string().optional()
  }).optional(),
  admin: z.object({
    name: z.string().min(2, 'Administrator name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.')
  }),
  useSandbox: z.boolean().optional()
});

export class SetupController {
  private static service = SetupService.getInstance();

  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = SetupController.service.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve setup status.' });
    }
  }

  public static async completeSetup(req: Request, res: Response): Promise<void> {
    try {
      if (SetupController.service.isInstalled()) {
        res.status(403).json({ error: 'System installation has already been completed and permanently sealed.' });
        return;
      }

      const parsed = completeSetupSchema.parse(req.body);
      const result = await SetupController.service.completeSetup(parsed);
      res.status(201).json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(400).json({ error: err.message || 'Setup execution failed.' });
    }
  }
}
