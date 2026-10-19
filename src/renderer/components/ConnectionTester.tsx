import React, { useState } from 'react';
import { ConnectionTestResult } from '../../types/config';
import { StatusBadge } from './StatusBadge';
import { CheckIcon, AlertIcon, ErrorIcon, SpinnerIcon } from './icons';

interface ConnectionTesterProps {
  url: string;
  disabled?: boolean;
}

export const ConnectionTester: React.FC<ConnectionTesterProps> = ({ url, disabled }) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);

  const handleTest = async () => {
    if (!url.trim() || disabled) return;
    setTesting(true);
    setResult(null);

    try {
      if (window.lockdownAPI) {
        const res = await window.lockdownAPI.testConnection(url);
        setResult(res);
      } else {
        await new Promise((r) => setTimeout(r, 500));
        setResult({
          success: true,
          statusCode: 200,
          responseTimeMs: 24,
          isHttpWarning: false,
          isLocalNetwork: true
        });
      }
    } catch (err) {
      setResult({
        success: false,
        error: (err as Error).message,
        isHttpWarning: false,
        isLocalNetwork: false
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        type="button"
        onClick={handleTest}
        disabled={disabled || testing || !url.trim()}
        className="btn btn-secondary btn-sm"
        style={{ gap: '6px' }}
      >
        {testing ? <SpinnerIcon size={14} /> : null}
        {testing ? 'Testing Connection...' : 'Test Connection'}
      </button>

      {result && (
        <div style={{ marginTop: '8px', fontSize: '12px' }}>
          {result.success ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <StatusBadge type="success" icon={<CheckIcon size={12} />}>
                Reachable (HTTP {result.statusCode})
              </StatusBadge>
              {result.responseTimeMs !== undefined && (
                <span style={{ color: 'var(--text-muted)' }}>Latency: {result.responseTimeMs}ms</span>
              )}
              {result.isLocalNetwork && (
                <StatusBadge type="info">Local / LAN</StatusBadge>
              )}
              {result.isHttpWarning && (
                <StatusBadge type="warning" icon={<AlertIcon size={12} />}>
                  Plain HTTP
                </StatusBadge>
              )}
            </div>
          ) : (
            <div className="alert-box alert-error" style={{ padding: '8px 10px' }}>
              <ErrorIcon size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
              <div>
                <strong>Connection Failed:</strong> {result.error || 'Server unreachable'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};