import { Request, Response } from 'express';
import { SetupService } from '../services/setup.service.js';
import { z } from 'zod';

const connectSupabaseSchema = z.object({
  url: z.string().url('Invalid Supabase Project URL. Must start with https://'),
  anonKey: z.string().min(10, 'Anon Key must be at least 10 characters.'),
  serviceRoleKey: z.string().optional(),
  connectionString: z.string().optional()
});

const executeSqlSchema = z.object({
  sql: z.string().min(10, 'SQL query must be provided.'),
  connectionString: z.string().optional()
});

const createAdminSchema = z.object({
  name: z.string().min(2, 'Administrator name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

const completeSetupSchema = z.object({
  supabase: connectSupabaseSchema.optional(),
  admin: createAdminSchema
});

export class SetupController {
  private static service = SetupService.getInstance();

  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await SetupController.service.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve setup status.' });
    }
  }

  public static async connectSupabase(req: Request, res: Response): Promise<void> {
    try {
      const parsed = connectSupabaseSchema.parse(req.body);
      const result = await SetupController.service.connectSupabase(parsed);
      res.json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(400).json({ error: err.message || 'Supabase connection failed.' });
    }
  }

  public static async verifyTables(req: Request, res: Response): Promise<void> {
    try {
      const result = await SetupController.service.verifyTables();
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to verify tables.' });
    }
  }

  public static async executeSql(req: Request, res: Response): Promise<void> {
    try {
      const parsed = executeSqlSchema.parse(req.body);
      const result = await SetupController.service.executeSql(parsed.sql, parsed.connectionString);
      res.json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(400).json({ error: err.message || 'SQL execution failed.' });
    }
  }

  public static async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createAdminSchema.parse(req.body);
      const result = await SetupController.service.createAdmin(parsed);
      res.status(201).json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(400).json({ error: err.message || 'Failed to create administrator.' });
    }
  }

  public static async completeSetup(req: Request, res: Response): Promise<void> {
    try {
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
