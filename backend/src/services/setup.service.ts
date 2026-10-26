import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { SupabaseService } from './supabase.service.js';
import { RepositoryService } from './repository.service.js';
import { AuthService } from './auth.service.js';
import { SupabaseCredentials } from '../types/supabase.js';
import { User } from '../types/models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const SETUP_FILE = path.join(DATA_DIR, 'setup.json');

export interface SetupStatusResponse {
  isInstalled: boolean;
  requiresSetup: boolean;
  supabaseConfigured: boolean;
  tablesReady: boolean;
  hasAdmin: boolean;
  tablesStatus?: {
    categories: boolean;
    products: boolean;
    orders: boolean;
    users: boolean;
    reviews: boolean;
  };
  projectUrl?: string;
  projectRef?: string;
  installedAt?: string;
  adminEmail?: string;
}

export interface ConnectSupabasePayload {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  connectionString?: string;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
}

export class SetupService {
  private static instance: SetupService;
  private supabaseService = SupabaseService.getInstance();
  private repoService = RepositoryService.getInstance();
  private authService = AuthService.getInstance();

  public static getInstance(): SetupService {
    if (!SetupService.instance) {
      SetupService.instance = new SetupService();
    }
    return SetupService.instance;
  }

  public async isInstalled(): Promise<boolean> {
    if (!this.supabaseService.isConnected()) {
      return false;
    }
    if (!fs.existsSync(SETUP_FILE)) {
      return false;
    }
    try {
      const data = JSON.parse(fs.readFileSync(SETUP_FILE, 'utf8'));
      if (!data.installed) return false;
      const hasAdmin = await this.repoService.hasAdminUser();
      return hasAdmin;
    } catch {
      return false;
    }
  }

  public async getStatus(): Promise<SetupStatusResponse> {
    const isConnected = this.supabaseService.isConnected();
    if (!isConnected) {
      return {
        isInstalled: false,
        requiresSetup: true,
        supabaseConfigured: false,
        tablesReady: false,
        hasAdmin: false
      };
    }

    const tablesProbe = await this.supabaseService.getTablesStatus();
    const hasAdmin = await this.repoService.hasAdminUser();

    let setupData: any = {};
    if (fs.existsSync(SETUP_FILE)) {
      try {
        setupData = JSON.parse(fs.readFileSync(SETUP_FILE, 'utf8'));
      } catch {}
    }

    const isInstalled = Boolean(tablesProbe.allReady && hasAdmin && setupData.installed);

    return {
      isInstalled,
      requiresSetup: !isInstalled,
      supabaseConfigured: true,
      tablesReady: tablesProbe.allReady,
      hasAdmin,
      tablesStatus: tablesProbe.tables,
      projectUrl: this.supabaseService.getPublicConfig().url,
      projectRef: this.supabaseService.getProjectRef(),
      installedAt: setupData.installedAt,
      adminEmail: setupData.adminEmail
    };
  }

  public async connectSupabase(payload: ConnectSupabasePayload): Promise<{
    success: boolean;
    message: string;
    projectRef: string;
    tablesReady: boolean;
    tablesStatus: any;
  }> {
    const creds: SupabaseCredentials = {
      url: payload.url.trim().replace(/\/$/, ''),
      anonKey: payload.anonKey.trim(),
      serviceRoleKey: payload.serviceRoleKey?.trim() || undefined,
      connectionString: payload.connectionString?.trim() || undefined
    };

    const res = await this.supabaseService.connect(creds);
    if (!res.success) {
      throw new Error(res.message);
    }

    const tablesProbe = await this.supabaseService.getTablesStatus();

    return {
      success: true,
      message: res.message,
      projectRef: res.projectRef,
      tablesReady: tablesProbe.allReady,
      tablesStatus: tablesProbe.tables
    };
  }

  public async verifyTables(): Promise<{
    tables: {
      categories: boolean;
      products: boolean;
      orders: boolean;
      users: boolean;
      reviews: boolean;
    };
    allReady: boolean;
  }> {
    if (!this.supabaseService.isConnected()) {
      throw new Error('Supabase is not connected.');
    }
    return this.supabaseService.getTablesStatus();
  }

  public async executeSql(sql: string, connectionString?: string): Promise<{ success: boolean; message: string; tablesReady: boolean }> {
    if (!this.supabaseService.isConnected()) {
      throw new Error('Supabase is not connected.');
    }
    const result = await this.supabaseService.executeSql(sql, connectionString);
    if (!result.success) {
      throw new Error(result.message);
    }
    const tablesProbe = await this.supabaseService.getTablesStatus();
    return {
      success: true,
      message: result.message,
      tablesReady: tablesProbe.allReady
    };
  }

  public async createAdmin(payload: CreateAdminPayload): Promise<{
    success: boolean;
    message: string;
    token: string;
    user: Omit<User, 'passwordHash'>;
  }> {
    if (!this.supabaseService.isConnected()) {
      throw new Error('Supabase is not connected. Connect Supabase before creating administrator.');
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.name.trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Administrator name must be at least 2 characters long.');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Valid administrator email address is required.');
    }
    if (!payload.password || payload.password.length < 6) {
      throw new Error('Administrator password must be at least 6 characters long.');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const adminUser = await this.repoService.upsertAdminUser({
      name: cleanName,
      email: cleanEmail,
      passwordHash
    });

    const token = this.authService.generateToken(adminUser);

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const setupRecord = {
      installed: true,
      installedAt: new Date().toISOString(),
      adminEmail: cleanEmail,
      supabaseConfigured: true
    };

    fs.writeFileSync(SETUP_FILE, JSON.stringify(setupRecord, null, 2), 'utf8');

    const { passwordHash: _, ...safeUser } = adminUser;

    return {
      success: true,
      message: 'Master administrator account created successfully. Setup is complete.',
      token,
      user: safeUser
    };
  }

  public async completeSetup(payload: {
    supabase?: ConnectSupabasePayload;
    admin: CreateAdminPayload;
  }): Promise<{
    success: boolean;
    message: string;
    token: string;
    user: Omit<User, 'passwordHash'>;
  }> {
    if (payload.supabase && payload.supabase.url && payload.supabase.anonKey) {
      await this.connectSupabase(payload.supabase);
    }
    return this.createAdmin(payload.admin);
  }
}
