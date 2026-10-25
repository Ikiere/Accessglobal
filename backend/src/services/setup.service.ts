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
  installedAt?: string;
  adminEmail?: string;
}

export interface CompleteSetupPayload {
  supabase?: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
  };
  useSandbox?: boolean;
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

  public isInstalled(): boolean {
    if (!fs.existsSync(SETUP_FILE)) {
      return false;
    }
    try {
      const data = JSON.parse(fs.readFileSync(SETUP_FILE, 'utf8'));
      return Boolean(data.installed);
    } catch {
      return false;
    }
  }

  public getStatus(): SetupStatusResponse {
    if (!fs.existsSync(SETUP_FILE)) {
      return {
        isInstalled: false,
        requiresSetup: true,
        supabaseConfigured: this.supabaseService.isConnected()
      };
    }

    try {
      const data = JSON.parse(fs.readFileSync(SETUP_FILE, 'utf8'));
      return {
        isInstalled: Boolean(data.installed),
        requiresSetup: !data.installed,
        supabaseConfigured: Boolean(data.supabaseConfigured || this.supabaseService.isConnected()),
        installedAt: data.installedAt,
        adminEmail: data.adminEmail
      };
    } catch {
      return {
        isInstalled: false,
        requiresSetup: true,
        supabaseConfigured: false
      };
    }
  }

  public async completeSetup(payload: CompleteSetupPayload): Promise<{
    success: boolean;
    message: string;
    token: string;
    user: Omit<User, 'passwordHash'>;
  }> {
    // 1. Guard against re-running wizard once installation is sealed
    if (this.isInstalled()) {
      throw new Error('System installation is already completed and permanently sealed.');
    }

    let supabaseConnected = false;

    // 2. Connect Supabase if provided and not explicitly running sandbox mode
    if (!payload.useSandbox && payload.supabase && payload.supabase.url && payload.supabase.anonKey) {
      const creds: SupabaseCredentials = {
        url: payload.supabase.url.trim().replace(/\/$/, ''),
        anonKey: payload.supabase.anonKey.trim(),
        serviceRoleKey: payload.supabase.serviceRoleKey?.trim() || undefined
      };

      const connectResult = await this.supabaseService.connect(creds);
      if (!connectResult.success) {
        throw new Error(`Supabase connection failed: ${connectResult.message}`);
      }
      supabaseConnected = true;
    }

    // 3. Provision Master Administrator account
    const cleanEmail = payload.admin.email.trim().toLowerCase();
    const cleanName = payload.admin.name.trim();
    const passwordHash = await bcrypt.hash(payload.admin.password, 10);

    const adminUser = await this.repoService.upsertAdminUser({
      name: cleanName,
      email: cleanEmail,
      passwordHash
    });

    // 4. Generate immediate JWT session token
    const token = this.authService.generateToken(adminUser);

    // 5. Seal installation state permanently
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const setupRecord = {
      installed: true,
      installedAt: new Date().toISOString(),
      adminEmail: cleanEmail,
      supabaseConfigured: supabaseConnected
    };

    fs.writeFileSync(SETUP_FILE, JSON.stringify(setupRecord, null, 2), 'utf8');

    const { passwordHash: _, ...safeUser } = adminUser;

    return {
      success: true,
      message: 'Onboarding setup completed. Admin console is initialized.',
      token,
      user: safeUser
    };
  }
}
