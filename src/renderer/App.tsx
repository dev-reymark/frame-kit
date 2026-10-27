import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types/config';
import { ConfigForm } from './components/ConfigForm';
import { AdminModal } from './components/AdminModal';
import { OfflineView } from './components/OfflineView';
import { HelpModal } from './components/HelpModal';
import { StatusBadge } from './components/StatusBadge';
import {
  DocIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  ShieldIcon,
  SpinnerIcon
} from './components/icons';

export const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('framekit_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    } catch {
      // Ignore storage errors
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('framekit_theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  const errorParam = urlParams.get('error') || 'ERR_CONNECTION_REFUSED';
  const targetParam = urlParams.get('url') || config?.targetUrl || 'http://localhost:3000';

  const fetchConfig = async () => {
    try {
      if (window.lockdownAPI) {
        const loadedConfig = await window.lockdownAPI.getConfig();
        setConfig(loadedConfig);
      } else {
        const savedConfig = localStorage.getItem('framekit_config');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setConfig(parsedConfig);
          if (
            parsedConfig.targetUrl &&
            parsedConfig.rememberConfig &&
            viewParam !== 'offline' &&
            viewParam !== 'config'
          ) {
            window.location.href = parsedConfig.targetUrl;
            return;
          }
        }
      }
    } catch (caughtError) {
      console.error('Failed to load initial config:', caughtError);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleRetry = async () => {
    if (window.lockdownAPI) {
      await window.lockdownAPI.retryConnection();
    } else {
      window.location.reload();
    }
  };

  if (isLoadingConfig) {
    return (
      <div
        className="app-shell"
        style={{ alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-secondary)' }}
      >
        <SpinnerIcon size={20} />
        <span style={{ fontSize: '13px' }}>Loading container configuration...</span>
      </div>
    );
  }

  if (viewParam === 'offline') {
    return (
      <>
        <OfflineView
          targetUrl={targetParam}
          errorCode={errorParam}
          onRetry={handleRetry}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          config={config}
          onConfigUpdated={fetchConfig}
        />
        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <span className="logo-mark">F</span>
          <span className="brand-name">
            FrameKit <span className="brand-sub">Container</span>
          </span>
          <StatusBadge type={config ? 'success' : 'info'} dot>
            {config ? config.launchMode : 'Setup'}
          </StatusBadge>
        </div>

        <div className="app-header-actions">
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="btn btn-ghost btn-sm"
            title="Documentation and System Reference"
          >
            <DocIcon size={14} />
            <span>Docs</span>
          </button>

          {config && (
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Administrator Controls (Ctrl+Shift+Alt+K)"
            >
              <SettingsIcon size={14} />
              <span>Admin</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="btn-icon"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="card">
          <div className="card-header">
            <div>
              <h1 className="card-title">Container Provisioning</h1>
              <p className="card-subtitle">
                Encapsulate any local, LAN, or HTTPS web application into a native standalone shell.
              </p>
            </div>
            <StatusBadge type="info" icon={<ShieldIcon size={11} />}>
              Isolated Runtime
            </StatusBadge>
          </div>

          <div className="card-body">
            <ConfigForm
              initialValues={config || undefined}
              onSuccess={() => {}}
            />
          </div>

          <div className="card-footer">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Administrator Unlock Accelerator
            </span>
            <span className="kbd-chip">Ctrl + Shift + Alt + K</span>
          </div>
        </div>
      </main>

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onConfigUpdated={fetchConfig}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
