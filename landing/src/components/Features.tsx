import React from 'react';
import {
  MonitorIcon,
  ShieldIcon,
  LockIcon,
  TerminalIcon,
  ActivityIcon,
  MaximizeIcon
} from './icons';

export const Features: React.FC = () => {
  const featureItems = [
    {
      icon: MonitorIcon,
      title: 'Zero Web App Changes',
      description:
        'Operates purely as an external native container. React, Next.js, Laravel, or legacy POS web apps run without SDKs or code changes.'
    },
    {
      icon: ShieldIcon,
      title: 'Main-Process Navigation Guard',
      description:
        'Unapproved external domains and popups are intercepted and denied at the Chromium main-process boundary via will-navigate and setWindowOpenHandler.'
    },
    {
      icon: LockIcon,
      title: 'PBKDF2-SHA512 Admin Lock',
      description:
        'Administrator credentials use 100,000 PBKDF2-SHA512 iterations with a 32-byte salt and enforce a 30-second lockout after 5 failed attempts.'
    },
    {
      icon: TerminalIcon,
      title: 'Shortcut & DevTools Suppression',
      description:
        'Blocks F12, Ctrl/Cmd+Shift+I, uncontrolled reloads, and browser history shortcuts directly at the Chromium input event layer.'
    },
    {
      icon: ActivityIcon,
      title: 'Localhost, LAN & Strict TLS',
      description:
        'Supports localhost, private store LAN subnets (192.168.x.x, 10.x.x.x), and public HTTPS origins with strict TLS certificate validation.'
    },
    {
      icon: MaximizeIcon,
      title: 'Offline Auto-Reconnect',
      description:
        'Detects network drops and renderer crashes, transitioning to a clean local diagnostic screen with a 15-second automatic retry loop.'
    }
  ];

  return (
    <section id="features">
      <div className="section-header-bar">
        <div>
          <h2 className="section-title">Core Platform Architecture</h2>
          <p className="section-subtitle">
            Engineered for point-of-sale counters, self-service kiosks, and dedicated enterprise workstations.
          </p>
        </div>
        <span className="badge">Process-Isolated</span>
      </div>

      <div className="grid-3">
        {featureItems.map((featureItem) => {
          const IconComponent = featureItem.icon;
          return (
            <div key={featureItem.title} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <IconComponent size={17} style={{ color: 'var(--text-primary)' }} />
                  <h3 className="card-title">{featureItem.title}</h3>
                </div>
              </div>
              <div className="card-content">
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {featureItem.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
