import React, { useState } from 'react';
import { DownloadIcon, CopyIcon, CheckIcon, ShieldIcon, SmartphoneIcon } from './icons';

export const Releases: React.FC = () => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const sha256Checksum = 'EE3F5441C2B9A513B61AA06A6C949ED367B52DF2327843DA85A625939E0561EB';
  const verifyCommand = 'Get-FileHash -Algorithm SHA256 ".\\FrameKit.Setup.1.0.0.exe"';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256Checksum);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(verifyCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const githubReleaseUrl = 'https://github.com/dev-reymark/frame-kit/releases/tag/v1.0.0';
  const directWindowsExeUrl =
    'https://github.com/dev-reymark/frame-kit/releases/download/v1.0.0/FrameKit.Setup.1.0.0.exe';
  const directAndroidApkUrl = '/FrameKit.apk';

  return (
    <section id="releases">
      <div className="section-header-bar">
        <div>
          <h2 className="section-title">Downloads &amp; Release Checksums</h2>
          <p className="section-subtitle">
            Standalone production binaries for Windows, macOS, and Android with cryptographic SHA-256 verification.
          </p>
        </div>
        <span className="badge badge-emerald">Release v1.0.0</span>
      </div>

      <div className="grid-3" style={{ marginBottom: '20px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <span className="card-title">Windows x64</span>
              <span className="badge badge-blue">107.4 MB</span>
            </div>
            <div className="card-content">
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                NSIS installer for Windows 10, Windows 11, Windows Server, and IoT Enterprise. Includes desktop shortcut registration and silent <code>/S</code> support.
              </p>
            </div>
          </div>
          <div className="card-footer">
            <a
              href={directWindowsExeUrl}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              <DownloadIcon size={14} />
              <span>Download .exe Installer</span>
            </a>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <span className="card-title">macOS Universal</span>
              <span className="badge badge-emerald">arm64 + x64</span>
            </div>
            <div className="card-content">
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Universal binary for Apple Silicon (M1/M2/M3/M4) and Intel Macs. Supports Command-key shortcut guards and MDM Single App Mode.
              </p>
            </div>
          </div>
          <div className="card-footer">
            <a
              href={githubReleaseUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
              style={{ width: '100%' }}
            >
              <DownloadIcon size={14} />
              <span>Download .dmg Release</span>
            </a>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <span className="card-title">Android Kiosk</span>
              <span className="badge badge-purple">4.0 MB APK</span>
            </div>
            <div className="card-content">
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Direct standalone APK package for Android 8.0+ tablets and mobile POS terminals with native Lock Task screen pinning.
              </p>
            </div>
          </div>
          <div className="card-footer">
            <a
              href={directAndroidApkUrl}
              download="FrameKit.apk"
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              <DownloadIcon size={14} />
              <span>Download .apk Direct</span>
            </a>
          </div>
        </div>
      </div>

      <div className="callout" style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <SmartphoneIcon size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Android APK Installation:</strong> Tap{' '}
          <strong>Download .apk Direct</strong> and open the package once downloaded. If prompted by Android security, allow installation from your browser source and tap <strong>Install</strong>.
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldIcon size={16} />
            <h3 className="card-title">Cryptographic Integrity Verification</h3>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            FrameKit.Setup.1.0.0.exe
          </span>
        </div>

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                SHA-256 Checksum
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="btn btn-secondary btn-sm"
                style={{ minHeight: '26px', padding: '2px 10px', fontSize: '11px' }}
              >
                {copiedHash ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                <span>{copiedHash ? 'Copied Hash' : 'Copy SHA-256'}</span>
              </button>
            </div>
            <div className="code-block" style={{ wordBreak: 'break-all', color: 'var(--success)', fontWeight: 600 }}>
              {sha256Checksum}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                PowerShell Verification Command
              </span>
              <button
                type="button"
                onClick={handleCopyCmd}
                className="btn btn-secondary btn-sm"
                style={{ minHeight: '26px', padding: '2px 10px', fontSize: '11px' }}
              >
                {copiedCmd ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                <span>{copiedCmd ? 'Copied Command' : 'Copy Command'}</span>
              </button>
            </div>
            <div className="code-block">
              <code>{verifyCommand}</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
