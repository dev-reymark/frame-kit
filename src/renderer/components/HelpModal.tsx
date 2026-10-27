import React, { useState } from 'react';
import { CloseIcon, ExternalLinkIcon, CopyIcon, CheckIcon } from './icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [copiedRecoveryCommand, setCopiedRecoveryCommand] = useState(false);

  if (!isOpen) return null;

  const recoveryCommand = 'Remove-Item "$env:APPDATA\\framekit\\framekit-config.json" -Force';

  const handleOpenDocsFolder = async () => {
    if (window.lockdownAPI && window.lockdownAPI.openDocs) {
      await window.lockdownAPI.openDocs();
    }
  };

  const handleCopyRecovery = () => {
    navigator.clipboard.writeText(recoveryCommand);
    setCopiedRecoveryCommand(true);
    setTimeout(() => setCopiedRecoveryCommand(false), 2000);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog" style={{ maxWidth: '600px' }} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Documentation &amp; System Reference
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Quick reference for shortcuts, containment profiles, and offline recovery.
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

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', padding: '14px' }}>
            <div className="field-label" style={{ marginBottom: '4px' }}>
              Administrator Unlock Shortcut
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              When the container is locked in fullscreen or kiosk mode, summon the admin prompt with:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="kbd-chip">Ctrl + Shift + Alt + K</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                (or <span className="kbd-chip">Cmd + Shift + Option + K</span> on macOS)
              </span>
            </div>
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: '6px' }}>
              Display Containment Profiles
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '10px 12px', backgroundColor: 'var(--bg-page)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Kiosk Mode:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  Pinned fullscreen window with OS taskbar covered and Android Lock Task active.
                </span>
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '10px 12px', backgroundColor: 'var(--bg-page)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Fullscreen Mode:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  Borderless edge-to-edge display for cashier counters and secondary screens.
                </span>
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '10px 12px', backgroundColor: 'var(--bg-page)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Windowed Mode:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  Standard desktop window without browser chrome for back-office workstations.
                </span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="field-label" style={{ marginBottom: 0 }}>
                Emergency Password Reset
              </span>
              <button
                type="button"
                onClick={handleCopyRecovery}
                className="btn btn-secondary btn-sm"
                style={{ minHeight: '26px', padding: '2px 10px', fontSize: '11px' }}
              >
                {copiedRecoveryCommand ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                <span>{copiedRecoveryCommand ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              If administrator credentials are lost, remove the local configuration file to return to initial setup:
            </p>
            <div className="code-snippet">
              {recoveryCommand}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <div className="field-label" style={{ marginBottom: '6px' }}>
              Bundled Technical Specifications
            </div>
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: '1.7' }}>
              <li><code>README.md</code> &mdash; Platform overview and quick start</li>
              <li><code>docs/ARCHITECTURE.md</code> &mdash; Process isolation and lifecycle state machine</li>
              <li><code>docs/SECURITY.md</code> &mdash; Threat model, PBKDF2 hashing, and Windows Assigned Access</li>
              <li><code>docs/BUILD-AND-INSTALL.md</code> &mdash; Silent fleet deployment (<code>/S</code>)</li>
              <li><code>docs/CONFIGURATION.md</code> &mdash; JSON schema and origin whitelist rules</li>
              <li><code>docs/TESTING.md</code> &mdash; Automated verification suite</li>
            </ul>

            {window.lockdownAPI && (
              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleOpenDocsFolder}
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLinkIcon size={13} />
                  <span>Open Docs Folder</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
