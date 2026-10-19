import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfig, ConfigInput, AdminAuthResult } from '../types/config';
import { validateTargetUrl } from '../renderer/utils/validation';

export const DEFAULT_SHORTCUT = 'CommandOrControl+Shift+Alt+K';
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds

export interface PasswordHashResult {
  hash: string;
  salt: string;
}

export function hashPassword(password: string, customSalt?: string): PasswordHashResult {
  const salt = customSalt || crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  ).toString('hex');

  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  if (!password || !storedHash || !storedSalt) return false;
  const { hash } = hashPassword(password, storedSalt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

export class AdminRateLimiter {
  private failedAttempts = 0;
  private lockedUntilMs = 0;

  public canAttempt(): { allowed: boolean; lockoutRemainingMs?: number } {
    const now = Date.now();
    if (now < this.lockedUntilMs) {
      return {
        allowed: false,
        lockoutRemainingMs: this.lockedUntilMs - now
      };
    }
    return { allowed: true };
  }

  public recordAttempt(success: boolean): AdminAuthResult {
    const check = this.canAttempt();
    if (!check.allowed) {
      return {
        success: false,
        error: `Too many failed attempts. Locked for ${Math.ceil((check.lockoutRemainingMs || 0) / 1000)} seconds.`,
        remainingAttempts: 0,
        lockoutRemainingMs: check.lockoutRemainingMs
      };
    }

    if (success) {
      this.failedAttempts = 0;
      this.lockedUntilMs = 0;
      return { success: true };
    }

    this.failedAttempts += 1;
    const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - this.failedAttempts);

    if (this.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      this.lockedUntilMs = Date.now() + LOCKOUT_DURATION_MS;
      return {
        success: false,
        error: `Account locked for 30 seconds due to ${MAX_FAILED_ATTEMPTS} consecutive failed attempts.`,
        remainingAttempts: 0,
        lockoutRemainingMs: LOCKOUT_DURATION_MS
      };
    }

    return {
      success: false,
      error: `Invalid administrator password. ${remaining} attempt(s) remaining.`,
      remainingAttempts: remaining
    };
  }

  public reset(): void {
    this.failedAttempts = 0;
    this.lockedUntilMs = 0;
  }
}

export class ConfigManager {
  private configFilePath: string;
  private inMemoryConfig: AppConfig | null = null;
  public rateLimiter = new AdminRateLimiter();

  constructor(storageDir: string) {
    if (!fs.existsSync(storageDir)) {
      try {
        fs.mkdirSync(storageDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create storage dir:', err);
      }
    }
    this.configFilePath = path.join(storageDir, 'lockdown-config.json');
    this.load();
  }

  public load(): AppConfig | null {
    try {
      if (fs.existsSync(this.configFilePath)) {
        const raw = fs.readFileSync(this.configFilePath, 'utf8');
        const parsed = JSON.parse(raw) as AppConfig;
        if (parsed.targetUrl && parsed.adminPasswordHash && parsed.adminPasswordSalt) {
          this.inMemoryConfig = parsed;
          return this.inMemoryConfig;
        }
      }
    } catch (err) {
      console.error('Failed to load lockdown-config.json:', err);
    }
    this.inMemoryConfig = null;
    return null;
  }

  public getConfig(): AppConfig | null {
    return this.inMemoryConfig;
  }

  public save(input: ConfigInput): { success: boolean; error?: string } {
    const urlValidation = validateTargetUrl(input.targetUrl);
    if (!urlValidation.isValid) {
      return { success: false, error: urlValidation.error || 'Invalid URL' };
    }

    // Must have a password or an existing config password
    let hash = this.inMemoryConfig?.adminPasswordHash;
    let salt = this.inMemoryConfig?.adminPasswordSalt;

    if (input.adminPassword) {
      if (input.adminPassword.length < 4) {
        return { success: false, error: 'Administrator password must be at least 4 characters long.' };
      }
      const hashed = hashPassword(input.adminPassword);
      hash = hashed.hash;
      salt = hashed.salt;
    }

    if (!hash || !salt) {
      return { success: false, error: 'Administrator password is required for security setup.' };
    }

    const targetOrigin = urlValidation.origin || input.targetUrl;
    const allowed = Array.from(new Set([
      targetOrigin,
      ...(input.allowedDomains || this.inMemoryConfig?.allowedDomains || [])
    ]));

    const now = new Date().toISOString();
    const newConfig: AppConfig = {
      appName: input.appName?.trim() || this.inMemoryConfig?.appName || 'POS Lockdown Terminal',
      targetUrl: urlValidation.normalizedUrl || input.targetUrl.trim(),
      launchMode: input.launchMode || 'kiosk',
      launchOnStartup: Boolean(input.launchOnStartup),
      rememberConfig: input.rememberConfig !== undefined ? input.rememberConfig : true,
      adminPasswordHash: hash,
      adminPasswordSalt: salt,
      allowedDomains: allowed,
      adminShortcut: DEFAULT_SHORTCUT,
      createdAt: this.inMemoryConfig?.createdAt || now,
      updatedAt: now
    };

    try {
      const tempPath = `${this.configFilePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(newConfig, null, 2), 'utf8');
      fs.renameSync(tempPath, this.configFilePath);
      this.inMemoryConfig = newConfig;
      return { success: true };
    } catch (err) {
      return { success: false, error: `Failed to persist configuration: ${(err as Error).message}` };
    }
  }

  public authenticate(password: string): AdminAuthResult {
    if (!this.inMemoryConfig) {
      return { success: false, error: 'Application is not yet configured.' };
    }

    const check = this.rateLimiter.canAttempt();
    if (!check.allowed) {
      return {
        success: false,
        error: `Account locked for ${Math.ceil((check.lockoutRemainingMs || 0) / 1000)} seconds.`,
        remainingAttempts: 0,
        lockoutRemainingMs: check.lockoutRemainingMs
      };
    }

    const valid = verifyPassword(
      password,
      this.inMemoryConfig.adminPasswordHash,
      this.inMemoryConfig.adminPasswordSalt
    );

    return this.rateLimiter.recordAttempt(valid);
  }

  public updateSettings(authPassword: string, updates: Partial<ConfigInput>): { success: boolean; error?: string } {
    const authResult = this.authenticate(authPassword);
    if (!authResult.success) {
      return { success: false, error: authResult.error || 'Authentication failed.' };
    }

    if (!this.inMemoryConfig) {
      return { success: false, error: 'No active configuration found.' };
    }

    const merged: ConfigInput = {
      appName: updates.appName !== undefined ? updates.appName : this.inMemoryConfig.appName,
      targetUrl: updates.targetUrl || this.inMemoryConfig.targetUrl,
      launchMode: updates.launchMode || this.inMemoryConfig.launchMode,
      launchOnStartup: updates.launchOnStartup !== undefined ? updates.launchOnStartup : this.inMemoryConfig.launchOnStartup,
      rememberConfig: updates.rememberConfig !== undefined ? updates.rememberConfig : this.inMemoryConfig.rememberConfig,
      adminPassword: updates.adminPassword,
      allowedDomains: updates.allowedDomains || this.inMemoryConfig.allowedDomains
    };

    return this.save(merged);
  }

  public clear(): void {
    if (fs.existsSync(this.configFilePath)) {
      try {
        fs.unlinkSync(this.configFilePath);
      } catch (err) {
        console.error('Failed to delete config file:', err);
      }
    }
    this.inMemoryConfig = null;
  }
}
