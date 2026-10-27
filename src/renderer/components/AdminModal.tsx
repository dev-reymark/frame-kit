import React, { useState } from 'react';
import { AppConfig, LaunchMode } from '../../types/config';
import { validateTargetUrl } from '../utils/validation';
import {
  CloseIcon,
  AlertIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  SpinnerIcon,
  ReloadIcon,
  UnlockIcon
} from './icons';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig | null;
  onConfigUpdated: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated
}) => {
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

  const handleAuthenticate = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    if (!window.lockdownAPI) {
      setIsAuthenticated(true);
      setIsAuthenticating(false);
      return;
    }

    try {
      const authResponse = await window.lockdownAPI.authenticateAdmin(password);
      if (authResponse.success) {
        setIsAuthenticated(true);
        if (config) {
          setTargetUrl(config.targetUrl);
          setLaunchMode(config.launchMode);
        }
      } else {
        setAuthError(authResponse.error || 'Authentication failed.');
        if (authResponse.lockoutRemainingMs) {
          setLockoutSecs(Math.ceil(authResponse.lockoutRemainingMs / 1000));
        }
      }
    } catch (caughtError) {
      setAuthError((caughtError as Error).message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const validation = validateTargetUrl(targetUrl);
    if (!validation.isValid) {
      setSaveError(validation.error || 'Invalid target URL');
      return;
    }

    setIsSaving(true);
    if (!window.lockdownAPI) {
      setSaveSuccess(true);
      setIsSaving(false);
      return;
    }

    try {
      const updateResponse = await window.lockdownAPI.updateSettings(password, {
        targetUrl: validation.normalizedUrl || targetUrl.trim(),
        launchMode,
        adminPassword: newPassword.trim() ? newPassword.trim() : undefined
      });

      if (updateResponse.success) {
        setSaveSuccess(true);
        onConfigUpdated();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(updateResponse.error || 'Failed to update settings.');
      }
    } catch (caughtError) {
      setSaveError((caughtError as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReload = async () => {
    if (window.lockdownAPI) {
      await window.lockdownAPI.reloadApp();
    } else {
      window.location.reload();
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
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog" style={{ maxWidth: '520px' }} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isAuthenticated ? 'Administrator Controls' : 'Administrator Authentication'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isAuthenticated
                ? 'Manage container origin, display profile, and runtime lifecycle.'
                : 'Enter your administrator password or PIN to unlock container settings.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            title="Close"
            aria-label="Close dialog"
          >
            <CloseIcon size={14} />
          </button>
        </div>

        <div className="modal-body">
          {!isAuthenticated ? (
            <div>
              {authError && (
                <div className="alert-box alert-error" style={{ marginBottom: '14px' }}>
                  <AlertIcon size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthenticate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="field-label" style={{ marginBottom: 0 }}>
                      Administrator Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn-icon"
                      style={{ width: '24px', height: '24px' }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter administrator password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={Boolean(lockoutSecs && lockoutSecs > 0) || isAuthenticating}
                    autoFocus
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!password || Boolean(lockoutSecs && lockoutSecs > 0) || isAuthenticating}
                    className="btn btn-primary btn-sm"
                  >
                    {isAuthenticating ? <SpinnerIcon size={13} /> : <UnlockIcon size={13} />}
                    <span>{isAuthenticating ? 'Verifying...' : 'Unlock Controls'}</span>
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
                  <label className="field-label">Target Website URL</label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(event) => setTargetUrl(event.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                    required
                  />
                </div>

                <div>
                  <label className="field-label">Display Mode</label>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="field-label" style={{ marginBottom: 0 }}>
                      New Password (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="btn-icon"
                      style={{ width: '24px', height: '24px' }}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
                    </button>
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Leave blank to keep current password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button type="submit" disabled={isSaving} className="btn btn-primary btn-sm">
                    {isSaving ? <SpinnerIcon size={13} /> : null}
                    <span>Save Settings</span>
                  </button>
                </div>
              </form>

              <hr style={{ margin: '18px 0', borderColor: 'var(--border-subtle)', borderWidth: '1px 0 0 0' }} />

              <div>
                <label className="field-label" style={{ marginBottom: '8px' }}>
                  Container Runtime Actions
                </label>
                <div className="action-grid-2">
                  <button
                    type="button"
                    onClick={handleReload}
                    className="btn btn-secondary btn-sm"
                  >
                    <ReloadIcon size={13} />
                    <span>Reload Container</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExitKiosk}
                    className="btn btn-secondary btn-sm"
                  >
                    <UnlockIcon size={13} />
                    <span>Exit Kiosk Mode</span>
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
