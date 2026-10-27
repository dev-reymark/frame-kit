import React from 'react';
import { PortalView } from './Navbar';
import { DownloadIcon, CheckIcon, MonitorIcon, SmartphoneIcon } from './icons';

interface PlatformsProps {
  onNavigateView?: (view: PortalView) => void;
}

export const Platforms: React.FC<PlatformsProps> = ({ onNavigateView }) => {
  const platformTargets = [
    {
      id: 'windows',
      name: 'Windows',
      badge: 'v1.0.0 Stable',
      badgeClass: 'badge-blue',
      icon: MonitorIcon,
      runtime: 'Electron 44 + Chromium',
      formats: '.exe (NSIS Installer) & Portable',
      description:
        'Native Windows desktop integration with single-instance mutex, taskbar suppression, and Windows Assigned Access kiosk compatibility.',
      highlights: [
        'Windows 10, 11, IoT Enterprise & Server',
        'Silent unattended rollout (/S flag)',
        'Ctrl+Shift+Alt+K protected admin unlock',
        'Bundled offline markdown documentation'
      ],
      actionText: 'Download Windows .exe',
      href: 'https://github.com/dev-reymark/frame-kit/releases/download/v1.0.0/FrameKit.Setup.1.0.0.exe'
    },
    {
      id: 'macos',
      name: 'macOS',
      badge: 'Universal Binary',
      badgeClass: 'badge-emerald',
      icon: MonitorIcon,
      runtime: 'Electron 44 + macOS Native',
      formats: '.dmg & .zip (arm64 + x64)',
      description:
        'Standalone container for Apple Silicon (M1–M4) and Intel Macs with native Command-key shortcut interception and Single App Mode support.',
      highlights: [
        'macOS Sequoia, Sonoma, Ventura & Monterey',
        'Universal arm64 and x64 architecture',
        'Cmd+Option+Shift+K admin accelerator',
        'Suppresses Cmd+Q, Cmd+W, and Cmd+R'
      ],
      actionText: 'View macOS Release',
      href: 'https://github.com/dev-reymark/frame-kit/releases/tag/v1.0.0'
    },
    {
      id: 'android',
      name: 'Android',
      badge: 'Lock Task Mode',
      badgeClass: 'badge-purple',
      icon: SmartphoneIcon,
      runtime: 'Capacitor 8 + Android WebView',
      formats: '.apk & .aab (Direct / MDM)',
      description:
        'Dedicated tablet and mobile POS shell. Uses Android Lock Task Mode to pin the viewport and suppress Home and Recents navigation.',
      highlights: [
        'Android 8.0+ tablets & mobile terminals',
        'Hardware-pinned Lock Task containment',
        'Cleartext LAN HTTP support for local POS',
        '3-finger gesture & back-button admin menu'
      ],
      actionText: 'Download Android .apk',
      href: '/FrameKit.apk',
      downloadName: 'FrameKit.apk'
    }
  ];

  return (
    <section id="platforms">
      <div className="section-header-bar">
        <div>
          <h2 className="section-title">Cross-Platform Native Runtimes</h2>
          <p className="section-subtitle">
            One unified configuration schema across Windows desktop terminals, macOS workstations, and Android tablets.
          </p>
        </div>
        {onNavigateView && (
          <button
            type="button"
            onClick={() => onNavigateView('downloads')}
            className="btn btn-ghost btn-sm"
          >
            <span>All Releases &amp; Checksums &rarr;</span>
          </button>
        )}
      </div>

      <div className="grid-3">
        {platformTargets.map((platform) => {
          const IconComponent = platform.icon;
          return (
            <div
              key={platform.id}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconComponent size={17} />
                    <h3 className="card-title">{platform.name}</h3>
                  </div>
                  <span className={`badge ${platform.badgeClass}`}>{platform.badge}</span>
                </div>

                <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px'
                    }}
                  >
                    <div>RUNTIME: {platform.runtime}</div>
                    <div>PACKAGE: {platform.formats}</div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {platform.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {platform.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)' }}
                      >
                        <CheckIcon size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <a
                  href={platform.href}
                  download={platform.downloadName}
                  target={platform.downloadName ? undefined : '_blank'}
                  rel={platform.downloadName ? undefined : 'noreferrer'}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%' }}
                >
                  <DownloadIcon size={14} />
                  <span>{platform.actionText}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
