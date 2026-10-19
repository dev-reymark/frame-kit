import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConfigManager } from '../../src/main/config';
import { isTrustedSender } from '../../src/main/ipc-handlers';

describe('End-to-End Build & Integration Smoke Tests', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('verifies all compiled production distribution artifacts exist', () => {
    const mainEntry = path.join(rootDir, 'dist/main/index.js');
    const configPreload = path.join(rootDir, 'dist/preload/config-preload.js');
    const webviewPreload = path.join(rootDir, 'dist/preload/webview-preload.js');
    const rendererHtml = path.join(rootDir, 'dist/renderer/index.html');

    expect(fs.existsSync(mainEntry), 'dist/main/index.js must exist').toBe(true);
    expect(fs.existsSync(configPreload), 'dist/preload/config-preload.js must exist').toBe(true);
    expect(fs.existsSync(webviewPreload), 'dist/preload/webview-preload.js must exist').toBe(true);
    expect(fs.existsSync(rendererHtml), 'dist/renderer/index.html must exist').toBe(true);

    const htmlContent = fs.readFileSync(rendererHtml, 'utf8');
    expect(htmlContent).toContain('Content-Security-Policy');
    expect(htmlContent).toContain('root');
  });

  it('validates IPC sender isolation strictly rejects untrusted frames', () => {
    // Trusted local file:// protocol
    const trustedLocalEvent = {
      senderFrame: { url: 'file:///C:/rm/lockdown-browser/dist/renderer/index.html' }
    } as any;
    expect(isTrustedSender(trustedLocalEvent)).toBe(true);

    // Untrusted public website frame attempting to invoke privileged lockdown IPC
    const untrustedExternalEvent = {
      senderFrame: { url: 'https://evil.example.com/exploit' }
    } as any;
    expect(isTrustedSender(untrustedExternalEvent)).toBe(false);

    // Untrusted target POS website frame (even on localhost, target web page must NOT have IPC access)
    const targetSiteEvent = {
      senderFrame: { url: 'http://localhost:3000/orders' }
    } as any;
    expect(isTrustedSender(targetSiteEvent)).toBe(false);
  });

  it('completes full cycle: configuration, persistence, admin authentication & settings updates', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lockdown-e2e-'));
    try {
      const manager = new ConfigManager(tempDir);

      // 1. Initial configuration
      const saveRes = manager.save({
        appName: 'Kofi Kiosk Terminal #4',
        targetUrl: 'http://192.168.1.150:3000/kiosk',
        launchMode: 'kiosk',
        launchOnStartup: true,
        rememberConfig: true,
        adminPassword: 'TerminalMasterPin77'
      });
      expect(saveRes.success).toBe(true);

      // 2. Verify state
      const config = manager.getConfig();
      expect(config?.appName).toBe('Kofi Kiosk Terminal #4');
      expect(config?.targetUrl).toBe('http://192.168.1.150:3000/kiosk');
      expect(config?.launchMode).toBe('kiosk');
      expect(config?.allowedDomains).toContain('http://192.168.1.150:3000');

      // 3. Admin Authentication
      const authOk = manager.authenticate('TerminalMasterPin77');
      expect(authOk.success).toBe(true);

      const authBad = manager.authenticate('WrongPin');
      expect(authBad.success).toBe(false);

      // 4. Update configuration
      const updateRes = manager.updateSettings('TerminalMasterPin77', {
        launchMode: 'fullscreen',
        targetUrl: 'https://kiosk.koficoffee.com'
      });
      expect(updateRes.success).toBe(true);

      const updated = manager.getConfig();
      expect(updated?.launchMode).toBe('fullscreen');
      expect(updated?.targetUrl).toBe('https://kiosk.koficoffee.com/');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
