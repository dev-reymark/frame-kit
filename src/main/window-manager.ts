import { BrowserWindow, Menu, app, shell } from 'electron';
import * as path from 'path';
import { AppConfig, LaunchMode, AppStatus } from '../types/config';
import { applyWebContentsLockdown } from './security';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private adminModal: BrowserWindow | null = null;
  private isConfigured = false;
  private isLocked = false;
  private isOnline = true;
  private currentTargetUrl: string = '';
  private currentLaunchMode: LaunchMode = 'kiosk';
  private appName = 'FrameKit';
  private allowedDomains: string[] = [];
  private lastError: string | undefined;

  private getConfig: () => AppConfig | null;

  constructor(getConfig: () => AppConfig | null) {
    this.getConfig = getConfig;
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public getStatus(): AppStatus {
    return {
      isConfigured: this.isConfigured,
      isLocked: this.isLocked,
      isOnline: this.isOnline,
      targetUrl: this.currentTargetUrl,
      currentUrl: this.mainWindow?.webContents.getURL(),
      lastError: this.lastError,
      launchMode: this.currentLaunchMode,
      appName: this.appName
    };
  }

  public createMainWindow(): BrowserWindow {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.focus();
      return this.mainWindow;
    }

    // Completely remove default application menu
    Menu.setApplicationMenu(null);

    const config = this.getConfig();
    this.isConfigured = Boolean(config && config.targetUrl);
    this.currentLaunchMode = config?.launchMode || 'windowed';
    this.appName = config?.appName || 'FrameKit';

    const preloadPath = path.join(__dirname, '../preload/config-preload.js');

    this.mainWindow = new BrowserWindow({
      title: this.appName,
      width: 1280,
      height: 800,
      minWidth: 1024,
      minHeight: 700,
      autoHideMenuBar: true,
      backgroundColor: '#f8fafc',
      show: false,
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false
      }
    });

    // Handle initial show
    this.mainWindow.once('ready-to-show', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.applyLaunchMode(this.currentLaunchMode);
      }
    });

    // Handle renderer crash recovery
    this.mainWindow.webContents.on('render-process-gone', (event, details) => {
      console.error('[WindowManager] Renderer process crashed:', details.reason);
      this.lastError = `Renderer process terminated: ${details.reason}`;
      // Prevent tight crash loop: wait 2 seconds before recovering
      setTimeout(() => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.loadOfflineScreen('ERR_RENDERER_CRASHED');
        }
      }, 2000);
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      if (this.adminModal && !this.adminModal.isDestroyed()) {
        this.adminModal.close();
      }
    });

    // If config exists and rememberConfig is true, directly launch target URL
    if (config && config.rememberConfig && config.targetUrl) {
      this.launchTargetUrl(config.targetUrl, config.launchMode, config.appName);
    } else {
      this.loadConfigInterface();
    }

    return this.mainWindow;
  }

  public loadConfigInterface(): void {
    if (!this.mainWindow) return;
    this.isLocked = false;
    this.setLaunchMode('windowed');

    const rendererUrl = this.getRendererEntryUrl();
    this.mainWindow.loadURL(rendererUrl);
  }

  public launchTargetUrl(targetUrl: string, mode: LaunchMode, appName?: string): void {
    if (!this.mainWindow) return;

    this.currentTargetUrl = targetUrl;
    this.currentLaunchMode = mode;
    if (appName) this.appName = appName;
    this.mainWindow.setTitle(this.appName);

    const config = this.getConfig();
    this.allowedDomains = config?.allowedDomains || [];

    // Apply lockdown rules to webContents
    applyWebContentsLockdown(
      this.mainWindow.webContents,
      () => this.currentTargetUrl,
      () => this.allowedDomains,
      () => this.openAdminModal()
    );

    // Track navigation loading state
    this.mainWindow.webContents.on('did-start-loading', () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.setProgressBar(0.3);
      }
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.setProgressBar(-1); // clear progress bar
        this.isOnline = true;
        this.lastError = undefined;
      }
    });

    // Intercept load failures to show the friendly offline screen
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (isMainFrame) {
        console.warn(`[WindowManager] Target URL failed to load: ${validatedURL} (${errorCode}: ${errorDescription})`);
        this.isOnline = false;
        this.lastError = `${errorDescription} (${errorCode})`;
        this.loadOfflineScreen(errorDescription || `Error ${errorCode}`);
      }
    });

    this.isLocked = true;
    this.applyLaunchMode(mode);

    // Load target website into the main window
    this.mainWindow.loadURL(targetUrl);
  }

  public loadOfflineScreen(errorCode: string): void {
    if (!this.mainWindow) return;
    const baseRenderer = this.getRendererEntryUrl();
    const offlineUrl = `${baseRenderer}?view=offline&url=${encodeURIComponent(
      this.currentTargetUrl
    )}&error=${encodeURIComponent(errorCode)}`;

    this.mainWindow.loadURL(offlineUrl);
  }

  public openAdminModal(): void {
    if (this.adminModal && !this.adminModal.isDestroyed()) {
      this.adminModal.focus();
      return;
    }

    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    const preloadPath = path.join(__dirname, '../preload/config-preload.js');
    const baseRenderer = this.getRendererEntryUrl();
    const adminUrl = `${baseRenderer}?view=admin`;

    this.adminModal = new BrowserWindow({
      parent: this.mainWindow,
      modal: true,
      width: 520,
      height: 620,
      resizable: false,
      autoHideMenuBar: true,
      frame: false,
      show: false,
      backgroundColor: '#ffffff',
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true
      }
    });

    this.adminModal.once('ready-to-show', () => {
      if (this.adminModal) {
        this.adminModal.show();
      }
    });

    this.adminModal.on('closed', () => {
      this.adminModal = null;
    });

    this.adminModal.loadURL(adminUrl);
  }

  public closeAdminModal(): void {
    if (this.adminModal && !this.adminModal.isDestroyed()) {
      this.adminModal.close();
      this.adminModal = null;
    }
  }

  public applyLaunchMode(mode: LaunchMode): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    this.currentLaunchMode = mode;

    switch (mode) {
      case 'kiosk':
        this.mainWindow.setFullScreen(false);
        this.mainWindow.setKiosk(true);
        this.mainWindow.setAlwaysOnTop(true, 'screen-saver');
        break;
      case 'fullscreen':
        this.mainWindow.setKiosk(false);
        this.mainWindow.setAlwaysOnTop(false);
        this.mainWindow.setFullScreen(true);
        break;
      case 'windowed':
      default:
        this.mainWindow.setKiosk(false);
        this.mainWindow.setAlwaysOnTop(false);
        this.mainWindow.setFullScreen(false);
        break;
    }
  }

  public setLaunchMode(mode: LaunchMode): void {
    this.applyLaunchMode(mode);
  }

  public setTitle(title: string): void {
    this.appName = title;
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.setTitle(title);
    }
  }

  public reload(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    if (this.currentTargetUrl) {
      this.launchTargetUrl(this.currentTargetUrl, this.currentLaunchMode, this.appName);
    } else {
      this.loadConfigInterface();
    }
  }

  private getRendererEntryUrl(): string {
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5173/index.html';
    }
    const htmlPath = path.join(__dirname, '../renderer/index.html');
    return `file://${htmlPath}`;
  }
}
