import { contextBridge, ipcRenderer } from 'electron';
import { ConfigInput, LockdownAPI } from '../types/config';

const api: LockdownAPI = {
  getConfig: () => ipcRenderer.invoke('lockdown:get-config'),
  saveConfig: (input: ConfigInput) => ipcRenderer.invoke('lockdown:save-config', input),
  testConnection: (url: string) => ipcRenderer.invoke('lockdown:test-connection', url),
  authenticateAdmin: (password: string) => ipcRenderer.invoke('lockdown:auth-admin', password),
  updateSettings: (authPassword: string, updates: Partial<ConfigInput>) =>
    ipcRenderer.invoke('lockdown:update-settings', { authPassword, updates }),
  launchTarget: () => ipcRenderer.invoke('lockdown:launch-target'),
  exitApp: () => ipcRenderer.invoke('lockdown:exit-app'),
  exitKiosk: () => ipcRenderer.invoke('lockdown:exit-kiosk'),
  reloadApp: () => ipcRenderer.invoke('lockdown:reload-app'),
  retryConnection: () => ipcRenderer.invoke('lockdown:retry-connection'),
  getAppStatus: () => ipcRenderer.invoke('lockdown:get-status'),
  openAdminModal: () => ipcRenderer.invoke('lockdown:open-admin-modal'),
  closeAdminModal: () => ipcRenderer.invoke('lockdown:close-admin-modal'),
  openDocs: () => ipcRenderer.invoke('lockdown:open-docs')
};

contextBridge.exposeInMainWorld('lockdownAPI', api);
