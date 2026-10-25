import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';
import { VaultService } from './vault.service.js';
import { SupabaseConfigStatus, SupabaseCredentials } from '../types/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_FILE = path.resolve(__dirname, '../data/supabase-schema.sql');

export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient | null = null;
  private activeUrl: string = '';
  private activeSource: 'env' | 'vault' | 'none' = 'none';
  private hasServiceKey: boolean = false;

  private constructor() {
    this.initializeClient();
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public initializeClient(): boolean {
    // 1. Priority: Vault stored credentials
    const vaultCreds = VaultService.getVaultCredentials();
    if (vaultCreds && vaultCreds.url && (vaultCreds.serviceRoleKey || vaultCreds.anonKey)) {
      const keyToUse = vaultCreds.serviceRoleKey || vaultCreds.anonKey;
      this.client = createClient(vaultCreds.url, keyToUse, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      this.activeUrl = vaultCreds.url;
      this.activeSource = 'vault';
      this.hasServiceKey = Boolean(vaultCreds.serviceRoleKey);
      return true;
    }

    // 2. Secondary: Environment variables
    if (config.supabase.url && (config.supabase.serviceRoleKey || config.supabase.anonKey)) {
      const keyToUse = config.supabase.serviceRoleKey || config.supabase.anonKey;
      this.client = createClient(config.supabase.url, keyToUse, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      this.activeUrl = config.supabase.url;
      this.activeSource = 'env';
      this.hasServiceKey = Boolean(config.supabase.serviceRoleKey);
      return true;
    }

    // 3. Fallback: No credentials
    this.client = null;
    this.activeUrl = '';
    this.activeSource = 'none';
    this.hasServiceKey = false;
    return false;
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public isConnected(): boolean {
    return this.client !== null;
  }

  public async testConnection(url: string, key: string): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const cleanUrl = url.trim().replace(/\/$/, '');
      const testClient = createClient(cleanUrl, key.trim(), {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      // Probe Supabase with a lightweight select
      const { error } = await testClient
        .from('products')
        .select('id', { head: true, count: 'exact' });

      // Note: If table does not exist, PostgreSQL error code 42P01 means connection succeeded, just table not created yet
      if (error && error.code !== 'PGRST116' && error.code !== '42P01' && !error.message?.includes('does not exist')) {
        // Authentication or URL error
        if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('apikey')) {
          return { success: false, message: 'Authentication failed. Please verify your Supabase API key.' };
        }
      }

      return {
        success: true,
        message: 'Successfully connected to Supabase project.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to establish connection to Supabase.'
      };
    }
  }

  public async getStatus(): Promise<SupabaseConfigStatus> {
    const isConn = this.isConnected();
    const maskedUrl = this.activeUrl
      ? this.activeUrl.replace(/^(https?:\/\/)([^.]+)(.*)$/, '$1$2$3')
      : '';

    const tablesStatus = {
      products: false,
      categories: false,
      orders: false,
      users: false,
      reviews: false
    };

    if (this.client) {
      try {
        const [prodRes, catRes, ordRes, usrRes, revRes] = await Promise.allSettled([
          this.client.from('products').select('id', { head: true, count: 'exact' }),
          this.client.from('categories').select('id', { head: true, count: 'exact' }),
          this.client.from('orders').select('id', { head: true, count: 'exact' }),
          this.client.from('users').select('id', { head: true, count: 'exact' }),
          this.client.from('reviews').select('id', { head: true, count: 'exact' })
        ]);

        tablesStatus.products = prodRes.status === 'fulfilled' && !prodRes.value.error;
        tablesStatus.categories = catRes.status === 'fulfilled' && !catRes.value.error;
        tablesStatus.orders = ordRes.status === 'fulfilled' && !ordRes.value.error;
        tablesStatus.users = usrRes.status === 'fulfilled' && !usrRes.value.error;
        tablesStatus.reviews = revRes.status === 'fulfilled' && !revRes.value.error;
      } catch (err) {
        console.warn('[SupabaseService] Table status probe error:', err);
      }
    }

    return {
      connected: isConn,
      source: this.activeSource,
      projectUrl: maskedUrl,
      hasServiceRoleKey: this.hasServiceKey,
      tablesStatus,
      lastChecked: new Date().toISOString()
    };
  }

  public async connect(creds: SupabaseCredentials): Promise<{ success: boolean; message: string }> {
    const keyToTest = creds.serviceRoleKey || creds.anonKey;
    const test = await this.testConnection(creds.url, keyToTest);
    if (!test.success) {
      return test;
    }

    // Save encrypted in vault
    VaultService.saveVaultCredentials({
      url: creds.url.trim().replace(/\/$/, ''),
      anonKey: creds.anonKey.trim(),
      serviceRoleKey: creds.serviceRoleKey ? creds.serviceRoleKey.trim() : undefined
    });

    this.initializeClient();
    return { success: true, message: 'Supabase credentials encrypted and connected successfully.' };
  }

  public disconnect(): { success: boolean; message: string } {
    VaultService.clearVault();
    this.initializeClient();
    return { success: true, message: 'Supabase vault credentials cleared. Switched to fallback store.' };
  }

  public getSchemaSql(): string {
    if (fs.existsSync(SCHEMA_FILE)) {
      return fs.readFileSync(SCHEMA_FILE, 'utf8');
    }
    return '-- Schema file not found';
  }

  public getPublicConfig(): { url: string; anonKey: string; isConfigured: boolean } {
    const vault = VaultService.getVaultCredentials();
    if (vault && vault.url && vault.anonKey) {
      return { url: vault.url, anonKey: vault.anonKey, isConfigured: true };
    }
    if (config.supabase.url && config.supabase.anonKey) {
      return { url: config.supabase.url, anonKey: config.supabase.anonKey, isConfigured: true };
    }
    return { url: '', anonKey: '', isConfigured: false };
  }
}
