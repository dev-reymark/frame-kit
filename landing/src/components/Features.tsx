import React from 'react';

export const Features: React.FC = () => {
  const items = [
    {
      title: 'Zero Web App Changes',
      desc: 'Functions purely as an external native container. Your React, Next.js, Laravel, or legacy web application runs without a single line of code modification or plugin.'
    },
    {
      title: 'Cross-Platform Native Core',
      desc: 'Built with Electron for Windows & macOS, and Capacitor with native WebView for Android tablets. Deliver a consistent, unified experience across every screen.'
    },
    {
      title: 'Main-Process Navigation Guard',
      desc: 'Navigation to unapproved external domains and popups is intercepted and blocked at the native process level via will-navigate and setWindowOpenHandler.'
    },
    {
      title: 'Shortcut & Gesture Defense',
      desc: 'Suppresses developer tools (F12, Ctrl/Cmd+Shift+I), uncontrolled reloads, and navigation keys (Ctrl/Cmd+R, Ctrl/Cmd+N, Ctrl/Cmd+W) at the Chromium input level.'
    },
    {
      title: 'PBKDF2-SHA512 Admin Security',
      desc: 'Administrator PIN is derived with 100,000 PBKDF2 iterations and a unique 32-byte salt. Protected shortcut enforces an automatic 30-second lockout after 5 failed attempts.'
    },
    {
      title: 'Localhost, LAN IPs & Strict TLS',
      desc: 'Safely supports localhost:3000, private store LAN IPs (192.168.x.x, 10.x.x.x), and public HTTPS domains. Enforces SSL certificate validation for public domains.'
    }
  ];

  return (
    <section id="features" style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 50px auto' }}>
          <span className="badge badge-blue" style={{ marginBottom: '12px', fontSize: '11px', textTransform: 'uppercase' }}>
            FrameKit Architecture
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Everything You Need to Turn Websites into Native Apps
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Traditional browsers expose address bars, tabs, settings, and developer shortcuts. FrameKit seals the perimeter with native container containment.
          </p>
        </div>

        <div className="grid-3">
          {items.map((item, idx) => (
            <div key={idx} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}>
                  0{idx + 1}.
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{item.title}</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};