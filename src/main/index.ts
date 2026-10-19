import { app, BrowserWindow } from 'electron';
import { ConfigManager } from './config';
import { configureSessionHardening } from './security';
import { WindowManager } from './window-manager';
import { registerIpcHandlers } from './ipc-handlers';

// Prevent duplicate application instances (Section 10)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.warn('[Lockdown Main] Another instance is already running. Exiting duplicate instance.');
  app.quit();
} else {
  let configManager: ConfigManager;
  let windowManager: WindowManager;

  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our main window
    const mainWindow = windowManager?.getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // 1. Apply global session hardening (permissions, certs)
    configureSessionHardening();

    // 2. Initialize configuration store in app userData directory
    const userDataPath = app.getPath('userData');
    configManager = new ConfigManager(userDataPath);

    // 3. Initialize window manager
    windowManager = new WindowManager(() => configManager.getConfig());

    // 4. Register secure IPC handlers
    registerIpcHandlers(configManager, windowManager);

    // 5. Create primary application window
    windowManager.createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
