import { Request, Response } from 'express';
import { RepositoryService } from '../services/repository.service.js';
import { SupabaseService } from '../services/supabase.service.js';

export class StatsController {
  private static repo = RepositoryService.getInstance();
  private static supabase = SupabaseService.getInstance();

  public static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await StatsController.repo.getStats();
      const supabaseStatus = await StatsController.supabase.getStatus();

      res.json({
        ...stats,
        supabaseConnected: supabaseStatus.connected,
        dataSource: supabaseStatus.connected ? 'supabase' : 'local-resilient-vault'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch dashboard statistics.' });
    }
  }
}
