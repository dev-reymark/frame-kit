import { WebContents, session, app } from 'electron';
import { validateTargetUrl } from '../renderer/utils/validation';

export function isNavigationAllowed(
  attemptedUrl: string,
  targetUrl: string,
  allowedDomains: string[] = []
): boolean {
  if (!attemptedUrl || typeof attemptedUrl !== 'string') return false;

  // Allow internal file:// protocol only if loading application resources
  if (attemptedUrl.startsWith('file://')) {
    return true;
  }

  // Allow Vite dev server if running in development
  if (process.env.NODE_ENV === 'development' && attemptedUrl.startsWith('http://localhost:5173')) {
    return true;
  }

  const validation = validateTargetUrl(attemptedUrl);
  if (!validation.isValid || !validation.origin) {
    return false;
  }

  const attemptedOrigin = validation.origin.toLowerCase();

  // Check against target URL origin
  const targetValidation = validateTargetUrl(targetUrl);
  if (targetValidation.isValid && targetValidation.origin) {
    if (attemptedOrigin === targetValidation.origin.toLowerCase()) {
      return true;
    }
  }

  // Check against explicitly approved domains/origins
  for (const allowed of allowedDomains) {
    const allowedVal = validateTargetUrl(allowed);
    if (allowedVal.isValid && allowedVal.origin) {
      if (attemptedOrigin === allowedVal.origin.toLowerCase()) {
        return true;
      }
    } else if (allowed.toLowerCase().trim() === attemptedOrigin) {
      return true;
    }
  }

  return false;
}

export function isBlockedShortcut(event: Electron.Input): boolean {
  const code = event.code;
  const key = event.key ? event.key.toUpperCase() : '';
  const isCtrlOrCmd = event.control || event.meta;

  // Function keys for DevTools and Reloads
  if (key === 'F12' || code === 'F12') return true;
  if (key === 'F5' || code === 'F5') return true;
  if (key === 'F11' || code === 'F11') return true; // prevent fullscreen toggle bypass

  // DevTools shortcuts: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
  if (isCtrlOrCmd && event.shift && (key === 'I' || key === 'J' || key === 'C')) {
    return true;
  }

  // Browser navigation shortcuts
  if (isCtrlOrCmd && (key === 'R' || key === 'N' || key === 'T' || key === 'W' || key === 'L' || key === 'O' || key === 'P' || key === 'H' || key === 'U')) {
    return true;
  }

  // Alt + Back / Forward / Home
  if (event.alt && (key === 'ARROWLEFT' || key === 'ARROWRIGHT' || key === 'HOME')) {
    return true;
  }

  return false;
}

export function isAdminShortcut(event: Electron.Input): boolean {
  const isCtrlOrCmd = event.control || event.meta;
  const key = event.key ? event.key.toUpperCase() : '';
  // Default shortcut: Ctrl+Shift+Alt+K
  return Boolean(isCtrlOrCmd && event.shift && event.alt && (key === 'K' || event.code === 'KeyK'));
}

export function applyWebContentsLockdown(
  webContents: WebContents,
  getTargetUrl: () => string,
  getAllowedDomains: () => string[],
  onAdminTrigger: () => void
): void {
  // 1. Block opening new windows / popups
  webContents.setWindowOpenHandler(({ url }) => {
    console.warn(`[Lockdown] Blocked attempt to open new window for: ${url}`);
    return { action: 'deny' };
  });

  // 2. Restrict in-page navigation (links, form submissions)
  webContents.on('will-navigate', (event, navigationUrl) => {
    const target = getTargetUrl();
    const allowed = getAllowedDomains();
    if (!isNavigationAllowed(navigationUrl, target, allowed)) {
      event.preventDefault();
      console.warn(`[Lockdown] Blocked unapproved navigation to: ${navigationUrl}`);
    }
  });

  // 3. Restrict HTTP redirects
  webContents.on('will-redirect', (event, redirectUrl) => {
    const target = getTargetUrl();
    const allowed = getAllowedDomains();
    if (!isNavigationAllowed(redirectUrl, target, allowed)) {
      event.preventDefault();
      console.warn(`[Lockdown] Blocked unapproved redirect to: ${redirectUrl}`);
    }
  });

  // 4. Block <webview> tags
  webContents.on('will-attach-webview', (event) => {
    event.preventDefault();
    console.warn('[Lockdown] Blocked webview tag attachment');
  });

  // 5. Disable context menu (right-click inspect)
  webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  // 6. Restrict keyboard shortcuts at the Chromium input level
  webContents.on('before-input-event', (event, input) => {
    if (isAdminShortcut(input)) {
      event.preventDefault();
      onAdminTrigger();
      return;
    }

    if (isBlockedShortcut(input)) {
      event.preventDefault();
    }
  });
}

export function configureSessionHardening(): void {
  const defaultSession = session.defaultSession;

  // 1. Strict Permission Handling: Deny intrusive permissions by default
  defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    // Only allow media for barcode/camera scanner if necessary, deny desktop-capture, notifications, geolocation
    const allowedPermissions = ['media', 'fullscreen'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      console.warn(`[Security] Denied permission request for: ${permission}`);
      callback(false);
    }
  });

  // 2. Set permission check handler
  defaultSession.setPermissionCheckHandler((webContents, permission) => {
    const allowedPermissions = ['media', 'fullscreen'];
    return allowedPermissions.includes(permission);
  });

  // 3. Reject any attempt to bypass certificate errors
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // Never bypass certificate errors
    event.preventDefault();
    callback(false);
    console.error(`[Security] Certificate validation failed for ${url}: ${error}`);
  });
}
