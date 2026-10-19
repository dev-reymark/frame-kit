import React, { useState } from 'react';
import { AppConfig, LaunchMode } from '../../types/config';
import { validateTargetUrl } from '../utils/validation';
import { CloseIcon, AlertIcon, CheckIcon, EyeIcon, EyeOffIcon, SpinnerIcon } from './icons';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig | null;
  onConfigUpdated: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, config, onConfigUpdated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lockoutSecs, setLockoutSecs] = useState<number | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [targetUrl, setTargetUrl] = useState(config?.targetUrl || '');
  const [launchMode, setLaunchMode] = useState<LaunchMode>(config?.launchMode || 'kiosk');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    if (!window.lockdownAPI) {
      setIsAuthenticated(true);
      setIsAuthenticating(false);
      return;
    }

    try {
      const res = await window.lockdownAPI.authenticateAdmin(password);
      if (res.success) {
        setIsAuthenticated(true);
        if (config) {
          setTargetUrl(config.targetUrl);
          setLaunchMode(config.launchMode);
        }
      } else {
        setAuthError(res.error || 'Authentication failed.');
        if (res.lockoutRemainingMs) {
          setLockoutSecs(Math.ceil(res.lockoutRemainingMs / 1000));
        }
      }
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const val = validateTargetUrl(targetUrl);
    if (!val.isValid) {
      setSaveError(val.error || 'Invalid target URL');
      return;
    }

    setIsSaving(true);
    if (!window.lockdownAPI) {
      setSaveSuccess(true);
      setIsSaving(false);
      return;
    }

    try {
      const res = await window.lockdownAPI.updateSettings(password, {
        targetUrl: val.normalizedUrl || targetUrl.trim(),
        launchMode,
        adminPassword: newPassword.trim() ? newPassword.trim() : undefined
      });

      if (res.success) {
        setSaveSuccess(true);
        onConfigUpdated();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.error || 'Failed to update settings.');
      }
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReload = async () => {
    if (window.lockdownAPI) {
      await window.lockdownAPI.reloadApp();
    }
  };

  const handleExitKiosk = async () => {
    if (window.lockdownAPI) {
      await window.lockdownAPI.exitKiosk();
      onClose();
    }
  };

  const handleExitApp = async () => {
    if (window.lockdownAPI) {
      await window.lockdownAPI.exitApp();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header">
          <h3 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {isAuthenticated ? 'Administrator Controls' : 'Administrator Authentication'}
          </h3>
          <button
            onClick={onClose}
            className="btn-icon"
            title="Close"
            aria-label="Close dialog"
          >
            <CloseIcon size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {!isAuthenticated ? (
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Enter the administrator password or PIN to unlock settings and maintenance controls.
              </p>

              {authError && (
                <div className="alert-box alert-error" style={{ marginBottom: '14px' }}>
                  <AlertIcon size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthenticate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      ADMINISTRATOR PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn-icon"
                      style={{ width: '22px', height: '22px' }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={Boolean(lockoutSecs && lockoutSecs > 0) || isAuthenticating}
                    autoFocus
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!password || Boolean(lockoutSecs && lockoutSecs > 0) || isAuthenticating}
                    className="btn btn-primary btn-sm"
                  >
                    {isAuthenticating ? <SpinnerIcon size={12} style={{ marginRight: '6px' }} /> : null}
                    {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {saveSuccess && (
                <div className="alert-box alert-success" style={{ marginBottom: '14px' }}>
                  <CheckIcon size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>Configuration updated successfully.</span>
                </div>
              )}

              {saveError && (
                <div className="alert-box alert-error" style={{ marginBottom: '14px' }}>
                  <AlertIcon size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{saveError}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    TARGET WEBSITE URL
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    LAUNCH MODE
                  </label>
                  <div className="mode-selector">
                    <button
                      type="button"
                      className={`mode-btn ${launchMode === 'windowed' ? 'active' : ''}`}
                      onClick={() => setLaunchMode('windowed')}
                    >
                      Windowed
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${launchMode === 'fullscreen' ? 'active' : ''}`}
                      onClick={() => setLaunchMode('fullscreen')}
                    >
                      Fullscreen
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${launchMode === 'kiosk' ? 'active' : ''}`}
                      onClick={() => setLaunchMode('kiosk')}
                    >
                      Kiosk
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      NEW PASSWORD (OPTIONAL)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="btn-icon"
                      style={{ width: '22px', height: '22px' }}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
                    </button>
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Leave blank to preserve current"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button type="submit" disabled={isSaving} className="btn btn-primary btn-sm">
                    {isSaving ? <SpinnerIcon size={12} style={{ marginRight: '6px' }} /> : null}
                    Save Settings
                  </button>
                </div>
              </form>

              <hr style={{ margin: '16px 0', borderColor: 'var(--border-subtle)', borderWidth: '1px 0 0 0' }} />

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  APPLICATION ACTIONS
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleReload}
                    className="btn btn-secondary btn-sm"
                  >
                    Reload Container
                  </button>
                  <button
                    type="button"
                    onClick={handleExitKiosk}
                    className="btn btn-secondary btn-sm"
                  >
                    Exit Kiosk Mode
                  </button>
                  <button
                    type="button"
                    onClick={handleExitApp}
                    className="btn btn-danger btn-sm"
                    style={{ gridColumn: '1 / -1' }}
                  >
                    Exit Application
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};