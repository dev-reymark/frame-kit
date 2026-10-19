import React from 'react';
import { DownloadIcon } from './icons';

export const Platforms: React.FC = () => {
  const platforms = [
    {
      id: 'windows',
      name: 'Windows',
      badge: 'v1.0.0 Stable',
      tech: 'Electron + Chromium Native',
      formats: '.exe (NSIS Installer) & Portable',
      description: 'Native Windows desktop integration with single-instance mutex, taskbar containment, and Windows Assigned Access kiosk shell integration.',
      features: [
        'Windows 10, 11, IoT Enterprise, & Server',
        'Silent automated deployment (/S switch)',
        'Full keyboard shortcut & F12 suppression',
        'Automatic offline reconnect & crash recovery'
      ],
      actionText: 'Download .exe',
      actionHref: '#releases',
      accentColor: 'var(--accent-blue)'
    },
    {
      id: 'macos',
      name: 'macOS',
      badge: 'Universal Ready',
      tech: 'Electron + macOS Runtime',
      formats: '.dmg & .zip (Universal Binary)',
      description: 'Edge-to-edge standalone container for Apple Silicon (M1/M2/M3/M4) and Intel Macs, with Cmd-based admin unlock shortcuts.',
      features: [
        'macOS Sequoia, Sonoma, Ventura, & Monterey',
        'Universal arm64 and x64 native architecture',
        'Cmd+Option+Shift+K protected admin shortcut',
        'Suppresses Cmd+Q, Cmd+W, and Cmd+R'
      ],
      actionText: 'Download .dmg',
      actionHref: '#releases',
      accentColor: 'var(--accent-emerald)'
    },
    {
      id: 'android',
      name: 'Android',
      badge: 'Capacitor Kiosk',
      tech: 'Capacitor + Android WebView',
      formats: '.apk & .aab (Google Play / MDM)',
      description: 'Dedicated tablet and mobile POS shell. Leverages Android Lock Task Mode (COSU) to pin the app and disable system navigation buttons.',
      features: [
        'Android 8.0+ (Oreo through Android 15)',
        'Lock Task Mode (disables Home & Recents)',
        'Cleartext support for local LAN POS servers',
        'Portrait, Landscape, or Auto orientation'
      ],
      actionText: 'Get Android APK',
      actionHref: '#releases',
      accentColor: 'var(--accent-purple)'
    }
  ];

  return (
    <section id="platforms" style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '12px', fontSize: '11px', textTransform: 'uppercase' }}>
            Cross-Platform Distribution
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            One Codebase. Tailored Across Three Platforms.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Transform web applications into native standalone experiences on Windows desktop terminals, Mac manager workstations, and Android POS tablets.
          </p>
        </div>

        <div className="grid-3">
          {platforms.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 700 }}>{p.name}</h3>
                  <span className="badge" style={{ color: p.accentColor, borderColor: p.accentColor }}>{p.badge}</span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>
                  CORE: {p.tech}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '16px' }}>
                  FORMAT: {p.formats}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {p.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {p.features.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: p.accentColor, fontWeight: 700 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <a
                  href={p.actionHref}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '12px 20px', fontSize: '13px', fontWeight: 600 }}
                >
                  <DownloadIcon size={15} />
                  <span>{p.actionText}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};