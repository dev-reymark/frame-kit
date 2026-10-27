import React, { useState } from 'react';
import { CopyIcon, CheckIcon, TerminalIcon, ShieldIcon } from './icons';

interface DeploymentProps {
  onOpenDocs?: (docName: string) => void;
}

export const Deployment: React.FC<DeploymentProps> = ({ onOpenDocs }) => {
  const [copiedCommandKey, setCopiedCommandKey] = useState<string | null>(null);

  const handleCopyCommand = (commandText: string, commandKey: string) => {
    navigator.clipboard.writeText(commandText);
    setCopiedCommandKey(commandKey);
    setTimeout(() => setCopiedCommandKey(null), 2000);
  };

  const deploymentSteps = [
    {
      stepCode: '01',
      title: '1. Silent Fleet Installation (SCCM / Intune / MDM)',
      subtitle: 'Windows NSIS CLI',
      description:
        'Deploy FrameKit silently across POS terminals and workstations without interactive prompts.',
      command: 'Start-Process -FilePath ".\\FrameKit.Setup.1.0.0.exe" -ArgumentList "/S" -Wait',
      key: 'silent_install'
    },
    {
      stepCode: '02',
      title: '2. Pre-Provisioned Configuration JSON',
      subtitle: '%APPDATA%\\framekit',
      description:
        'Distribute a pre-hashed framekit-config.json file across machines to boot directly into kiosk mode.',
      command:
        'Copy-Item -Path "\\\\server\\pos\\framekit-config.json" -Destination "$env:APPDATA\\framekit\\" -Force',
      key: 'pre_provision'
    },
    {
      stepCode: '03',
      title: '3. Windows Shell Launcher & Assigned Access',
      subtitle: 'OS Kiosk Hardening',
      description:
        'Configure FrameKit as the dedicated Windows Winlogon shell so operators never access explorer.exe.',
      command:
        'Set-ItemProperty -Path "HKLM:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" -Name "Shell" -Value "C:\\Program Files\\FrameKit\\FrameKit.exe"',
      key: 'shell_launcher'
    },
    {
      stepCode: '04',
      title: '4. Emergency Administrator Reset',
      subtitle: 'Recovery Procedure',
      description:
        'Remove the local configuration store if administrator credentials are lost to return to initial setup.',
      command: 'Remove-Item "$env:APPDATA\\framekit\\framekit-config.json" -Force',
      key: 'emergency_reset'
    }
  ];

  return (
    <section id="deployment">
      <div className="section-header-bar">
        <div>
          <h2 className="section-title">Automated Fleet Rollout &amp; Provisioning</h2>
          <p className="section-subtitle">
            Standardized PowerShell commands for silent deployment, configuration pre-seeding, and OS shell lockdown.
          </p>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          Windows 10/11 &bull; macOS MDM &bull; Android COSU
        </span>
      </div>

      <div className="grid-2">
        {deploymentSteps.map((step) => (
          <div key={step.key} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TerminalIcon size={16} />
                <h3 className="card-title">{step.title}</h3>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                {step.subtitle}
              </span>
            </div>

            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {step.description}
              </p>

              <div style={{ position: 'relative' }}>
                <pre
                  className="code-block"
                  style={{
                    margin: 0,
                    paddingRight: '76px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  <code>{step.command}</code>
                </pre>
                <button
                  type="button"
                  onClick={() => handleCopyCommand(step.command, step.key)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    minHeight: '26px',
                    padding: '2px 10px',
                    fontSize: '11px'
                  }}
                >
                  {copiedCommandKey === step.key ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                  <span>{copiedCommandKey === step.key ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '20px', backgroundColor: 'var(--bg-subtle)' }}>
        <div
          className="card-content"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldIcon size={15} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Defense-in-Depth Kiosk Hardening
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Pair FrameKit application containment with Windows Assigned Access, macOS Single App Mode, or Android Lock Task Mode to block OS-level task switching on unattended public kiosks.
            </p>
          </div>

          {onOpenDocs && (
            <button
              type="button"
              onClick={() => onOpenDocs('SECURITY.md')}
              className="btn btn-outline btn-sm"
            >
              <span>Read Security Architecture &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
