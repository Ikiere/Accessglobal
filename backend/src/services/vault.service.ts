import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';
import { SupabaseCredentials } from '../types/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const VAULT_FILE = path.join(DATA_DIR, 'supabase_vault.enc');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for AES-GCM
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * VaultService provides military-grade AES-256-GCM encryption
 * to store user Supabase credentials safely on the server
 * without ever exposing raw secrets to the browser or disk in plaintext.
 */
export class VaultService {
  private static deriveKey(masterSecret: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(masterSecret, salt, 100000, 32, 'sha256');
  }

  public static encrypt(credentials: SupabaseCredentials): string {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = this.deriveKey(config.masterKey, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const plaintext = JSON.stringify(credentials);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Combined package: salt (16) + iv (12) + authTag (16) + ciphertext
    const payload = Buffer.concat([salt, iv, authTag, encrypted]);
    return payload.toString('base64');
  }

  public static decrypt(cipherTextBase64: string): SupabaseCredentials | null {
    try {
      const buffer = Buffer.from(cipherTextBase64, 'base64');
      if (buffer.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) {
        return null;
      }

      const salt = buffer.subarray(0, SALT_LENGTH);
      const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const authTag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      const ciphertext = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

      const key = this.deriveKey(config.masterKey, salt);
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return JSON.parse(decrypted.toString('utf8')) as SupabaseCredentials;
    } catch (err) {
      console.error('[VaultService] Decryption failed or payload tampered:', err);
      return null;
    }
  }

  public static saveVaultCredentials(credentials: SupabaseCredentials): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const encryptedBase64 = this.encrypt(credentials);
    fs.writeFileSync(VAULT_FILE, encryptedBase64, { encoding: 'utf8', mode: 0o600 });
  }

  public static getVaultCredentials(): SupabaseCredentials | null {
    if (!fs.existsSync(VAULT_FILE)) {
      return null;
    }
    try {
      const encryptedBase64 = fs.readFileSync(VAULT_FILE, 'utf8').trim();
      return this.decrypt(encryptedBase64);
    } catch {
      return null;
    }
  }

  public static clearVault(): void {
    if (fs.existsSync(VAULT_FILE)) {
      fs.unlinkSync(VAULT_FILE);
    }
  }

  public static hasVaultCredentials(): boolean {
    return fs.existsSync(VAULT_FILE);
  }
}
