import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../config/env.js';
import { VaultService } from './vault.service.js';
import { SupabaseConfigStatus, SupabaseCredentials } from '../types/supabase.js';

const { Client: PgClient } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const SETUP_FILE = path.join(DATA_DIR, 'setup.json');
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

  public getProjectRef(url?: string): string {
    const targetUrl = url || this.activeUrl;
    if (!targetUrl) return '';
    const match = targetUrl.match(/^https?:\/\/([^.]+)\.supabase\.co/i);
    return match ? match[1] : '';
  }

  public async testConnection(url: string, key: string): Promise<{ success: boolean; message: string; projectRef: string }> {
    try {
      const cleanUrl = url.trim().replace(/\/$/, '');
      const testClient = createClient(cleanUrl, key.trim(), {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      // Probe Supabase with a lightweight select
      const { error } = await testClient
        .from('categories')
        .select('id', { head: true, count: 'exact' });

      // Note: If table does not exist, PostgreSQL error code 42P01 / PGRST204 means connection & auth succeeded
      if (error) {
        const isTableMissing =
          error.code === '42P01' ||
          error.code === 'PGRST116' ||
          error.code === 'PGRST204' ||
          error.code === 'PGRST205' ||
          error.message?.toLowerCase().includes('does not exist') ||
          error.message?.toLowerCase().includes('could not find the table') ||
          error.message?.toLowerCase().includes('schema cache');

        if (!isTableMissing) {
          if (
            error.code === 'PGRST301' ||
            error.message?.toLowerCase().includes('jwt') ||
            error.message?.toLowerCase().includes('apikey') ||
            error.message?.toLowerCase().includes('invalid api key')
          ) {
            return {
              success: false,
              message: 'Authentication failed. Please verify your Supabase API key.',
              projectRef: ''
            };
          }
          return {
            success: false,
            message: error.message || 'Supabase returned an unexpected connection error.',
            projectRef: ''
          };
        }
      }

      const match = cleanUrl.match(/^https?:\/\/([^.]+)\.supabase\.co/i);
      const projectRef = match ? match[1] : '';

      return {
        success: true,
        message: 'Successfully reached and authenticated with Supabase project.',
        projectRef
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to establish connection to Supabase.',
        projectRef: ''
      };
    }
  }

  public async getTablesStatus(): Promise<{
    tables: {
      categories: boolean;
      products: boolean;
      orders: boolean;
      users: boolean;
      reviews: boolean;
    };
    allReady: boolean;
  }> {
    const result = {
      tables: {
        categories: false,
        products: false,
        orders: false,
        users: false,
        reviews: false
      },
      allReady: false
    };

    if (!this.client) {
      return result;
    }

    try {
      const [catRes, prodRes, ordRes, usrRes, revRes] = await Promise.allSettled([
        this.client.from('categories').select('id', { head: true, count: 'exact' }),
        this.client.from('products').select('id', { head: true, count: 'exact' }),
        this.client.from('orders').select('id', { head: true, count: 'exact' }),
        this.client.from('users').select('id', { head: true, count: 'exact' }),
        this.client.from('reviews').select('id', { head: true, count: 'exact' })
      ]);

      const isTableAvailable = (res: PromiseSettledResult<any>) => {
        if (res.status !== 'fulfilled') return false;
        const err = res.value.error;
        if (!err) return true;
        // If error indicates table doesn't exist, it's false
        if (
          err.code === '42P01' ||
          err.code === 'PGRST204' ||
          err.code === 'PGRST205' ||
          err.message?.toLowerCase().includes('does not exist') ||
          err.message?.toLowerCase().includes('could not find the table') ||
          err.message?.toLowerCase().includes('schema cache')
        ) {
          return false;
        }
        // Permission errors or empty results mean the table exists!
        return true;
      };

      result.tables.categories = isTableAvailable(catRes);
      result.tables.products = isTableAvailable(prodRes);
      result.tables.orders = isTableAvailable(ordRes);
      result.tables.users = isTableAvailable(usrRes);
      result.tables.reviews = isTableAvailable(revRes);

      result.allReady =
        result.tables.categories &&
        result.tables.products &&
        result.tables.orders &&
        result.tables.users &&
        result.tables.reviews;
    } catch (err) {
      console.warn('[SupabaseService] Error checking tables status:', err);
    }

    return result;
  }

  public async getStatus(): Promise<SupabaseConfigStatus> {
    const isConn = this.isConnected();
    const maskedUrl = this.activeUrl
      ? this.activeUrl.replace(/^(https?:\/\/)([^.]+)(.*)$/, '$1$2$3')
      : '';

    const tablesProbe = await this.getTablesStatus();

    return {
      connected: isConn,
      source: this.activeSource,
      projectUrl: maskedUrl,
      hasServiceRoleKey: this.hasServiceKey,
      tablesStatus: tablesProbe.tables,
      allTablesReady: tablesProbe.allReady,
      lastChecked: new Date().toISOString()
    };
  }

  public async connect(creds: SupabaseCredentials): Promise<{ success: boolean; message: string; projectRef: string }> {
    const keyToTest = creds.serviceRoleKey || creds.anonKey;
    const test = await this.testConnection(creds.url, keyToTest);
    if (!test.success) {
      return test;
    }

    // Save encrypted in vault
    VaultService.saveVaultCredentials({
      url: creds.url.trim().replace(/\/$/, ''),
      anonKey: creds.anonKey.trim(),
      serviceRoleKey: creds.serviceRoleKey ? creds.serviceRoleKey.trim() : undefined,
      connectionString: creds.connectionString?.trim() || undefined
    });

    this.initializeClient();
    return {
      success: true,
      message: 'Supabase credentials securely verified and stored in encrypted server vault.',
      projectRef: test.projectRef
    };
  }

  public async executeSql(sql: string, connectionString?: string): Promise<{ success: boolean; message: string }> {
    const vaultCreds = VaultService.getVaultCredentials();
    const targetConn = connectionString || vaultCreds?.connectionString;

    if (!targetConn) {
      return {
        success: false,
        message: 'No PostgreSQL connection string available. Run the SQL schema in the Supabase SQL Editor.'
      };
    }

    const pgClient = new PgClient({
      connectionString: targetConn,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await pgClient.connect();
      await pgClient.query(sql);
      await pgClient.end();
      return { success: true, message: 'PostgreSQL SQL schema tables deployed and initialized successfully.' };
    } catch (err: any) {
      try {
        await pgClient.end();
      } catch {}
      return {
        success: false,
        message: `Failed to execute PostgreSQL schema: ${err.message || err}`
      };
    }
  }

  public disconnect(): { success: boolean; message: string } {
    VaultService.clearVault();
    // Invalidate setup state so setup wizard is shown again!
    if (fs.existsSync(SETUP_FILE)) {
      try {
        fs.unlinkSync(SETUP_FILE);
      } catch (err) {
        console.warn('[SupabaseService] Failed to remove setup.json:', err);
      }
    }
    this.initializeClient();
    return {
      success: true,
      message: 'Supabase credentials removed and vault wiped. System restored to installation setup state.'
    };
  }

  public getSchemaSql(): string {
    if (fs.existsSync(SCHEMA_FILE)) {
      return fs.readFileSync(SCHEMA_FILE, 'utf8');
    }
    return '-- Schema file not found';
  }

  public getPublicConfig(): { url: string; anonKey: string; isConfigured: boolean; projectRef: string } {
    const vault = VaultService.getVaultCredentials();
    if (vault && vault.url && vault.anonKey) {
      return {
        url: vault.url,
        anonKey: vault.anonKey,
        isConfigured: true,
        projectRef: this.getProjectRef(vault.url)
      };
    }
    if (config.supabase.url && config.supabase.anonKey) {
      return {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey,
        isConfigured: true,
        projectRef: this.getProjectRef(config.supabase.url)
      };
    }
    return { url: '', anonKey: '', isConfigured: false, projectRef: '' };
  }
}
