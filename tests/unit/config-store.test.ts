import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConfigManager } from '../../src/main/config';

describe('ConfigManager Persistence & Validation', () => {
  let tempDir: string;
  let manager: ConfigManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lockdown-test-'));
    manager = new ConfigManager(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('starts unconfigured when no config file exists', () => {
    expect(manager.getConfig()).toBeNull();
  });

  it('saves valid configuration and derives target origin into allowedDomains', () => {
    const result = manager.save({
      appName: 'Store Front POS',
      targetUrl: 'http://localhost:3000/pos',
      launchMode: 'kiosk',
      launchOnStartup: true,
      rememberConfig: true,
      adminPassword: 'SuperSecretAdmin123'
    });

    expect(result.success).toBe(true);
    const config = manager.getConfig();
    expect(config).not.toBeNull();
    expect(config?.appName).toBe('Store Front POS');
    expect(config?.targetUrl).toBe('http://localhost:3000/pos');
    expect(config?.launchMode).toBe('kiosk');
    expect(config?.allowedDomains).toContain('http://localhost:3000');
    expect(config?.adminPasswordHash).toBeDefined();
    expect(config?.adminPasswordSalt).toBeDefined();
    // Salted hash should NEVER equal plain password
    expect(config?.adminPasswordHash).not.toBe('SuperSecretAdmin123');
  });

  it('rejects passwords shorter than 4 characters', () => {
    const result = manager.save({
      targetUrl: 'http://localhost:3000',
      launchMode: 'windowed',
      launchOnStartup: false,
      rememberConfig: true,
      adminPassword: '123'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('at least 4 characters');
  });

  it('rejects invalid URLs', () => {
    const result = manager.save({
      targetUrl: 'invalid-url',
      launchMode: 'kiosk',
      launchOnStartup: false,
      rememberConfig: true,
      adminPassword: 'ValidPassword123'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid URL');
  });

  it('authenticates admin password correctly', () => {
    manager.save({
      targetUrl: 'http://192.168.1.50:8080',
      launchMode: 'kiosk',
      launchOnStartup: false,
      rememberConfig: true,
      adminPassword: 'MyStrongAdminKey'
    });

    const successAuth = manager.authenticate('MyStrongAdminKey');
    expect(successAuth.success).toBe(true);

    const failAuth = manager.authenticate('WrongKey');
    expect(failAuth.success).toBe(false);
    expect(failAuth.error).toContain('Invalid administrator password');
  });

  it('updates settings only with valid admin authentication', () => {
    manager.save({
      appName: 'POS 1',
      targetUrl: 'http://localhost:3000',
      launchMode: 'kiosk',
      launchOnStartup: false,
      rememberConfig: true,
      adminPassword: 'InitialPassword'
    });

    // Attempt update with wrong password
    const failUpdate = manager.updateSettings('WrongPassword', {
      launchMode: 'windowed'
    });
    expect(failUpdate.success).toBe(false);
    expect(manager.getConfig()?.launchMode).toBe('kiosk');

    // Attempt update with correct password
    const successUpdate = manager.updateSettings('InitialPassword', {
      appName: 'POS 1 Updated',
      launchMode: 'windowed'
    });
    expect(successUpdate.success).toBe(true);
    expect(manager.getConfig()?.appName).toBe('POS 1 Updated');
    expect(manager.getConfig()?.launchMode).toBe('windowed');
  });

  it('re-loads persisted configuration from disk on new instance', () => {
    manager.save({
      appName: 'Persistent POS',
      targetUrl: 'https://pos.mycompany.com',
      launchMode: 'fullscreen',
      launchOnStartup: true,
      rememberConfig: true,
      adminPassword: 'PersistentAdmin1'
    });

    // Create a new manager pointing to same storage
    const newManager = new ConfigManager(tempDir);
    const loaded = newManager.getConfig();
    expect(loaded).not.toBeNull();
    expect(loaded?.appName).toBe('Persistent POS');
    expect(loaded?.targetUrl).toBe('https://pos.mycompany.com/');
    expect(loaded?.launchMode).toBe('fullscreen');
  });
});
