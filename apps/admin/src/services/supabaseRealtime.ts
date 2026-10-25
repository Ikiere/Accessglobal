import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { api, PublicSupabaseConfig } from './api';

export type RealtimeStatus = 'connected' | 'connecting' | 'disconnected' | 'local_fallback';

type ChangeCallback = (payload: any) => void;

class RealtimeService {
  private client: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private status: RealtimeStatus = 'disconnected';
  private statusListeners: Set<(status: RealtimeStatus) => void> = new Set();
  private subscribers: Map<string, Set<ChangeCallback>> = new Map();
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      this.setStatus('connecting');
      const config: PublicSupabaseConfig = await api.getPublicSupabaseConfig();
      if (!config.isConfigured || !config.url || !config.anonKey) {
        this.setStatus('local_fallback');
        return;
      }

      this.client = createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      this.channel = this.client
        .channel('dashboard-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => this.broadcast('orders', payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => this.broadcast('products', payload)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          (payload) => this.broadcast('users', payload)
        )
        .subscribe((subStatus) => {
          if (subStatus === 'SUBSCRIBED') {
            this.setStatus('connected');
          } else if (subStatus === 'CLOSED' || subStatus === 'CHANNEL_ERROR') {
            this.setStatus('disconnected');
          }
        });
    } catch (err) {
      console.warn('[RealtimeService] Supabase Realtime channel fallback:', err);
      this.setStatus('local_fallback');
    }
  }

  public getStatus(): RealtimeStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: RealtimeStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private setStatus(newStatus: RealtimeStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach((fn) => {
      try {
        fn(newStatus);
      } catch (e) {
        console.error(e);
      }
    });
  }

  public subscribe(table: 'orders' | 'products' | 'users' | 'all', callback: ChangeCallback): () => void {
    if (!this.subscribers.has(table)) {
      this.subscribers.set(table, new Set());
    }
    this.subscribers.get(table)!.add(callback);
    return () => {
      this.subscribers.get(table)?.delete(callback);
    };
  }

  private broadcast(table: string, payload: any): void {
    this.subscribers.get(table)?.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.error(e);
      }
    });
    this.subscribers.get('all')?.forEach((cb) => {
      try {
        cb({ table, ...payload });
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export const realtime = new RealtimeService();
