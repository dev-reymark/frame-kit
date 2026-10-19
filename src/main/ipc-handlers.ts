import { ipcMain, IpcMainInvokeEvent, app, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigManager } from './config';
import { testTargetConnection } from './connection-tester';
import { WindowManager } from './window-manager';
import { ConfigInput } from '../types/config';

export function isTrustedSender(event: IpcMainInvokeEvent): boolean {
  const senderUrl = event.senderFrame?.url || '';

  // Trusted: Local file protocol for packaged app
  if (senderUrl.startsWith('file://')) {
    return true;
  }

  // Trusted: Localhost Vite dev server in development
  if (process.env.NODE_ENV === 'development' && senderUrl.startsWith('http://localhost:5173')) {
    return true;
  }

  console.warn(`[Security IPC] Rejected untrusted sender frame URL: ${senderUrl}`);
  return false;
}

export function registerIpcHandlers(
  configManager: ConfigManager,
  windowManager: WindowManager
): void {
  // 1. Get current configuration
  ipcMain.handle('lockdown:get-config', (event) => {
    if (!isTrustedSender(event)) return null;
    return configManager.getConfig();
  });

  // 2. Save configuration
  ipcMain.handle('lockdown:save-config', (event, input: ConfigInput) => {
    if (!isTrustedSender(event)) {
      return { success: false, error: 'Unauthorized IPC origin' };
    }
    const result = configManager.save(input);
    if (result.success && input.launchOnStartup !== undefined) {
      try {
        app.setLoginItemSettings({ openAtLogin: Boolean(input.launchOnStartup) });
      } catch (err) {
        console.warn('Failed to set login item settings:', err);
      }
    }
    return result;
  });

  // 3. Test connection probe
  ipcMain.handle('lockdown:test-connection', async (event, url: string) => {
    if (!isTrustedSender(event)) {
      return {
        success: false,
        error: 'Unauthorized IPC origin',
        isHttpWarning: false,
        isLocalNetwork: false
      };
    }
    return testTargetConnection(url);
  });

  // 4. Authenticate admin
  ipcMain.handle('lockdown:auth-admin', (event, password: string) => {
    if (!isTrustedSender(event)) {
      return { success: false, error: 'Unauthorized IPC origin' };
    }
    return configManager.authenticate(password);
  });

  // 5. Update settings with authentication
  ipcMain.handle(
    'lockdown:update-settings',
    (event, { authPassword, updates }: { authPassword: string; updates: Partial<ConfigInput> }) => {
      if (!isTrustedSender(event)) {
        return { success: false, error: 'Unauthorized IPC origin' };
      }
      const res = configManager.updateSettings(authPassword, updates);
      if (res.success) {
        // If mode changed, apply immediately
        if (updates.launchMode) {
          windowManager.setLaunchMode(updates.launchMode);
        }
        if (updates.appName) {
          windowManager.setTitle(updates.appName);
        }
      }
      return res;
    }
  );

  // 6. Launch target website container
  ipcMain.handle('lockdown:launch-target', (event) => {
    if (!isTrustedSender(event)) {
      return { success: false, error: 'Unauthorized IPC origin' };
    }
    const config = configManager.getConfig();
    if (!config) {
      return { success: false, error: 'No configuration found' };
    }
    windowManager.launchTargetUrl(config.targetUrl, config.launchMode, config.appName);
    return { success: true };
  });

  // 7. Exit application
  ipcMain.handle('lockdown:exit-app', (event) => {
    if (!isTrustedSender(event)) return;
    app.quit();
  });

  // 8. Exit kiosk mode (switches to windowed)
  ipcMain.handle('lockdown:exit-kiosk', (event) => {
    if (!isTrustedSender(event)) return;
    windowManager.setLaunchMode('windowed');
  });

  // 9. Reload application
  ipcMain.handle('lockdown:reload-app', (event) => {
    if (!isTrustedSender(event)) return;
    windowManager.reload();
  });

  // 10. Retry connection from offline screen
  ipcMain.handle('lockdown:retry-connection', (event) => {
    if (!isTrustedSender(event)) return;
    const config = configManager.getConfig();
    if (config) {
      windowManager.launchTargetUrl(config.targetUrl, config.launchMode, config.appName);
    }
  });

  // 11. Get app status
  ipcMain.handle('lockdown:get-status', (event) => {
    if (!isTrustedSender(event)) return null;
    return windowManager.getStatus();
  });

  // 12. Open admin modal
  ipcMain.handle('lockdown:open-admin-modal', (event) => {
    if (!isTrustedSender(event)) return;
    windowManager.openAdminModal();
  });

  // 13. Close admin modal
  ipcMain.handle('lockdown:close-admin-modal', (event) => {
    if (!isTrustedSender(event)) return;
    windowManager.closeAdminModal();
  });

  // 14. Open documentation directory in OS file manager
  ipcMain.handle('lockdown:open-docs', (event) => {
    if (!isTrustedSender(event)) return;
    const prodDocs = path.join(process.resourcesPath, 'docs');
    const devDocs = path.resolve(__dirname, '../../docs');
    const targetPath = fs.existsSync(prodDocs) ? prodDocs : devDocs;
    shell.openPath(targetPath);
  });
}