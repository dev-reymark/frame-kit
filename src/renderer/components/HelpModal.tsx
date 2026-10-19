import React from 'react';
import { CloseIcon, ExternalLinkIcon } from './icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOpenDocsFolder = async () => {
    if (window.lockdownAPI && window.lockdownAPI.openDocs) {
      await window.lockdownAPI.openDocs();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '580px', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="modal-header">
          <h3 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Documentation & System Reference
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
        <div className="modal-body" style={{ overflowY: 'auto' }}>
          {/* Section 1: Administrator Shortcut */}
          <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', padding: '12px', marginBottom: '14px' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              ADMINISTRATOR UNLOCK SHORTCUT
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              When the browser is locked in fullscreen or kiosk mode, press:
            </p>
            <code style={{ display: 'inline-block', backgroundColor: 'var(--accent-primary)', color: '#ffffff', padding: '4px 10px', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>
              Ctrl + Shift + Alt + K
            </code>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Prompts for your administrator password to modify the URL, change launch modes, reload, or exit kiosk mode.
            </p>
          </div>

          {/* Section 2: Launch Modes */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              LAUNCH MODES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '8px 10px' }}>
                <strong>Kiosk Mode:</strong> Pinned fullscreen window with OS taskbar covered. Prevents ordinary users from escaping.
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '8px 10px' }}>
                <strong>Fullscreen Mode:</strong> Borderless fullscreen display for customer-facing displays.
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '8px 10px' }}>
                <strong>Windowed Mode:</strong> Standard desktop window without browser chrome. Ideal for supervisor PCs.
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Password Recovery */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              EMERGENCY PASSWORD RESET
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              If you lose the administrator credentials, delete the local configuration file:
            </p>
            <div style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '8px 10px', fontSize: '11px', fontFamily: 'monospace', overflowX: 'auto' }}>
              Remove-Item "$env:APPDATA\lockdown-browser\lockdown-config.json" -Force
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Deleting this file returns the application to first-time setup mode.
            </p>
          </div>

          {/* Section 4: Offline Guides */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              INSTALLED DOCUMENTATION FILES
            </div>
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: '1.6' }}>
              <li><code>README.md</code> — Overview and quick start</li>
              <li><code>docs/ARCHITECTURE.md</code> — Internal lifecycle and state machine</li>
              <li><code>docs/SECURITY.md</code> — Threat model and Windows Assigned Access guide</li>
              <li><code>docs/BUILD-AND-INSTALL.md</code> — Silent deployment (<code>/S</code>) for fleet rollouts</li>
              <li><code>docs/CONFIGURATION.md</code> — Full JSON schema and origin whitelist</li>
              <li><code>docs/TESTING.md</code> — Automated test matrices</li>
            </ul>

            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleOpenDocsFolder}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px' }}
              >
                <ExternalLinkIcon size={12} /> Open Docs in Windows Explorer
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};