import React, { useState } from 'react';
import { DownloadIcon, CopyIcon, CheckIcon } from './icons';

export const Releases: React.FC = () => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const sha256 = 'EE3F5441C2B9A513B61AA06A6C949ED367B52DF2327843DA85A625939E0561EB';
  const verifyCmd = 'Get-FileHash -Algorithm SHA256 ".\\FrameKit.Setup.1.0.0.exe"';

  const copyHash = () => {
    navigator.clipboard.writeText(sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const copyCmd = () => {
    navigator.clipboard.writeText(verifyCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const githubReleaseUrl = 'https://github.com/dev-reymark/frame-kit/releases/tag/v1.0.0';
  const directWindowsExeUrl = 'https://github.com/dev-reymark/frame-kit/releases/download/v1.0.0/FrameKit.Setup.1.0.0.exe';
  const directAndroidApkUrl = '/FrameKit.apk';

  return (
    <section id="releases" style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '12px', fontSize: '11px', textTransform: 'uppercase' }}>
            Multi-Platform Releases
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Download FrameKit
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Production standalone binaries hosted on high-speed CDN.
          </p>
        </div>

        {/* Multi-Platform Download Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '960px', margin: '0 auto 24px auto' }}>
          {/* Windows Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-blue">Windows</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>107.4 MB</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Windows x64</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Windows 11, 10, Server & IoT Enterprise. Bundled with offline documentation.
              </p>
            </div>
            <a
              href={directWindowsExeUrl}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '13px' }}
            >
              <DownloadIcon size={16} />
              <span>Download .exe (Installer)</span>
            </a>
          </div>

          {/* macOS Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-emerald">macOS</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Universal</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>macOS (.dmg)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Apple Silicon (M1/M2/M3/M4) & Intel Macs. Native Cmd shortcut integration.
              </p>
            </div>
            <a
              href={githubReleaseUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', fontSize: '13px' }}
            >
              <DownloadIcon size={16} />
              <span>Download .dmg</span>
            </a>
          </div>

          {/* Android Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-purple">Android</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>4.0 MB</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Android (.apk)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Android tablets & mobile POS terminals. Direct standalone APK package.
              </p>
            </div>
            <a
              href={directAndroidApkUrl}
              download="FrameKit.apk"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '13px' }}
            >
              <DownloadIcon size={16} />
              <span>Download .apk (Direct)</span>
            </a>
          </div>
        </div>

        {/* Android Install Tip Banner */}
        <div style={{ maxWidth: '960px', margin: '0 auto 36px auto', padding: '14px 18px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>📲</span>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-primary)' }}>How to install on Android:</strong> Tap <strong>Download .apk</strong>. When download completes, tap <strong>Open</strong>. If Android asks for permission, tap <em>Settings &rarr; Turn on "Allow from this source"</em>, then tap <strong>Install</strong>.
          </div>
        </div>

        {/* Checksum Verification Box */}
        <div className="card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                WINDOWS INSTALLER SHA-256 CHECKSUM
              </span>
              <button
                type="button"
                onClick={copyHash}
                className="btn btn-secondary"
                style={{ padding: '4px 12px', height: '26px', fontSize: '11px' }}
              >
                {copiedHash ? (
                  <>
                    <CheckIcon size={12} />
                    <span>COPIED HASH</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={12} />
                    <span>COPY SHA-256</span>
                  </>
                )}
              </button>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent-emerald)', backgroundColor: 'var(--code-bg)', padding: '10px 14px', border: '1px solid var(--code-border)', borderRadius: '6px', wordBreak: 'break-all' }}>
              {sha256}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                PowerShell Integrity Verification:
              </span>
              <button
                type="button"
                onClick={copyCmd}
                className="btn btn-secondary"
                style={{ padding: '4px 12px', height: '26px', fontSize: '11px' }}
              >
                {copiedCmd ? (
                  <>
                    <CheckIcon size={12} />
                    <span>COPIED COMMAND</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={12} />
                    <span>COPY COMMAND</span>
                  </>
                )}
              </button>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)', backgroundColor: 'var(--code-bg)', padding: '10px 14px', border: '1px solid var(--code-border)', borderRadius: '6px', marginTop: '6px' }}>
              {verifyCmd}
            </div>
          </div>

          {/* Release Highlights */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              FrameKit v1.0.0 Architecture Highlights
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span>
                <span><strong>Zero-app-touch</strong>: Runs any target URL (localhost, LAN IP, or HTTPS domain).</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span>
                <span><strong>Triple Modes</strong>: Configurable Standard, Fullscreen, and Kiosk profiles.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span>
                <span><strong>PBKDF2-SHA512</strong>: 100,000 rounds salted key derivation for PIN protection.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span>
                <span><strong>Main-Process Intercept</strong>: Hardened navigation, popup, and shortcut guards.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span>
                <span><strong>Offline Resilience</strong>: Automated ping health check, retry loop & fallback screen.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span>
                <span><strong>Bundled Docs</strong>: Architecture, Security, Build, Config & Testing guides included.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};