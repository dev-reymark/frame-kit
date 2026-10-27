import React, { useState, useEffect } from 'react';
import { StatusBadge } from './StatusBadge';
import { AlertIcon, SpinnerIcon, ReloadIcon, SettingsIcon } from './icons';

interface OfflineViewProps {
  targetUrl: string;
  errorCode?: string;
  onRetry: () => void;
  onOpenAdmin: () => void;
}

export const OfflineView: React.FC<OfflineViewProps> = ({
  targetUrl,
  errorCode = 'ERR_CONNECTION_REFUSED',
  onRetry,
  onOpenAdmin
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(15);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          handleManualRetry();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [targetUrl]);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  return (
    <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center', padding: '24px 16px' }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Target Endpoint Unreachable</h2>
            <p className="card-subtitle">
              The configured web application did not respond in time.
            </p>
          </div>
          <StatusBadge type="error" dot>
            Offline
          </StatusBadge>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '14px',
              fontSize: '12px',
              wordBreak: 'break-all'
            }}
          >
            <div className="field-label" style={{ marginBottom: '4px' }}>
              Target Origin
            </div>
            <code style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '12px' }}>
              {targetUrl}
            </code>
            <div style={{ marginTop: '10px' }}>
              <StatusBadge type="error" icon={<AlertIcon size={11} />}>
                {errorCode}
              </StatusBadge>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}
          >
            <span>Automatic reconnect scheduled</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {countdownSeconds}s
            </strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {isRetrying ? <SpinnerIcon size={14} /> : <ReloadIcon size={14} />}
              <span>{isRetrying ? 'Attempting Connection...' : 'Retry Connection Now'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <SettingsIcon size={14} />
              <span>Administrator Controls</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
