import React, { useState, useEffect } from 'react';
import { StatusBadge } from './StatusBadge';
import { AlertIcon, SpinnerIcon } from './icons';

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
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleManualRetry();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetUrl]);

  const handleManualRetry = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setRetrying(false), 800);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        backgroundColor: 'var(--bg-app)'
      }}
    >
      <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Connection Failed
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            The target web application could not be reached.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '12px',
            fontSize: '12px',
            marginBottom: '16px',
            wordBreak: 'break-all'
          }}
        >
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px', fontSize: '11px' }}>
            TARGET URL
          </div>
          <code style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>
            {targetUrl}
          </code>
          <div style={{ marginTop: '8px' }}>
            <StatusBadge type="error" icon={<AlertIcon size={12} />}>
              {errorCode}
            </StatusBadge>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Auto-reconnecting in <strong style={{ color: 'var(--text-primary)' }}>{countdown}s</strong>...
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={handleManualRetry}
            disabled={retrying}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {retrying ? <SpinnerIcon size={14} style={{ marginRight: '6px' }} /> : null}
            {retrying ? 'Attempting Connection...' : 'Retry Connection Now'}
          </button>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Administrator Settings
          </button>
        </div>
      </div>
    </div>
  );
};