import React, { useState, useEffect } from 'react';
import { LaunchMode, ConfigInput } from '../../types/config';
import { validateTargetUrl } from '../utils/validation';
import { ConnectionTester } from './ConnectionTester';
import { StatusBadge } from './StatusBadge';
import { AlertIcon, EyeIcon, EyeOffIcon, SpinnerIcon } from './icons';

interface ConfigFormProps {
  initialValues?: Partial<ConfigInput>;
  onSuccess: () => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ initialValues, onSuccess }) => {
  const [appName, setAppName] = useState(initialValues?.appName || '');
  const [targetUrl, setTargetUrl] = useState(initialValues?.targetUrl || 'http://localhost:3000');
  const [launchMode, setLaunchMode] = useState<LaunchMode>(initialValues?.launchMode || 'kiosk');
  const [launchOnStartup, setLaunchOnStartup] = useState(initialValues?.launchOnStartup ?? false);
  const [rememberConfig, setRememberConfig] = useState(initialValues?.rememberConfig ?? true);
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const urlValidation = validateTargetUrl(targetUrl);

  useEffect(() => {
    if (initialValues) {
      if (initialValues.appName) setAppName(initialValues.appName);
      if (initialValues.targetUrl) setTargetUrl(initialValues.targetUrl);
      if (initialValues.launchMode) setLaunchMode(initialValues.launchMode);
      if (initialValues.launchOnStartup !== undefined) setLaunchOnStartup(initialValues.launchOnStartup);
      if (initialValues.rememberConfig !== undefined) setRememberConfig(initialValues.rememberConfig);
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!urlValidation.isValid) {
      setErrorMessage(urlValidation.error || 'Please enter a valid website URL.');
      return;
    }

    if (!initialValues?.targetUrl && (!adminPassword || adminPassword.length < 4)) {
      setErrorMessage('Please set an administrator password with at least 4 characters.');
      return;
    }

    if (adminPassword && adminPassword !== confirmPassword) {
      setErrorMessage('Administrator passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const payload: ConfigInput = {
        appName: appName.trim() || undefined,
        targetUrl: urlValidation.normalizedUrl || targetUrl.trim(),
        launchMode,
        launchOnStartup,
        rememberConfig,
        adminPassword: adminPassword || undefined
      };

      if (window.lockdownAPI) {
        const res = await window.lockdownAPI.saveConfig(payload);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to save configuration.');
          setSaving(false);
          return;
        }

        const launchRes = await window.lockdownAPI.launchTarget();
        if (!launchRes.success) {
          setErrorMessage(launchRes.error || 'Failed to launch target website.');
          setSaving(false);
          return;
        }
      } else {
        try {
          localStorage.setItem('framekit_config', JSON.stringify(payload));
        } catch {
          // ignore quota error
        }
        window.location.href = payload.targetUrl;
        return;
      }

      onSuccess();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {errorMessage && (
        <div className="alert-box alert-error">
          <AlertIcon size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Application Name */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
          APPLICATION NAME (OPTIONAL)
        </label>
        <input
          type="text"
          placeholder="e.g. POS Terminal 1"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Title displayed on the desktop window and taskbar.
        </p>
      </div>

      {/* Target Website URL */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
          WEBSITE URL <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <input
          type="url"
          required
          placeholder="http://localhost:3000 or https://pos.example.com"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
        />
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {urlValidation.isValid ? (
            <>
              {urlValidation.isLocalNetwork && <StatusBadge type="info">Local / LAN Origin</StatusBadge>}
              {urlValidation.warning && (
                <StatusBadge type="warning" icon={<AlertIcon size={11} />}>
                  {urlValidation.warning}
                </StatusBadge>
              )}
            </>
          ) : targetUrl.trim().length > 0 ? (
            <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>{urlValidation.error}</span>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Supports localhost, private LAN IPs, and HTTPS domains.
            </span>
          )}
        </div>

        {/* Connection Probe */}
        <ConnectionTester url={targetUrl} disabled={!urlValidation.isValid} />
      </div>

      {/* Launch Mode */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
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
            Kiosk (Locked)
          </button>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
          {launchMode === 'kiosk' && 'Kiosk mode locks fullscreen on top and suppresses OS taskbar navigation.'}
          {launchMode === 'fullscreen' && 'Fullscreen mode runs borderless across display.'}
          {launchMode === 'windowed' && 'Windowed mode runs in a standard resizable desktop window.'}
        </p>
      </div>

      {/* Administrator Password */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {initialValues?.targetUrl ? 'ADMINISTRATOR PASSWORD (OPTIONAL)' : 'ADMINISTRATOR PASSWORD *'}
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="btn-icon"
            style={{ width: '24px', height: '24px' }}
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required={!initialValues?.targetUrl}
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required={Boolean(adminPassword)}
          />
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Required to unlock admin controls (Shortcut: <code>Ctrl+Shift+Alt+K</code>). Minimum 4 characters.
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={launchOnStartup}
            onChange={(e) => setLaunchOnStartup(e.target.checked)}
          />
          <span>Launch on Windows startup</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={rememberConfig}
            onChange={(e) => setRememberConfig(e.target.checked)}
          />
          <span>Remember configuration for subsequent sessions</span>
        </label>
      </div>

      {/* Submit Action */}
      <div style={{ marginTop: '6px' }}>
        <button
          type="submit"
          disabled={saving || !urlValidation.isValid}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {saving ? <SpinnerIcon size={14} style={{ marginRight: '6px' }} /> : null}
          {saving ? 'Launching Container...' : 'Save and Launch'}
        </button>
      </div>
    </form>
  );
};