export type LaunchMode = 'windowed' | 'fullscreen' | 'kiosk';

export interface AppConfig {
  appName: string;
  targetUrl: string;
  launchMode: LaunchMode;
  launchOnStartup: boolean;
  rememberConfig: boolean;
  adminPasswordHash: string;
  adminPasswordSalt: string;
  allowedDomains: string[];
  adminShortcut: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigInput {
  appName?: string;
  targetUrl: string;
  launchMode: LaunchMode;
  launchOnStartup: boolean;
  rememberConfig: boolean;
  adminPassword?: string;
  allowedDomains?: string[];
}

export interface ConnectionTestResult {
  success: boolean;
  statusCode?: number;
  responseTimeMs?: number;
  error?: string;
  isHttpWarning: boolean;
  isLocalNetwork: boolean;
}

export interface AdminAuthResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  lockoutRemainingMs?: number;
}

export interface AppStatus {
  isConfigured: boolean;
  isLocked: boolean;
  isOnline: boolean;
  targetUrl?: string;
  currentUrl?: string;
  lastError?: string;
  launchMode: LaunchMode;
  appName: string;
}

export interface LockdownAPI {
  getConfig: () => Promise<AppConfig | null>;
  saveConfig: (input: ConfigInput) => Promise<{ success: boolean; error?: string }>;
  testConnection: (url: string) => Promise<ConnectionTestResult>;
  authenticateAdmin: (password: string) => Promise<AdminAuthResult>;
  updateSettings: (authPassword: string, updates: Partial<ConfigInput>) => Promise<{ success: boolean; error?: string }>;
  launchTarget: () => Promise<{ success: boolean; error?: string }>;
  exitApp: () => Promise<void>;
  exitKiosk: () => Promise<void>;
  reloadApp: () => Promise<void>;
  retryConnection: () => Promise<void>;
  getAppStatus: () => Promise<AppStatus>;
  openAdminModal: () => Promise<void>;
  closeAdminModal: () => Promise<void>;
  openDocs: () => Promise<void>;
  onNavigateStatus?: (callback: (status: { loading: boolean; url?: string; error?: string }) => void) => () => void;
}

declare global {
  interface Window {
    lockdownAPI: LockdownAPI;
  }
}
