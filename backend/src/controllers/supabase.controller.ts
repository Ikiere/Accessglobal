import { Request, Response } from 'express';
import { SupabaseService } from '../services/supabase.service.js';
import { z } from 'zod';

const connectSchema = z.object({
  url: z.string().url('Invalid Supabase Project URL. Must start with https://'),
  anonKey: z.string().min(10, 'Anon Key must be at least 10 characters long.'),
  serviceRoleKey: z.string().optional()
});

const testSchema = z.object({
  url: z.string().url('Invalid Supabase Project URL.'),
  key: z.string().min(10, 'API key must be at least 10 characters long.')
});

export class SupabaseController {
  private static service = SupabaseService.getInstance();

  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await SupabaseController.service.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve Supabase status.' });
    }
  }

  public static async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const parsed = testSchema.parse(req.body);
      const result = await SupabaseController.service.testConnection(parsed.url, parsed.key);
      res.json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(500).json({ error: err.message || 'Test connection failed.' });
    }
  }

  public static async connect(req: Request, res: Response): Promise<void> {
    try {
      const parsed = connectSchema.parse(req.body);
      const result = await SupabaseController.service.connect(parsed);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
      }
      res.status(500).json({ error: err.message || 'Failed to connect Supabase.' });
    }
  }

  public static async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const result = SupabaseController.service.disconnect();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to disconnect Supabase.' });
    }
  }

  public static getSchema(req: Request, res: Response): void {
    try {
      const sql = SupabaseController.service.getSchemaSql();
      res.json({ sql });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to load SQL schema.' });
    }
  }

  public static getPublicConfig(req: Request, res: Response): void {
    try {
      const config = SupabaseController.service.getPublicConfig();
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch public Supabase config.' });
    }
  }
}
