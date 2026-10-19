import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';

export const Deployment: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const steps = [
    {
      num: '01',
      title: 'Standard Installation',
      desc: 'Download the Windows NSIS installer and launch it. The wizard installs Lockdown Browser to your device and automatically creates a desktop shortcut.',
      code: '.\\Lockdown Browser Setup 1.0.0.exe',
      key: 'install'
    },
    {
      num: '02',
      title: 'Silent Fleet Deployment (SCCM / Intune / MDM)',
      desc: 'For enterprise multi-store IT administrators deploying across hundreds of cashier terminals simultaneously via Active Directory or PowerShell script.',
      code: 'Start-Process -FilePath ".\\Lockdown Browser Setup 1.0.0.exe" -ArgumentList "/S" -Wait',
      key: 'silent'
    },
    {
      num: '03',
      title: 'Pre-Provisioning Configuration File',
      desc: 'Lockdown configuration is saved to %APPDATA%\\lockdown-browser\\lockdown-config.json. You can deploy this pre-hashed configuration file across machines to bypass manual setup.',
      code: 'Copy-Item -Path "\\\\server\\pos-configs\\lockdown-config.json" -Destination "$env:APPDATA\\lockdown-browser\\" -Force',
      key: 'preconf'
    },
    {
      num: '04',
      title: 'Emergency Admin Reset Flag',
      desc: 'If an on-site manager forgets the administrator password or the target domain permanently changes, launch with the recovery flag to clear settings and reset the master PIN.',
      code: '& "C:\\Users\\$env:USERNAME\\AppData\\Local\\Programs\\lockdown-browser\\Lockdown Browser.exe" --reset-lockdown-config',
      key: 'reset'
    }
  ];

  return (
    <section id="deployment" style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <span className="badge badge-purple" style={{ marginBottom: '12px', fontSize: '11px', textTransform: 'uppercase' }}>
            Enterprise IT & Store Operations
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Ready for Automated Store Fleet Rollouts
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            From a single indie coffee shop counter to a national 500-store retail chain, Lockdown Browser supports silent scripting, pre-provisioning, and Windows Assigned Access.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          {steps.map((s) => (
            <div key={s.key} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--accent-purple)', fontFamily: 'monospace', fontWeight: 800, fontSize: '14px' }}>
                    {s.num}.
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{s.title}</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {s.desc}
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <pre className="code-block" style={{ margin: 0, padding: '14px 16px', paddingRight: '80px', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  <code>{s.code}</code>
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(s.code, s.key)}
                  className="btn btn-secondary"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    height: '28px',
                    borderRadius: '9999px'
                  }}
                  title="Copy command to clipboard"
                >
                  {copiedKey === s.key ? (
                    <>
                      <CheckIcon size={12} />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={12} />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Windows Assigned Access Guide */}
        <div className="card" style={{ marginTop: '32px', backgroundColor: 'var(--bg-contrast)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>Recommended for Kiosks</span>
              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                Windows 10/11 Pro & Enterprise "Assigned Access" Kiosk Mode
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Combine Lockdown Browser with Windows Assigned Access or Shell Launcher. When configured, Windows logs directly into a dedicated kiosk user account and runs Lockdown Browser as the default Windows shell (replacing <code style={{ color: 'var(--accent-blue)' }}>explorer.exe</code>). The user cannot access desktop icons, task managers, or system settings even if rebooted.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href="#docs"
                className="btn btn-outline"
                style={{ padding: '8px 18px', fontSize: '12px' }}
              >
                View Kiosk Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};