import React, { useState, useEffect } from 'react';
import { LaunchMode, ConfigInput } from '../../types/config';
import { validateTargetUrl } from '../utils/validation';
import { ConnectionTester } from './ConnectionTester';
import { StatusBadge } from './StatusBadge';
import {
  AlertIcon,
  EyeIcon,
  EyeOffIcon,
  SpinnerIcon,
  MonitorIcon,
  MaximizeIcon,
  LockIcon,
  ArrowRightIcon
} from './icons';

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

  const [isSavingConfig, setIsSavingConfig] = useState(false);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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

    setIsSavingConfig(true);
    try {
      const configPayload: ConfigInput = {
        appName: appName.trim() || undefined,
        targetUrl: urlValidation.normalizedUrl || targetUrl.trim(),
        launchMode,
        launchOnStartup,
        rememberConfig,
        adminPassword: adminPassword || undefined
      };

      if (window.lockdownAPI) {
        const saveResponse = await window.lockdownAPI.saveConfig(configPayload);
        if (!saveResponse.success) {
          setErrorMessage(saveResponse.error || 'Failed to save configuration.');
          setIsSavingConfig(false);
          return;
        }

        const launchResponse = await window.lockdownAPI.launchTarget();
        if (!launchResponse.success) {
          setErrorMessage(launchResponse.error || 'Failed to launch target website.');
          setIsSavingConfig(false);
          return;
        }
      } else {
        try {
          localStorage.setItem('framekit_config', JSON.stringify(configPayload));
        } catch {
          // Ignore storage quota errors
        }
        window.location.replace(configPayload.targetUrl);
        return;
      }

      onSuccess();
    } catch (caughtError) {
      setErrorMessage((caughtError as Error).message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {errorMessage && (
        <div className="alert-box alert-error">
          <AlertIcon size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label className="field-label">Application Name (Optional)</label>
        <input
          type="text"
          placeholder="e.g. POS Terminal #01"
          value={appName}
          onChange={(event) => setAppName(event.target.value)}
        />
        <p className="field-hint">
          Window title displayed on the desktop taskbar and container header.
        </p>
      </div>

      <div>
        <label className="field-label">
          Target Website URL <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <input
          type="url"
          required
          placeholder="http://localhost:3000 or https://pos.example.com"
          value={targetUrl}
          onChange={(event) => setTargetUrl(event.target.value)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        />
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {urlValidation.isValid ? (
            <>
              {urlValidation.isLocalNetwork && <StatusBadge type="info" dot>Local / LAN Origin</StatusBadge>}
              {urlValidation.warning && (
                <StatusBadge type="warning" icon={<AlertIcon size={11} />}>
                  {urlValidation.warning}
                </StatusBadge>
              )}
            </>
          ) : targetUrl.trim().length > 0 ? (
            <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>{urlValidation.error}</span>
          ) : (
            <span className="field-hint">
              Supports localhost, private LAN IPs (192.168.x.x, 10.x.x.x), and HTTPS domains.
            </span>
          )}
        </div>

        <ConnectionTester url={targetUrl} disabled={!urlValidation.isValid} />
      </div>

      <div>
        <label className="field-label">Display Containment Mode</label>
        <div className="mode-selector">
          <button
            type="button"
            className={`mode-btn ${launchMode === 'windowed' ? 'active' : ''}`}
            onClick={() => setLaunchMode('windowed')}
          >
            <MonitorIcon size={13} />
            <span>Windowed</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${launchMode === 'fullscreen' ? 'active' : ''}`}
            onClick={() => setLaunchMode('fullscreen')}
          >
            <MaximizeIcon size={13} />
            <span>Fullscreen</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${launchMode === 'kiosk' ? 'active' : ''}`}
            onClick={() => setLaunchMode('kiosk')}
          >
            <LockIcon size={13} />
            <span>Kiosk (Locked)</span>
          </button>
        </div>
        <p className="field-hint">
          {launchMode === 'kiosk' && 'Pins fullscreen on top and suppresses OS taskbar, system navigation, and shortcuts.'}
          {launchMode === 'fullscreen' && 'Expands borderless edge-to-edge across the display without window chrome.'}
          {launchMode === 'windowed' && 'Runs inside a standard resizable native window without browser address bars.'}
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label className="field-label" style={{ marginBottom: 0 }}>
            {initialValues?.targetUrl ? 'Administrator Password (Optional)' : 'Administrator Password *'}
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="btn-icon"
            style={{ width: '26px', height: '26px' }}
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
          </button>
        </div>
        <div className="form-grid-2">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Admin Password / PIN"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            required={!initialValues?.targetUrl}
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required={Boolean(adminPassword)}
          />
        </div>
        <p className="field-hint">
          Derived with 100,000 PBKDF2-SHA512 iterations. Required to unlock admin controls (<span className="kbd-chip">Ctrl+Shift+Alt+K</span>).
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px 14px',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px'
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <input
            type="checkbox"
            checked={launchOnStartup}
            onChange={(event) => setLaunchOnStartup(event.target.checked)}
          />
          <span>Launch automatically on operating system startup</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <input
            type="checkbox"
            checked={rememberConfig}
            onChange={(event) => setRememberConfig(event.target.checked)}
          />
          <span>Remember configuration and boot directly into target URL</span>
        </label>
      </div>

      <div style={{ paddingTop: '4px' }}>
        <button
          type="submit"
          disabled={isSavingConfig || !urlValidation.isValid}
          className="btn btn-primary"
          style={{ width: '100%', minHeight: '42px', fontWeight: 600 }}
        >
          {isSavingConfig ? <SpinnerIcon size={15} /> : null}
          <span>{isSavingConfig ? 'Launching Container...' : 'Save Configuration & Launch'}</span>
          {!isSavingConfig && <ArrowRightIcon size={15} />}
        </button>
      </div>
    </form>
  );
};
