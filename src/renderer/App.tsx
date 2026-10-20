import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types/config';
import { ConfigForm } from './components/ConfigForm';
import { AdminModal } from './components/AdminModal';
import { OfflineView } from './components/OfflineView';
import { HelpModal } from './components/HelpModal';
import { DocIcon, SettingsIcon } from './components/icons';

export const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  const errorParam = urlParams.get('error') || 'ERR_CONNECTION_REFUSED';
  const targetParam = urlParams.get('url') || config?.targetUrl || 'http://localhost:3000';

  const fetchConfig = async () => {
    try {
      if (window.lockdownAPI) {
        const loaded = await window.lockdownAPI.getConfig();
        setConfig(loaded);
      } else {
        const saved = localStorage.getItem('framekit_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
          if (parsed.targetUrl && parsed.rememberConfig && viewParam !== 'offline') {
            window.location.href = parsed.targetUrl;
            return;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load initial config:', err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading configuration...
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: 'var(--bg-app)'
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Flat Desktop Utility Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div>
            <h1 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              FrameKit
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Any website. Your app.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '5px' }}
              title="Documentation and User Guide"
            >
              <DocIcon size={13} /> Docs
            </button>
            {config && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '5px' }}
                title="Administrator Controls (Ctrl+Shift+Alt+K)"
              >
                <SettingsIcon size={13} /> Admin
              </button>
            )}
          </div>
        </div>

        {/* Form Container */}
        <div className="card">
          <ConfigForm
            initialValues={config || undefined}
            onSuccess={() => {}}
          />
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
          Administrator Unlock Shortcut: <code style={{ color: 'var(--text-secondary)' }}>Ctrl+Shift+Alt+K</code>
        </div>
      </div>

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