import React, { useState } from 'react';
import { ConnectionTestResult } from '../../types/config';
import { StatusBadge } from './StatusBadge';
import { AlertIcon, ErrorIcon, SpinnerIcon, ActivityIcon } from './icons';

interface ConnectionTesterProps {
  url: string;
  disabled?: boolean;
}

export const ConnectionTester: React.FC<ConnectionTesterProps> = ({ url, disabled }) => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [probeResult, setProbeResult] = useState<ConnectionTestResult | null>(null);

  const handleTestConnection = async () => {
    if (!url.trim() || disabled) return;
    setIsTestingConnection(true);
    setProbeResult(null);

    try {
      if (window.lockdownAPI) {
        const testResponse = await window.lockdownAPI.testConnection(url);
        setProbeResult(testResponse);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 450));
        setProbeResult({
          success: true,
          statusCode: 200,
          responseTimeMs: 18,
          isHttpWarning: url.trim().startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1'),
          isLocalNetwork: url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168.')
        });
      }
    } catch (caughtError) {
      setProbeResult({
        success: false,
        error: (caughtError as Error).message,
        isHttpWarning: false,
        isLocalNetwork: false
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={disabled || isTestingConnection || !url.trim()}
          className="btn btn-secondary btn-sm"
        >
          {isTestingConnection ? <SpinnerIcon size={13} /> : <ActivityIcon size={13} />}
          <span>{isTestingConnection ? 'Probing Endpoint...' : 'Test Connection'}</span>
        </button>

        {probeResult && probeResult.success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <StatusBadge type="success" dot>
              HTTP {probeResult.statusCode}
            </StatusBadge>
            {probeResult.responseTimeMs !== undefined && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                {probeResult.responseTimeMs}ms
              </span>
            )}
            {probeResult.isLocalNetwork && (
              <StatusBadge type="info">Local / LAN</StatusBadge>
            )}
            {probeResult.isHttpWarning && (
              <StatusBadge type="warning" icon={<AlertIcon size={11} />}>
                Plain HTTP
              </StatusBadge>
            )}
          </div>
        )}
      </div>

      {probeResult && !probeResult.success && (
        <div className="alert-box alert-error" style={{ marginTop: '8px', padding: '8px 12px' }}>
          <ErrorIcon size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
          <div>
            <strong>Connection Failed:</strong> {probeResult.error || 'Target server unreachable'}
          </div>
        </div>
      )}
    </div>
  );
};
