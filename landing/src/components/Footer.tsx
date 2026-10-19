import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      backgroundColor: 'var(--footer-bg)',
      padding: '60px 0 30px 0',
      transition: 'background-color 200ms ease, border-color 200ms ease'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              {/* Rounded-full FrameKit Logo Badge */}
              <div className="logo-badge" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                FK
              </div>
              <span style={{ fontWeight: 800, fontSize: '15px' }}>FRAMEKIT</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Any website. Your app. A lightweight, cross-platform application that transforms websites into standalone, native-looking experiences.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px' }}>
              Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
              <a href="#modes" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Window Modes</a>
              <a href="#platforms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Cross-Platform</a>
              <a href="#deployment" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Fleet Deployment</a>
              <a href="#docs" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Documentation</a>
              <a href="#releases" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Releases & Checksums</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px' }}>
              Platforms
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
              <div>Windows 10/11 (Electron)</div>
              <div>macOS Universal (Electron)</div>
              <div>Android 8+ (Capacitor WebView)</div>
              <div>Standard • Fullscreen • Kiosk</div>
              <div>PBKDF2-SHA512 Security</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px' }}>
              Vercel Deployment
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              This landing page is ready to deploy directly on Vercel with zero server configuration.
            </p>
            <div style={{
              display: 'inline-block',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--accent-emerald)',
              backgroundColor: 'var(--code-bg)',
              padding: '6px 14px',
              border: '1px solid var(--border)',
              borderRadius: '9999px'
            }}>
              vercel --prod
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} FrameKit. Any website. Your app.
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>Windows • macOS • Android</span>
            <span>•</span>
            <span>React 19 + TypeScript + Vite 8</span>
          </div>
        </div>
      </div>
    </footer>
  );
};